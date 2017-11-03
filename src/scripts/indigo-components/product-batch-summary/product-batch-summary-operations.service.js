angular
    .module('indigoeln.componentsModule')
    .factory('productBatchSummaryOperations', productBatchSummaryOperations);

/* @ngInject */
function productBatchSummaryOperations($q, productBatchSummaryCache, registrationUtil, stoichTableCache, appValues,
                                       notifyService, $timeout, entitiesBrowser, registrationService, sdImportService,
                                       sdExportService, alertModal, $http, $stateParams, notebookService, calculationService,
                                       apiUrl, $document) {
    var curNbkOperation = $q.when();

    return {
        exportSDFile: exportSDFile,
        getSelectedNonEditableBatches: getSelectedNonEditableBatches,
        duplicateBatches: chainPromises(duplicateBatches),
        duplicateBatch: chainPromises(duplicateBatch),
        getIntendedNotInActual: getIntendedNotInActual,
        syncWithIntendedProducts: syncWithIntendedProducts,
        addNewBatch: chainPromises(addNewBatch),
        importSDFile: chainPromises(importSDFile),
        registerBatches: registerBatches,
        deleteBatches: deleteBatches
    };

    function downloadLink(filePath) {
        var a = $document[0].createElement('A');
        a.href = filePath;
        a.download = filePath.substr(filePath.lastIndexOf('/') + 1);
        $document[0].body.appendChild(a);
        a.click();
        $document[0].body.removeChild(a);
    }

    function exportSDFile(exportBatches) {
        var selectedBatches = !_.isArray(exportBatches) ?
            [exportBatches] :
            _.filter(exportBatches, '$$select');

        sdExportService.exportItems(selectedBatches).then(function(data) {
            downloadLink(apiUrl + 'sd/download?fileName=' + data.fileName);
        });
    }

    function getSelectedNonEditableBatches(batches) {
        return _
            .chain(batches)
            .filter(function(item) {
                return registrationUtil.isRegistered(item);
            })
            .map(function(item) {
                return item.fullNbkBatch;
            })
            .value();
    }

    function chainPromises(fn) {
        return function() {
            var args = arguments;
            curNbkOperation = curNbkOperation.then(function() {
                return fn.apply(this, args);
            }, function() {
                return fn.apply(this, args);
            });

            return curNbkOperation;
        };
    }

    function updateNbkBatches(batches) {
        var experiment = entitiesBrowser.getCurrentEntity();

        return notebookService.get({
            projectId: $stateParams.projectId,
            notebookId: $stateParams.notebookId
        })
            .$promise
            .then(function(notebook) {
                var promise = $q.when();
                _.forEach(batches, function(batch) {
                    promise = promise
                        .then(function(beforeBatch) {
                            return requestNbkBatchNumber(beforeBatch).then(function(batchNumber) {
                                setNbkBatch(batch, batchNumber, notebook.name, experiment.name);

                                return batchNumber;
                            });
                        });
                });

                return promise;
            });
    }

    function duplicateBatches(batchesQueueToAdd, isSyncWithIntended) {
        var promises = _.map(batchesQueueToAdd, function(batch) {
            return createBatch(angular.copy(batch), isSyncWithIntended);
        });

        return successAddedBatches(promises);
    }

    function successAddedBatches(promises) {
        return $q
            .all(promises)
            .then(function(batches) {
                return updateNbkBatches(batches)
                    .then(function() {
                        return batches;
                    });
            });
    }

    function duplicateBatch(batch) {
        if (!batch) {
            return null;
        }

        return duplicateBatches([batch]).then(function(batches) {
            return _.first(batches);
        });
    }

    function getIntendedNotInActual() {
        var stoichTable = stoichTableCache.getStoicTable();
        if (stoichTable) {
            var intended = stoichTable.products;
            var intendedCandidateHashes = _.map(intended, '$$batchHash');
            var actual = productBatchSummaryCache.getProductBatchSummary();
            var actualHashes = _.compact(_.map(actual, '$$batchHash'));
            _.each(intendedCandidateHashes, function(intendedCandidateHash, i) {
                removeItemFromBothArrays(intendedCandidateHash, actualHashes, intendedCandidateHashes, i);
            });
            var hashesToAdd = _.compact(intendedCandidateHashes);

            return _.map(hashesToAdd, function(hash) {
                return _.find(intended, {
                    '$$batchHash': hash
                });
            });
        }
    }

    function removeItemFromBothArrays(item, array1, array2, i) {
        if (_.includes(array1, item)) {
            array2[i] = null;
            array1[_.indexOf(array1, item)] = null;
        }
    }

    function syncWithIntendedProducts() {
        var batchesQueueToAdd = getIntendedNotInActual();
        var stoichTable = stoichTableCache.getStoicTable();

        if (stoichTable && stoichTable.products && stoichTable.products.length) {
            if (!batchesQueueToAdd.length) {
                alertModal.info('Product Batch Summary is synchronized', 'sm');
            } else {
                _.forEach(batchesQueueToAdd, function(batch) {
                    batch = _.extend(appValues.getDefaultBatch(), batch);
                });

                return duplicateBatches(batchesQueueToAdd, true);
            }
        }

        return $q.resolve([]);
    }

    function addNewBatch() {
        return createBatch().then(function(batch) {
            return updateNbkBatches([batch]).then(function() {
                return batch;
            });
        });
    }

    function importSDFile() {
        return sdImportService.importFile().then(function(sdUnits) {
            var promises = _.map(sdUnits, function(unit) {
                return createBatch(unit);
            });

            return successAddedBatches(promises).then(function(batches) {
                notifyService.info(batches.length + ' batches successfully imported');

                return batches;
            });
        });
    }

    function registerBatches(batches) {
        var nonEditableBatches = getSelectedNonEditableBatches(batches);
        if (!_.isEmpty(nonEditableBatches)) {
            notifyService.warning('Batch(es) ' + _.uniq(nonEditableBatches)
                .join(', ') + ' already have been registered.');

            return registerBatchesWith(batches, nonEditableBatches);
        }

        return registerBatchesWith(batches, []);
    }

    function requestNbkBatchNumber(lastNbkBatch) {
        var latest = lastNbkBatch || getLatestNbkBatch();
        var request = apiUrl + 'projects/' + $stateParams.projectId + '/notebooks/' + $stateParams.notebookId +
            '/experiments/' + $stateParams.experimentId + '/batch_number?latest=' + latest;

        return $http.get(request)
            .then(function(result) {
                return result.data.batchNumber;
            });
    }

    function setNbkBatch(batch, batchNumber, notebookName, experimentName) {
        batch.nbkBatch = batchNumber;
        batch.fullNbkBatch = notebookName + '-' + experimentName + '-' + batchNumber;
        batch.fullNbkImmutablePart = notebookName + '-' + experimentName + '-';

        return batch;
    }

    function createBatch(sdUnit, isSyncWithIntended) {
        var batch = appValues.getDefaultBatch();
        var stoichTable = stoichTableCache.getStoicTable();
        if (stoichTable) {
            _.extend(batch, angular.copy(calculationService.createBatch(stoichTable, true)));
        }

        _.extend(batch, sdUnit, {
            conversationalBatchNumber: undefined,
            registrationDate: undefined,
            registrationStatus: undefined
        });

        if (sdUnit) {
            if (isSyncWithIntended) {
                // to sync mapping of intended products with actual poducts
                batch.theoMoles = batch.mol;
                batch.theoWeight = batch.weight;
                // total moles can be calculated when total weight or total Volume are added, or manually
                batch.mol = null;
            }

            return $q
                .all([calculationService.recalculateSalt(batch),
                    checkImage(batch.structure)
                ])
                .then(function() {
                    return saveMolecule(batch.structure.molfile).then(function(structureId) {
                        batch.structure.structureId = structureId;
                    }, function() {
                        notifyService.error('Cannot save the structure!');
                    });
                })
                .then(function() {
                    return batch;
                });
        }

        return $q.when(batch);
    }

    function checkImage(structure) {
        if (structure.molfile && !structure.image) {
            return calculationService.getImageForStructure(structure.molfile, 'molecule').then(function(image) {
                structure.image = image;
            });
        }

        return $q.resolve();
    }

    function checkNonRemovableBatches(batches) {
        var nonEditableBatches = getSelectedNonEditableBatches(batches);
        if (!_.isEmpty(nonEditableBatches)) {
            notifyService.error('Following batches were registered or sent to registration and cannot be deleted: ' + _.uniq(nonEditableBatches)
                .join(', '));
        }
    }

    function deleteBatches(batches, batchesForRemove) {
        if (!_.isEmpty(batches) && !_.isEmpty(batchesForRemove)) {
            checkNonRemovableBatches(batches);

            _.remove(batches, function(batch) {
                return !registrationUtil.isRegistered(batch) && _.includes(batchesForRemove, batch);
            });
        }
    }

    function getLatestNbkBatch() {
        var batches = productBatchSummaryCache.getProductBatchSummary();
        var last = _.last(batches);

        return (last && last.nbkBatch) || 0;
    }

    function saveMolecule(mol) {
        if (mol) {
            return $http.post(apiUrl + 'bingodb/molecule/', mol).then(function(response) {
                return response.data;
            });
        }

        return $q.resolve();
    }

    function registerBatchesWith(batchesToRegister, excludes) {
        var batches = _.filter(batchesToRegister, function(row) {
            return !_.includes(excludes, row.fullNbkBatch);
        });
        var message = '';
        var notFullBatches = registrationUtil.getNotFullForRegistrationBatches(batches);
        if (notFullBatches.length) {
            _.each(notFullBatches, function(notFullBatch) {
                message = message + '<br><b>Batch ' + notFullBatch.nbkBatch + ':</b><br>' + notFullBatch.emptyFields.join('<br>');
            });
            alertModal.error(message);
        } else {
            var batchNumbers = _.map(batches, function(batch) {
                return batch.fullNbkBatch;
            });
            if (batchNumbers.length) {
                return saveAndRegister(batchNumbers);
            }
            notifyService.warning('No Batches was selected for Registration');
        }
    }

    function saveAndRegister(batchNumbers) {
        return entitiesBrowser.saveCurrentEntity()
            .then(function() {
                $timeout(function() {
                    registrationService.register({}, batchNumbers).$promise
                        .then(function() {
                            notifyService.success('Selected Batches successfully sent to Registration');
                        }, function() {
                            notifyService.error('ERROR! Selected Batches registration failed');
                        });
                }, 1000);
            });
    }
}

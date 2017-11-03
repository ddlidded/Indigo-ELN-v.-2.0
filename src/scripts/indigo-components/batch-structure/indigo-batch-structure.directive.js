(function() {
    angular
        .module('indigoeln.componentsModule')
        .directive('indigoBatchStructure', indigoBatchStructure);

    function indigoBatchStructure() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/indigo-components/batch-structure/batch-structure.html',
            scope: {
                selectedBatch: '=',
                selectedBatchTrigger: '=',
                isReadonly: '=',
                onChanged: '&'
            },
            controller: IndigoBatchStructureController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    /* @ngInject */
    function IndigoBatchStructureController(calculationService) {
        var vm = this;

        init();

        function init() {
            vm.onChangedStructure = onChangedStructure;
            bindEvents();
        }

        function bindEvents() {
        }

        function onChangedStructure(structure) {
            if (vm.selectedBatch) {
                vm.selectedBatch.structure = structure;
                vm.onChanged();
                updateBatchMolInfo();
            }
        }

        function getColumn(batch) {
            return batch.totalWeight.entered ? 'totalWeight' : 'mol';
        }

        function resetMolInfo(batch) {
            batch.formula = null;
            batch.molWeight = null;

            return calculationService.calculateProductBatch({
                row: batch, column: getColumn(batch)
            });
        }

        function updateBatchFormula(batch, molInfo) {
            batch.formula = molInfo.molecularFormula;
            batch.molWeight = batch.molWeight || {};
            batch.molWeight.value = molInfo.molecularWeight;

            return calculationService.calculateProductBatch({
                row: batch, column: getColumn(batch)
            });
        }

        function updateBatchMolInfo() {
            if (vm.selectedBatch.structure && vm.selectedBatch.structure.molfile) {
                return calculationService
                    .getMoleculeInfo(vm.selectedBatch)
                    .then(function(molInfo) {
                        return updateBatchFormula(vm.selectedBatch, molInfo);
                    }, resetMolInfo);
            }

            return resetMolInfo(vm.selectedBatch);
        }
    }
})();

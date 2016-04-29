/**
 * Created by Stepan_Litvinov on 3/15/2016.
 */
angular.module('indigoeln')
    .factory('selectService', function ($uibModal) {
        var setSelectValueAction = {
            action: function (id) {
                var that = this;
                $uibModal.open({
                    templateUrl: 'scripts/components/entities/template/components/common/table/select/set-select-value.html',
                    controller: 'SetSelectValueController',
                    size: 'sm',
                    resolve: {
                        name: function () {
                            return that.title;
                        },
                        values: function () {
                            return that.values;
                        }
                    }
                }).result.then(function (result) {
                    _.each(that.rows, function (item) {
                        item[id] = item[id] || {};
                        item[id].name = result.name;
                    });
                }, function () {

                });
            }

        };
        return {
            processColumns: function (columns, rows) {
                _.each(columns, function (column) {
                    if (column.type === 'select' && !column.hideSelectValue) {
                        column.actions = (column.actions || [])
                            .concat([_.extend({}, setSelectValueAction, {
                                name: 'Set value for ' + column.name,
                                title: column.name,
                                values: column.values(),
                                rows: rows
                            })]);
                    }
                });
            }
        };
    });
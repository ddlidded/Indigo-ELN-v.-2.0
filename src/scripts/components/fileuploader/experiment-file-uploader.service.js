angular
    .module('indigoeln')
    .factory('experimentFileUploaderService', experimentFileUploaderService);

/* @ngInject */
function experimentFileUploaderService($resource, apiUrl) {
    return $resource(apiUrl + 'experiment_files/:id', {}, {
        query: {
            method: 'GET', isArray: true
        },
        get: {
            method: 'GET',
            transformResponse: angular.fromJson
        },
        save: {
            method: 'POST'
        },
        update: {
            method: 'PUT'
        },
        delete: {
            method: 'DELETE'
        }
    });
}

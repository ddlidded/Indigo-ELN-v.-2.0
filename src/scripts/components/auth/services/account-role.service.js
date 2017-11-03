angular
    .module('indigoeln')
    .factory('accountRole', function($resource, apiUrl) {
        return $resource(apiUrl + 'accounts/account/roles', {}, {
            query: {
                method: 'GET', isArray: true
            }
        });
    });

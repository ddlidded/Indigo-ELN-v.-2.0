(function() {
    angular
        .module('indigoeln')
        .controller('PermissionViewManagementController', PermissionViewManagementController);

    /* @ngInject */
    function PermissionViewManagementController($uibModalInstance, permissionManagementService) {
        var vm = this;

        vm.accessList = permissionManagementService.getAccessList();
        vm.entity = permissionManagementService.getEntity();

        vm.close = close;

        function close() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();

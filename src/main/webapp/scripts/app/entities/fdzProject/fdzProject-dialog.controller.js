'use strict';

angular.module('metadatamanagementApp').controller('FdzProjectDialogController',
    ['$scope', '$stateParams', '$uibModalInstance', 'entity',
      'FdzProject', 'isCreateMode',
        function($scope, $stateParams, $uibModalInstance, entity,
          FdzProject, isCreateMode) {
          $scope.isCreateMode = isCreateMode;

          if (isCreateMode) {
            $scope.fdzProject = new FdzProject();
          } else {
            $scope.fdzProject = entity;
          }

          var onSaveFinished = function(result) {
            $uibModalInstance.close(result);
            $scope.isSaving = false;
          };

          var onSaveError = function() {
            $scope.isSaving = false;
          };

          $scope.save = function() {
            $scope.isSaving = true;
            if (isCreateMode) {
              $scope.fdzProject.$create(onSaveFinished, onSaveError);
            } else {
              $scope.fdzProject.$update(onSaveFinished, onSaveError);
            }
          };

          $scope.clear = function() {
            $uibModalInstance.dismiss('cancel');
          };
        }]);

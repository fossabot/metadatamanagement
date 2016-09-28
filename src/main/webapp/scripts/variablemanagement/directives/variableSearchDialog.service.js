/* global document*/

'use strict';
angular.module('metadatamanagementApp').service('VariableSearchDialogService',
  function($mdDialog, blockUI, VariableSearchResource) {
    var variables = [];
    var showDialog = function() {
      var dialogParent = angular.element(document.body);
      $mdDialog.show({
        controller: 'VariableSearchDialogController',
        parent: dialogParent,
        clickOutsideToClose: true,
        locals: {
          variables: variables
        },
        templateUrl: 'scripts/variablemanagement/' +
        'directives/variableSearchDialog.html.tmpl',
      });
    };
    var findByQuestionId = function(questionId) {
      blockUI.start();
      VariableSearchResource.findByQuestionId(questionId)
      .then(function(items) {
        variables = items.hits.hits;
        blockUI.stop();
        showDialog();
      });
    };
    return {
      findByQuestionId: findByQuestionId
    };
  });
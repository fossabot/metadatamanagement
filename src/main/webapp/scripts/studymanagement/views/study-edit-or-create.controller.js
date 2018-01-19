/* global _, bowser*/
'use strict';

angular.module('metadatamanagementApp')
  .controller('StudyEditOrCreateController',
    function(entity, PageTitleService, $document, $timeout,
      $state, ToolbarHeaderService, Principal, SimpleMessageToastService,
      CurrentProjectService, StudyIdBuilderService, StudyResource, $scope,
      ElasticSearchAdminService, $mdDialog, $transitions,
      CommonDialogsService, LanguageService, StudySearchService,
      StudyAttachmentResource, $q) {

      var ctrl = this;
      var surveySeriesCache = {};

      var updateToolbarHeaderAndPageTitle = function() {
        if (ctrl.createMode) {
          PageTitleService.setPageTitle(
            'study-management.edit.create-page-title', {
            studyId: ctrl.study.id
          });
        } else {
          PageTitleService.setPageTitle(
            'study-management.edit.edit-page-title', {
            studyId: ctrl.study.id
          });
        }
        ToolbarHeaderService.updateToolbarHeader({
          'stateName': $state.current.name,
          'id': ctrl.study.id,
          'studyId': ctrl.study.id,
          'studyIsPresent': !ctrl.createMode,
          'projectId': ctrl.study.dataAcquisitionProjectId,
          'enableLastItem': true
        });
      };

      var init = function() {
        if (Principal.hasAuthority('ROLE_PUBLISHER')) {
          if (!bowser.msie) {
            if (entity) {
              entity.$promise.then(function(study) {
                ctrl.createMode = false;
                ctrl.study = study;
                ctrl.loadAttachments();
                updateToolbarHeaderAndPageTitle();
                $scope.registerConfirmOnDirtyHook();
              });
            } else {
              if (CurrentProjectService.getCurrentProject() &&
              !CurrentProjectService.getCurrentProject().release) {
                StudyResource.get({
                  id: StudyIdBuilderService.buildStudyId(
                    CurrentProjectService.getCurrentProject().id)
                }).$promise.then(function(study) {
                    ctrl.createMode = false;
                    ctrl.study = study;
                    ctrl.loadAttachments();
                    updateToolbarHeaderAndPageTitle();
                    $scope.registerConfirmOnDirtyHook();
                  }).catch(function() {
                        ctrl.createMode = true;
                        ctrl.study = new StudyResource({
                          id: StudyIdBuilderService.buildStudyId(
                            CurrentProjectService.getCurrentProject().id),
                          dataAcquisitionProjectId:
                          CurrentProjectService.getCurrentProject().id,
                          authors: [{firstName: '', lastName: ''}],
                          doi: StudyIdBuilderService.buildDoi(
                            CurrentProjectService.getCurrentProject().id)
                        });
                        updateToolbarHeaderAndPageTitle();
                        $scope.registerConfirmOnDirtyHook();
                      });
              } else {
                SimpleMessageToastService.openSimpleMessageToast(
                  'study-management.edit.choose-unreleased-project-toast');
                $timeout(function() {
                  $state.go('search', {
                    lang: LanguageService.getCurrentInstantly(),
                    type: 'studies'
                  });
                }, 1000);
              }
            }
          } else {
            SimpleMessageToastService.openSimpleMessageToast(
              'global.edit.internet-explorer-not-supported');
          }
        } else {
          SimpleMessageToastService.openSimpleMessageToast(
          'study-management.edit.not-authorized-toast');
        }
      };

      ctrl.dataAvailabilities = [
        {de: 'Verfügbar', en: 'Available'},
        {de: 'In Aufbereitung', en: 'In preparation'},
        {de: 'Nicht verfügbar', en: 'Not available'}
      ];

      ctrl.surveyDesigns = [
        {de: 'Panel', en: 'Panel'},
        {de: 'Querschnitt', en: 'Cross-Section'}
      ];

      ctrl.deleteAuthor = function(index) {
        ctrl.study.authors.splice(index, 1);
        $scope.studyForm.$setDirty();
      };

      ctrl.addAuthor = function() {
        ctrl.study.authors.push({firstName: '', lastName: ''});
        $timeout(function() {
          $document.find('input[name="authorsFirstName_' +
            (ctrl.study.authors.length - 1) + '"]')
            .focus();
        });
      };

      ctrl.setCurrentAuthor = function(index, event) {
        ctrl.currentAuthorInputName = event.target.name;
        ctrl.currentAuthorIndex = index;
      };

      ctrl.deleteCurrentAuthor = function(event) {
        if (event.relatedTarget && (
          event.relatedTarget.id === 'move-author-up-button' ||
          event.relatedTarget.id === 'move-author-down-button')) {
          return;
        }
        delete ctrl.currentAuthorIndex;
      };

      ctrl.moveCurrentAuthorUp = function() {
        var a = ctrl.study.authors[ctrl.currentAuthorIndex - 1];
        ctrl.study.authors[ctrl.currentAuthorIndex - 1] =
          ctrl.study.authors[ctrl.currentAuthorIndex];
        ctrl.study.authors[ctrl.currentAuthorIndex] = a;
        ctrl.currentAuthorInputName = ctrl.currentAuthorInputName
          .replace('_' + ctrl.currentAuthorIndex,
            '_' + (ctrl.currentAuthorIndex - 1));
        $document.find('input[name="' + ctrl.currentAuthorInputName + '"]')
          .focus();
        $scope.studyForm.$setDirty();
      };

      ctrl.moveCurrentAuthorDown = function() {
        var a = ctrl.study.authors[ctrl.currentAuthorIndex + 1];
        ctrl.study.authors[ctrl.currentAuthorIndex + 1] =
          ctrl.study.authors[ctrl.currentAuthorIndex];
        ctrl.study.authors[ctrl.currentAuthorIndex] = a;
        ctrl.currentAuthorInputName = ctrl.currentAuthorInputName
          .replace('_' + ctrl.currentAuthorIndex,
            '_' + (ctrl.currentAuthorIndex + 1));
        $document.find('input[name="' + ctrl.currentAuthorInputName + '"]')
          .focus();
        $scope.studyForm.$setDirty();
      };

      ctrl.saveStudy = function() {
        if ($scope.studyForm.$valid) {
          ctrl.study.$save()
          .then(ctrl.updateElasticSearchIndex)
          .then(ctrl.onSavedSuccessfully)
          .catch(function(error) {
              console.log(error);
              SimpleMessageToastService.openSimpleMessageToast(
                'study-management.edit.error-on-save-toast',
                {studyId: ctrl.study.id});
            });
        } else {
          // ensure that all validation errors are visible
          angular.forEach($scope.studyForm.$error, function(field) {
            angular.forEach(field, function(errorField) {
              errorField.$setTouched();
            });
          });
          SimpleMessageToastService.openSimpleMessageToast(
            'study-management.edit.study-has-validation-errors-toast',
            null, true);
        }
      };

      ctrl.updateElasticSearchIndex = function() {
        return ElasticSearchAdminService.processUpdateQueue('studies');
      };

      ctrl.onSavedSuccessfully = function() {
        $scope.studyForm.$setPristine();
        SimpleMessageToastService.openSimpleMessageToast(
          'study-management.edit.success-on-save-toast',
          {studyId: ctrl.study.id}, true);
        if (ctrl.createMode) {
          $state.go('studyEdit', {id: ctrl.study.id});
        }
      };

      ctrl.openRestorePreviousVersionDialog = function(event) {
        $mdDialog.show({
            controller: 'ChoosePreviousStudyVersionController',
            templateUrl: 'scripts/studymanagement/' +
              'views/choose-previous-study-version.html.tmpl',
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
              studyId: ctrl.study.id
            },
            targetEvent: event
          })
          .then(function(studyWrapper) {
            ctrl.study = new StudyResource(studyWrapper.study);
            if (studyWrapper.isCurrentVersion) {
              $scope.studyForm.$setPristine();
              SimpleMessageToastService.openSimpleMessageToast(
                'study-management.edit.current-version-restored-toast',
                {
                  studyId: ctrl.study.id
                }, true);
            } else {
              $scope.studyForm.$setDirty();
              SimpleMessageToastService.openSimpleMessageToast(
                'study-management.edit.previous-version-restored-toast',
                {
                  studyId: ctrl.study.id
                }, true);
            }
          });
      };

      $scope.registerConfirmOnDirtyHook = function() {
        var unregisterTransitionHook = $transitions.onBefore({}, function() {
          if ($scope.studyForm.$dirty || ctrl.attachmentOrderIsDirty) {
            return CommonDialogsService.showConfirmOnDirtyDialog();
          }
        });

        $scope.$on('$destroy', unregisterTransitionHook);
      };

      $scope.searchSurveySeries = function(searchText, language) {
        if (searchText === surveySeriesCache.searchText &&
          language === surveySeriesCache.language) {
          return surveySeriesCache.searchResult;
        }

        //Search Call to Elasticsearch
        return StudySearchService.findSurveySeries(searchText, {},
          language)
          .then(function(surveySeries) {
            surveySeriesCache.searchText = searchText;
            surveySeriesCache.language = language;
            surveySeriesCache.searchResult = surveySeries;
            return surveySeries;
          }
        );
      };

      ctrl.loadAttachments = function(selectLastAttachment) {
        StudyAttachmentResource.findByStudyId({
            studyId: ctrl.study.id
          }).$promise.then(
            function(attachments) {
              if (attachments.length > 0) {
                ctrl.attachments = attachments;
                if (selectLastAttachment) {
                  ctrl.currentAttachmentIndex = attachments.length - 1;
                }
              }
            });
      };

      ctrl.deleteAttachment = function(attachment, index) {
        CommonDialogsService.showConfirmFileDeletionDialog(attachment.fileName)
        .then(function() {
          attachment.$delete().then(function() {
            SimpleMessageToastService.openSimpleMessageToast(
              'study-management.detail.attachments.attachment-deleted-toast',
              {filename: attachment.fileName},
              true
            );
            ctrl.attachments.splice(index, 1);
            delete ctrl.currentAttachmentIndex;
          });
        });
      };

      ctrl.editAttachment = function(attachment, event) {
        $mdDialog.show({
            controller: 'StudyAttachmentEditOrCreateController',
            controllerAs: 'ctrl',
            templateUrl: 'scripts/studymanagement/' +
              'views/study-attachment-edit-or-create.html.tmpl',
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
              studyAttachmentMetadata: attachment
            },
            targetEvent: event
          }).then(function() {
          ctrl.loadAttachments();
        });
      };

      ctrl.getNextIndexInStudy = function() {
        if (!ctrl.attachments || ctrl.attachments.length === 0) {
          return 0;
        }
        return _.maxBy(ctrl.attachments, function(attachment) {
          return attachment.indexInStudy;
        }).indexInStudy + 1;
      };

      ctrl.addAttachment = function(event) {
        $mdDialog.show({
            controller: 'StudyAttachmentEditOrCreateController',
            controllerAs: 'ctrl',
            templateUrl: 'scripts/studymanagement/' +
              'views/study-attachment-edit-or-create.html.tmpl',
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
              studyAttachmentMetadata: {
                indexInStudy: ctrl.getNextIndexInStudy(),
                studyId: ctrl.study.id,
                dataAcquisitionProjectId: ctrl.study.dataAcquisitionProjectId
              }
            },
            targetEvent: event
          }).then(function() {
          ctrl.loadAttachments(true);
        });
      };

      ctrl.moveAttachmentUp = function() {
        var a = ctrl.attachments[ctrl.currentAttachmentIndex - 1];
        ctrl.attachments[ctrl.currentAttachmentIndex - 1] =
          ctrl.attachments[ctrl.currentAttachmentIndex];
        ctrl.attachments[ctrl.currentAttachmentIndex] = a;
        ctrl.currentAttachmentIndex--;
        ctrl.attachmentOrderIsDirty = true;
      };

      ctrl.moveAttachmentDown = function() {
        var a = ctrl.attachments[ctrl.currentAttachmentIndex + 1];
        ctrl.attachments[ctrl.currentAttachmentIndex + 1] =
          ctrl.attachments[ctrl.currentAttachmentIndex];
        ctrl.attachments[ctrl.currentAttachmentIndex] = a;
        ctrl.currentAttachmentIndex++;
        ctrl.attachmentOrderIsDirty = true;
      };

      ctrl.saveAttachmentOrder = function() {
        var promises = [];
        ctrl.attachments.forEach(function(attachment, index) {
          attachment.indexInStudy = index;
          promises.push(attachment.$save());
        });
        $q.all(promises).then(function() {
          SimpleMessageToastService.openSimpleMessageToast(
          'study-management.detail.attachments.attachment-order-saved-toast',
          {}, true);
          ctrl.attachmentOrderIsDirty = false;
        });
      };

      ctrl.selectAttachment = function(index) {
        if (Principal.hasAuthority('ROLE_PUBLISHER')) {
          ctrl.currentAttachmentIndex = index;
        }
      };

      init();
    });
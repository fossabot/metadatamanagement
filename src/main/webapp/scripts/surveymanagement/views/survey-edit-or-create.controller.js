/* global _, bowser, Blob*/
'use strict';

angular.module('metadatamanagementApp')
  .controller('SurveyEditOrCreateController',
    function(entity, PageTitleService, $timeout,
      $state, ToolbarHeaderService, Principal, SimpleMessageToastService,
      CurrentProjectService, SurveyIdBuilderService, SurveyResource, $scope,
      ElasticSearchAdminService, $mdDialog, $transitions, StudyResource,
      CommonDialogsService, LanguageService, AvailableSurveyNumbersResource,
      SurveyAttachmentResource, $q, StudyIdBuilderService, moment, Upload,
      SurveyResponseRateImageUploadService) {
      var ctrl = this;
      var updateToolbarHeaderAndPageTitle = function() {
        if (ctrl.createMode) {
          PageTitleService.setPageTitle(
            'survey-management.edit.create-page-title', {
            surveyId: ctrl.survey.id
          });
        } else {
          PageTitleService.setPageTitle(
            'survey-management.edit.edit-page-title', {
            surveyId: ctrl.survey.id
          });
        }
        StudyResource.get({id: ctrl.survey.studyId}).$promise
          .then(function(study) {
          ToolbarHeaderService.updateToolbarHeader({
            'stateName': $state.current.name,
            'id': ctrl.survey.id,
            'studyId': ctrl.survey.studyId,
            'number': ctrl.survey.number,
            'studyIsPresent': study != null,
            'projectId': ctrl.survey.dataAcquisitionProjectId,
            'enableLastItem': !ctrl.createMode
          });
        }).catch(function() {
          ToolbarHeaderService.updateToolbarHeader({
            'stateName': $state.current.name,
            'id': ctrl.survey.id,
            'studyId': ctrl.survey.studyId,
            'number': ctrl.survey.number,
            'studyIsPresent': false,
            'projectId': ctrl.survey.dataAcquisitionProjectId,
            'enableLastItem': !ctrl.createMode
          });
        });
      };

      var init = function() {
        if (Principal.hasAuthority('ROLE_PUBLISHER')) {
          if (!bowser.msie) {
            if (entity) {
              entity.$promise.then(function(survey) {
                ctrl.createMode = false;
                ctrl.survey = survey;
                ctrl.loadAttachments();
                updateToolbarHeaderAndPageTitle();
                $scope.registerConfirmOnDirtyHook();
                SurveyResponseRateImageUploadService.getImage(
                  ctrl.survey.id, ctrl.survey.number, 'en')
                  .then(function(image) {
                    ctrl.responseRateImageEn = new Blob(
                      [image],{type: 'image/svg+xml'});
                  });
                SurveyResponseRateImageUploadService.getImage(
                  ctrl.survey.id, ctrl.survey.number, 'de')
                  .then(function(image) {
                    ctrl.responseRateImageDe = new Blob(
                      [image],{type: 'image/svg+xml'});
                  });
              });
            } else {
              if (CurrentProjectService.getCurrentProject() &&
              !CurrentProjectService.getCurrentProject().release) {
                ctrl.createMode = true;
                AvailableSurveyNumbersResource.get({
                  id: CurrentProjectService.getCurrentProject().id
                }).$promise.then(
                    function(surveyNumbers) {
                      if (surveyNumbers.length === 1) {
                        ctrl.survey = new SurveyResource({
                          id: SurveyIdBuilderService.buildSurveyId(
                            CurrentProjectService.getCurrentProject().id,
                            surveyNumbers[0]
                          ),
                          number: surveyNumbers[0],
                          dataAcquisitionProjectId:
                          CurrentProjectService.getCurrentProject().id,
                          studyId: StudyIdBuilderService.buildStudyId(
                            CurrentProjectService.getCurrentProject().id
                          ),
                          wave: 1
                        });
                        updateToolbarHeaderAndPageTitle();
                        $scope.registerConfirmOnDirtyHook();
                      } else {
                        $mdDialog.show({
                            controller: 'ChooseSurveyNumberController',
                            templateUrl: 'scripts/surveymanagement/' +
                              'views/choose-survey-number.html.tmpl',
                            clickOutsideToClose: false,
                            fullscreen: true,
                            locals: {
                              availableSurveyNumbers: surveyNumbers
                            }
                          })
                          .then(function(response) {
                            ctrl.survey = new SurveyResource({
                              id: SurveyIdBuilderService.buildSurveyId(
                                CurrentProjectService.getCurrentProject().id,
                                response.surveyNumber
                              ),
                              number: response.surveyNumber,
                              dataAcquisitionProjectId:
                              CurrentProjectService.getCurrentProject().id,
                              studyId: StudyIdBuilderService.buildStudyId(
                                CurrentProjectService.getCurrentProject().id
                              ),
                              wave: 1
                            });
                            updateToolbarHeaderAndPageTitle();
                            $scope.registerConfirmOnDirtyHook();
                          });
                      }
                    });
              } else {
                SimpleMessageToastService.openSimpleMessageToast(
                  'survey-management.edit.choose-unreleased-project-toast');
                $timeout(function() {
                  $state.go('search', {
                    lang: LanguageService.getCurrentInstantly(),
                    type: 'surveys'
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
          'survey-management.edit.not-authorized-toast');
        }
      };

      ctrl.saveSurvey = function() {
        if ($scope.surveyForm.$valid) {
          ctrl.survey.$save()
          .then(ctrl.updateElasticSearchIndex)
          .then(ctrl.onSavedSuccessfully)
          .catch(function(error) {
              console.log(error);
              SimpleMessageToastService.openSimpleMessageToast(
                'survey-management.edit.error-on-save-toast',
                {surveyId: ctrl.survey.id});
            });
        } else {
          // ensure that all validation errors are visible
          angular.forEach($scope.surveyForm.$error, function(field) {
            angular.forEach(field, function(errorField) {
              errorField.$setTouched();
            });
          });
          SimpleMessageToastService.openSimpleMessageToast(
            'survey-management.edit.survey-has-validation-errors-toast',
            null, true);
        }
      };

      ctrl.updateElasticSearchIndex = function() {
        return ElasticSearchAdminService.processUpdateQueue('surveys');
      };

      ctrl.onSavedSuccessfully = function() {
        $scope.surveyForm.$setPristine();
        SimpleMessageToastService.openSimpleMessageToast(
          'survey-management.edit.success-on-save-toast',
          {surveyId: ctrl.survey.id}, true);
        if (ctrl.createMode) {
          $state.go('surveyEdit', {id: ctrl.survey.id});
        }
      };

      ctrl.openRestorePreviousVersionDialog = function(event) {
        $mdDialog.show({
            controller: 'ChoosePreviousSurveyVersionController',
            templateUrl: 'scripts/surveymanagement/' +
              'views/choose-previous-survey-version.html.tmpl',
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
              surveyId: ctrl.survey.id
            },
            targetEvent: event
          })
          .then(function(surveyWrapper) {
            ctrl.survey = new SurveyResource(surveyWrapper.survey);
            if (surveyWrapper.isCurrentVersion) {
              $scope.surveyForm.$setPristine();
              SimpleMessageToastService.openSimpleMessageToast(
                'survey-management.edit.current-version-restored-toast',
                {
                  surveyId: ctrl.survey.id
                }, true);
            } else {
              $scope.surveyForm.$setDirty();
              SimpleMessageToastService.openSimpleMessageToast(
                'survey-management.edit.previous-version-restored-toast',
                {
                  surveyId: ctrl.survey.id
                }, true);
            }
          });
      };

      $scope.registerConfirmOnDirtyHook = function() {
        var unregisterTransitionHook = $transitions.onBefore({}, function() {
          if ($scope.surveyForm.$dirty || ctrl.attachmentOrderIsDirty ||
            ctrl.responseRateImageDeDirty || ctrl.responseRateImageEnDirty) {
            return CommonDialogsService.showConfirmOnDirtyDialog();
          }
        });

        $scope.$on('$destroy', unregisterTransitionHook);
      };

      ctrl.loadAttachments = function(selectLastAttachment) {
        SurveyAttachmentResource.findBySurveyId({
            surveyId: ctrl.survey.id
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
              'survey-management.detail.attachments.attachment-deleted-toast',
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
            controller: 'SurveyAttachmentEditOrCreateController',
            controllerAs: 'ctrl',
            templateUrl: 'scripts/surveymanagement/' +
              'views/survey-attachment-edit-or-create.html.tmpl',
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
              surveyAttachmentMetadata: attachment
            },
            targetEvent: event
          }).then(function() {
          ctrl.loadAttachments();
        });
      };

      ctrl.getNextIndexInSurvey = function() {
        if (!ctrl.attachments || ctrl.attachments.length === 0) {
          return 0;
        }
        return _.maxBy(ctrl.attachments, function(attachment) {
          return attachment.indexInSurvey;
        }).indexInSurvey + 1;
      };

      ctrl.addAttachment = function(event) {
        $mdDialog.show({
            controller: 'SurveyAttachmentEditOrCreateController',
            controllerAs: 'ctrl',
            templateUrl: 'scripts/surveymanagement/' +
              'views/survey-attachment-edit-or-create.html.tmpl',
            clickOutsideToClose: false,
            fullscreen: true,
            locals: {
              surveyAttachmentMetadata: {
                indexInSurvey: ctrl.getNextIndexInSurvey(),
                surveyId: ctrl.survey.id,
                surveyNumber: ctrl.survey.number,
                dataAcquisitionProjectId: ctrl.survey.dataAcquisitionProjectId
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
          attachment.indexInSurvey = index;
          promises.push(attachment.$save());
        });
        $q.all(promises).then(function() {
          SimpleMessageToastService.openSimpleMessageToast(
          'survey-management.detail.attachments.attachment-order-saved-toast',
          {}, true);
          ctrl.attachmentOrderIsDirty = false;
        });
      };

      ctrl.selectAttachment = function(index) {
        if (Principal.hasAuthority('ROLE_PUBLISHER')) {
          ctrl.currentAttachmentIndex = index;
        }
      };

      ctrl.dataTypes = [
        {de: 'Quantitative Daten', en: 'Quantitative Data'},
        {de: 'Qualitative Daten', en: 'Qualitative Data'}
      ];

      ctrl.validatePeriod = function() {
        if (!moment(ctrl.survey.fieldPeriod.start).isSameOrBefore(
          moment(ctrl.survey.fieldPeriod.end)
        )) {
          $scope.surveyForm.fieldPeriodEnd.$setValidity('mindate', false);
          $scope.surveyForm.fieldPeriodEnd.$setTouched();
        } else {
          $scope.surveyForm.fieldPeriodEnd.$setValidity('mindate', true);
          $scope.surveyForm.fieldPeriodEnd.$setTouched();
        }
      };

      ctrl.saveResponseRateImageDe = function(file) {
        ctrl.responseRateImageDe = Upload.rename(file,
          SurveyResponseRateImageUploadService.buildImageFilename(
            ctrl.survey.number, 'de'));
        ctrl.responseRateImageDeDirty = true;
      };

      ctrl.deleteResponseRateImageDe = function() {
        delete ctrl.responseRateImageDe;
        ctrl.responseRateImageDeDirty = true;
      };

      ctrl.uploadOrDeleteResponseRateImageDe = function() {
        if (!ctrl.responseRateImageDe) {
          SurveyResponseRateImageUploadService.deleteImage(
            ctrl.survey.id, ctrl.survey.number, 'de'
          ).then(function() {
            SimpleMessageToastService.openSimpleMessageToast(
              'survey-management.edit.survey-image-deleted-toast',
              null, true);
            ctrl.responseRateImageDeDirty = false;
          });
        } else {
          SurveyResponseRateImageUploadService.uploadImage(
            ctrl.responseRateImageDe, ctrl.survey.id).then(function() {
              SimpleMessageToastService.openSimpleMessageToast(
                'survey-management.edit.survey-image-saved-toast',
                null, true);
              ctrl.responseRateImageDeDirty = false;
            });
        }
      };

      ctrl.saveResponseRateImageEn = function(file) {
        ctrl.responseRateImageEn = Upload.rename(file,
          SurveyResponseRateImageUploadService.buildImageFilename(
            ctrl.survey.number, 'en'));
        ctrl.responseRateImageEnDirty = true;
      };

      ctrl.deleteResponseRateImageEn = function() {
        delete ctrl.responseRateImageEn;
        ctrl.responseRateImageEnDirty = true;
      };

      ctrl.uploadOrDeleteResponseRateImageEn = function() {
        if (!ctrl.responseRateImageEn) {
          SurveyResponseRateImageUploadService.deleteImage(
            ctrl.survey.id, ctrl.survey.number, 'en'
          ).then(function() {
            SimpleMessageToastService.openSimpleMessageToast(
              'survey-management.edit.survey-image-deleted-toast',
              null, true);
            ctrl.responseRateImageEnDirty = false;
          });
        } else {
          SurveyResponseRateImageUploadService.uploadImage(
            ctrl.responseRateImageEn, ctrl.survey.id).then(function() {
              SimpleMessageToastService.openSimpleMessageToast(
                'survey-management.edit.survey-image-saved-toast',
                null, true);
              ctrl.responseRateImageEnDirty = false;
            });
        }
      };

      init();
    });
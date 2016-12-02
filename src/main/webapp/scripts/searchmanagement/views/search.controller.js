/* Author: Daniel Katzberg */
/* global _ */

'use strict';

/* The Controller for the search. It differs between tabs and a tab represent
a result of a type like variable or dataSet and so on. */
angular.module('metadatamanagementApp').controller('SearchController',
  function($scope, Principal, ElasticSearchProperties, $location,
    SimpleMessageToastService, SearchDao, $translate, VariableUploadService,
    QuestionUploadService, RelatedPublicationUploadService,
    DataSetUploadService, StudyUploadService, SurveyUploadService, $mdDialog,
    CleanJSObjectService, InstrumentUploadService,
    CurrentProjectService, $timeout, PageTitleService) {

      $scope.searchResult = {};
      $scope.isInitializing = true;

      // set the page title in toolbar and window.title
      PageTitleService.setPageTitle('global.menu.search.title');

      //Check the login status
      Principal.identity().then(function(account) {
        $scope.account = account;
        $scope.isAuthenticated = Principal.isAuthenticated;
      });

      $scope.pageObject = {
        page: 1,
        totalHits: 0,
        size: 5
      };

      var writeAllSearchParams = function() {
        $location.search($scope.pageObject);
      };

      var readAllSearchParams = function() {
        var locationParams = $location.search();
        if (CleanJSObjectService.isNullOrEmpty(locationParams)) {
          CurrentProjectService.setCurrentProject(null);
          $scope.pageObject['rdc-project'] = undefined;
          $scope.pageObject.type = undefined;
          $scope.pageObject.page = 1;
          $scope.pageObject.query = undefined;
          $scope.selectedTabIndex = 0;
        } else {
          for (var paramName in locationParams) {
            $scope.pageObject[paramName] = locationParams[paramName];
          }
          $scope.selectedTabIndex = _.findIndex($scope.tabs, function(tab) {
              return tab.elasticSearchType === $scope.pageObject.type;
            });
        }
      };

      $scope.$watch(function() {
        return $location.search();
      }, function() {
        readAllSearchParams();
        $scope.search();
      });

      //Search function
      $scope.search = function() {
        $scope.isSearching = true;
        SearchDao.search($scope.pageObject.query, $scope.pageObject.page,
          $scope.currentProject, $scope.pageObject.type,
          $scope.pageObject.size)
        .then(function(data) {
          $scope.searchResult = data.hits.hits;
          $scope.pageObject.totalHits = data.hits.total;
          $scope.tabs[$scope.selectedTabIndex].count = data.hits.total;
          //Count information by aggregations
          if ($scope.tabs[$scope.selectedTabIndex].elasticSearchType === '') {
            $scope.tabs.forEach(function(tab) {
              if (tab.elasticSearchType !== '') {
                tab.count = 0;
              }
              data.aggregations.countByType.buckets.forEach(
                function(bucket) {
                  if (bucket.key === tab.elasticSearchType) {
                    // jscs:disable
                    tab.count = bucket.doc_count;
                    // jscs:enable
                  }
                });
            });
          }
          $scope.isSearching = false;
          //If something going wrong: send an simple toast message
        }, function(error) {
          SimpleMessageToastService
          .openSimpleMessageToast('search-management.error.error-on-search',
            {error: error.message});
          $scope.isSearching = false;
        });
      };

      $scope.$on('current-project-changed', function(event, currentProject) {
        if (currentProject) {
          $scope.currentProject = currentProject;
          $scope.pageObject['rdc-project'] = $scope.currentProject.id;
        } else {
          $scope.currentProject = null;
          $scope.pageObject['rdc-project'] = '';
        }
        $scope.pageObject.page = 1;
        writeAllSearchParams();
      });

      $scope.onTabSelected = function() {
        if (!$scope.isInitializing) {
          $scope.pageObject.page = 1;
        }
        $scope.isInitializing = false;
        var selectedTab = $scope.tabs[$scope.selectedTabIndex];
        $scope.tabs.forEach(function(tab) {
          tab.count = null;
        });
        $scope.pageObject.type = selectedTab.elasticSearchType;
        writeAllSearchParams();
      };

      $scope.onQueryChanged = function() {
        $scope.pageObject.page = 1;
        console.log($scope.pageObject.query);
        writeAllSearchParams();
      };

      $scope.onPageChanged = function() {
        writeAllSearchParams();
      };

      $scope.uploadVariables = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        VariableUploadService.uploadVariables(files, $scope.currentProject);
      };

      $scope.uploadQuestions = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        QuestionUploadService.uploadQuestions(files, $scope.currentProject);
      };

      $scope.uploadSurveys = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        SurveyUploadService.uploadSurveys(files, $scope.currentProject);
      };

      $scope.uploadDataSets = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        DataSetUploadService.uploadDataSets(files, $scope.currentProject);
      };

      $scope.uploadRelatedPublications = function(file) {
        if (Array.isArray(file)) {
          file = file[0];
        }
        RelatedPublicationUploadService.uploadRelatedPublications(file);
      };

      $scope.uploadStudy = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        StudyUploadService.uploadStudy(files, $scope.currentProject);
      };

      $scope.uploadInstruments = function(files) {
        if (!files || files.length === 0) {
          return;
        }
        InstrumentUploadService.uploadInstruments(files, $scope.currentProject);
      };

      //Refresh function for the refresh button
      $scope.refresh = function() {
        $scope.search();
      };

      $scope.$on('upload-completed', function() {
        //wait for 1 seconds until refresh
        //in order to wait for elasticsearch reindex
        $timeout($scope.refresh, 1000);
      });

      //Information for the different tabs
      $scope.tabs = [{
        title: 'search-management.tabs.all',
        inputLabel: 'search-management.input-label.all',
        elasticSearchType: undefined,
        count: null,
        acceptedFileUploadType: null,
        uploadFunction: null
      }, {
        title: 'search-management.tabs.studies',
        inputLabel: 'search-management.input-label.studies',
        icon: 'assets/images/icons/study.svg',
        elasticSearchType: 'studies',
        count: null,
        uploadFunction: $scope.uploadStudy
      }, {
        title: 'search-management.tabs.questions',
        inputLabel: 'search-management.input-label.questions',
        icon: 'assets/images/icons/question.svg',
        elasticSearchType: 'questions',
        count: null,
        uploadFunction: $scope.uploadQuestions
      }, {
        title: 'search-management.tabs.variables',
        inputLabel: 'search-management.input-label.variables',
        icon: 'assets/images/icons/variable.svg',
        elasticSearchType: 'variables',
        count: null,
        uploadFunction: $scope.uploadVariables
      }, {
        title: 'search-management.tabs.surveys',
        inputLabel: 'search-management.input-label.surveys',
        icon: 'assets/images/icons/survey.svg',
        elasticSearchType: 'surveys',
        count: null,
        uploadFunction: $scope.uploadSurveys
      }, {
        title: 'search-management.tabs.data-sets',
        inputLabel: 'search-management.input-label.data-sets',
        icon: 'assets/images/icons/data-set.svg',
        elasticSearchType: 'data_sets',
        count: null,
        uploadFunction: $scope.uploadDataSets
      }, {
        title: 'search-management.tabs.instruments',
        inputLabel: 'search-management.input-label.instruments',
        icon: 'assets/images/icons/instrument.svg',
        elasticSearchType: 'instruments',
        count: null,
        uploadFunction: $scope.uploadInstruments
      }, {
        title: 'search-management.tabs.related-publications',
        inputLabel: 'search-management.input-label.related-publications',
        icon: 'assets/images/icons/related-publication.svg',
        elasticSearchType: 'related_publications',
        count: null,
        uploadFunction: $scope.uploadRelatedPublications
      }];
    });

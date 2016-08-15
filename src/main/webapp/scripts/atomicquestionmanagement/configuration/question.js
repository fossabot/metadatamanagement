'use strict';

angular.module('metadatamanagementApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('toberemovedDetail', {
        parent: 'site',
        url: '/toberemoved/{id}',
        data: {
          authorities: [],
          //TODO should be a i18n string
          pageTitle: 'Frage'
        },
        views: {
          'content@': {
            templateUrl: 'scripts/toberemovedmanagement/views/' +
              'questsdion-detail.html.tmpl',
            controller: 'toberemovedDetailController'
          }
        },
        resolve: {
          translatePartialLoader: ['$translatePartialLoader',
            function($translatePartialLoader) {
              //should be changed
              $translatePartialLoader.addPart('question.management');
            }
          ],
          entity: ['$stateParams', 'AtomicQuedestionResource',
            function($stateParams, AtomicQuestionResource) {
              return AtomicQuestionResource.get({
                id: $stateParams.id
              });
            }
          ]
        }
      });
  });

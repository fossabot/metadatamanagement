'use strict';

angular.module('metadatamanagementApp').config(
  function($translateProvider) {
    var translations = {
      //jscs:disable
      'related-publication-management': {
        'home': {
          'title': 'Publication'
        },
        'log-messages': {
          'related-publication': {
            'saved': 'Publication with RDC-ID {{ id }} was saved successfully!',
            'not-saved': 'Publication with RDC-ID {{ id }} has not been saved!',
            'missing-id': 'Publication {{ index }} does not contain a RDC-ID and has not been saved!',
            'upload-terminated': 'Finished upload of {{ total }} Publications with {{ errors }} errors.',
            'unable-to-delete': 'Publications could not be deleted!',
            'cancelled': 'Publications upload cancelled!'
          }
        },
        'detail': {
          'title': '{{ title }}',
          'publication': 'Publication',
          'publications': 'Publications',
          'related-information': 'Related Information',
          'studies-title': 'Studies',
          'questions-title': 'Questions',
          'variables-title': 'Variables',
          'citation-text': 'Citation Text',
          'abstract': 'Abstract',
          'doi': 'DOI',
          'sourceReference': 'Source Reference',
          'sourceLink': 'URL',
          'no-related-publications': 'No related Publications.',
          'related-publications': 'Related Publications'
        },
        'error': {
          'related-publication': {
            'id': {
              'not-empty': 'The RDC-ID of the Publication must not be empty!',
              'size': 'The max length of the RDC-ID is 128 signs.',
              'pattern': 'The RDC-ID must not contain any whitespaces.'
            },
            'source-reference': {
              'not-empty': 'The source reference of the Publication must not be empty!',
              'size': 'The max length of the source reference of the Publication is 2048 signs.'
            },
            'publication-abstract': {
              'size': 'The max length of the publication abstract of the Publication is 1048576 signs.'
            },
            'doi': {
              'size': 'The max length of the DOI of the Publication is 128 signs.'
            },
            'source-link': {
              'pattern': 'The source link of the Publication is not a valid URL.'
            },
            'title': {
              'not-empty': 'The title of the Publication must not be empty!',
              'size': 'The max length of the title of the Publication is 128 signs.'
            }
          }
        }
      }
      //jscs:enable
    };
    $translateProvider.translations('en', translations);
  });
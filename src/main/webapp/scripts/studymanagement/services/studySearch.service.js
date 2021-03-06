/* global _ */
'use strict';

angular.module('metadatamanagementApp').factory('StudySearchService',
  function(ElasticSearchClient, $q, CleanJSObjectService,
    SearchHelperService, LanguageService) {
    var createQueryObject = function() {
      return {
        index: 'studies',
        type: 'studies'
      };
    };

    var createTermFilters = function(filter, dataAcquisitionProjectId) {
      var termFilter;
      if (!CleanJSObjectService.isNullOrEmpty(filter) ||
        !CleanJSObjectService.isNullOrEmpty(dataAcquisitionProjectId)) {
        termFilter = [];
      }
      if (!CleanJSObjectService.isNullOrEmpty(dataAcquisitionProjectId)) {
        var projectFilter = {
          term: {
            dataAcquisitionProjectId: dataAcquisitionProjectId
          }
        };
        termFilter.push(projectFilter);
      }
      if (!CleanJSObjectService.isNullOrEmpty(filter)) {
        termFilter = _.concat(termFilter,
          SearchHelperService.createTermFilters('studies', filter));
      }
      return termFilter;
    };

    var findOneById = function(id) {
      var deferred = $q.defer();
      var query = createQueryObject();
      query.id = id;
      ElasticSearchClient.getSource(query, function(error, response) {
          if (error) {
            deferred.reject(error);
          } else {
            deferred.resolve(response);
          }
        });
      return deferred;
    };

    var findStudySeries = function(searchText, filter, language) {
      language = language || LanguageService.getCurrentInstantly();
      var query = createQueryObject();
      var termFilters = createTermFilters(filter);

      query.body = {
        'aggs': {
            'studySeriesDe': {
                'terms': {
                  'field': 'studySeries.de',
                  'size': 100
                },
                'aggs': {
                  'studySeriesEn': {
                    'terms': {
                      'field': 'studySeries.en',
                      'size': 100
                    }
                  }
                }
              }
          }
      };

      query.body.query = {
        'bool': {
          'must': [{
              'match': {
              }
            }],
          'disable_coord': true
        }
      };

      query.body.query.bool.must[0].match
        ['studySeries.' + language + '.ngrams'] = {
        'query': searchText,
        'operator': 'AND',
        'minimum_should_match': '100%',
        'zero_terms_query': 'ALL'
      };

      if (termFilters) {
        query.body.query.bool.filter = termFilters;
      }

      return ElasticSearchClient.search(query).then(function(result) {
        var studySeries = [];
        var studySeriesElement = {};
        result.aggregations.studySeriesDe.buckets.forEach(function(bucket) {
            studySeriesElement = {
              'de': bucket.key,
              'en': bucket.studySeriesEn.buckets[0].key
            };
            studySeries.push(studySeriesElement);
          });
        return studySeries;
      });
    };

    var findSponsors = function(searchText, filter, language) {
      language = language || LanguageService.getCurrentInstantly();
      var query = createQueryObject();
      var termFilters = createTermFilters(filter);

      query.body = {
        'aggs': {
            'sponsorDe': {
                'terms': {
                  'field': 'sponsor.de',
                  'size': 100
                },
                'aggs': {
                  'sponsorEn': {
                    'terms': {
                      'field': 'sponsor.en',
                      'size': 100
                    }
                  }
                }
              }
          }
      };

      query.body.query = {
        'bool': {
          'must': [{
              'match': {
              }
            }],
          'disable_coord': true
        }
      };

      query.body.query.bool.must[0].match
        ['sponsor.' + language + '.ngrams'] = {
        'query': searchText,
        'operator': 'AND',
        'minimum_should_match': '100%',
        'zero_terms_query': 'ALL'
      };

      if (termFilters) {
        query.body.query.bool.filter = termFilters;
      }

      return ElasticSearchClient.search(query).then(function(result) {
        var sponsors = [];
        var sponsorElement = {};
        result.aggregations.sponsorDe.buckets.forEach(function(bucket) {
            sponsorElement = {
              'de': bucket.key,
              'en': bucket.sponsorEn.buckets[0].key
            };
            sponsors.push(sponsorElement);
          });
        return sponsors;
      });
    };

    var findInstitutions = function(searchText, filter, language) {
      language = language || LanguageService.getCurrentInstantly();
      var query = createQueryObject();
      var termFilters = createTermFilters(filter);

      query.body = {
        'aggs': {
            'institutionDe': {
                'terms': {
                  'field': 'institution.de',
                  'size': 100
                },
                'aggs': {
                  'institutionEn': {
                    'terms': {
                      'field': 'institution.en',
                      'size': 100
                    }
                  }
                }
              }
          }
      };

      query.body.query = {
        'bool': {
          'must': [{
              'match': {
              }
            }],
          'disable_coord': true
        }
      };

      query.body.query.bool.must[0].match
        ['institution.' + language + '.ngrams'] = {
        'query': searchText,
        'operator': 'AND',
        'minimum_should_match': '100%',
        'zero_terms_query': 'ALL'
      };

      if (termFilters) {
        query.body.query.bool.filter = termFilters;
      }

      return ElasticSearchClient.search(query).then(function(result) {
        var institutions = [];
        var institutionElement = {};
        result.aggregations.institutionDe.buckets.forEach(function(bucket) {
            institutionElement = {
              'de': bucket.key,
              'en': bucket.institutionEn.buckets[0].key
            };
            institutions.push(institutionElement);
          });
        return institutions;
      });
    };

    return {
      findOneById: findOneById,
      findStudySeries: findStudySeries,
      findSponsors: findSponsors,
      findInstitutions: findInstitutions
    };
  });

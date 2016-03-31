/* global XLSX*/
'use strict';

angular.module('metadatamanagementApp').service('VariablesParser',
function(Variable, ParserUtil) {
  var getVariables = function(data, dataAcquisitionProjectId) {
    var jsonContent = {};
    var variablesObjArray = [];
    var excelFile = data.files['variables.xlsx'];
    var content = XLSX.read(excelFile.asBinary(), {type: 'binary'});
    var sheetList = content.SheetNames;
    var worksheet = content.Sheets[sheetList[0]];
    // jscs:disable
    jsonContent = XLSX.utils.sheet_to_json(worksheet);
    // jscs:enable
    for (var i = 0; i < jsonContent.length; i++) {
      var variableObj = {
        id: jsonContent[i].id,
        accessWays: ParserUtil.getParsedArray(jsonContent[i].accessWays),
        dataAcquisitionProjectId: dataAcquisitionProjectId,
        dataType: {
          en: jsonContent[i]['dataType.en'],
          de: jsonContent[i]['dataType.de']
        },
        label: {
          en: jsonContent[i]['label.en'],
          de: jsonContent[i]['label.de']
        },
        description: {
          en: jsonContent[i]['description.en'],
          de: jsonContent[i]['description.de']
        },
        sameVariablesInPanel: ParserUtil.
        getParsedArray(jsonContent[i].sameVariablesInPanel),
        name: jsonContent[i].name,
        scaleLevel: {
          en: jsonContent[i]['scaleLevel.en'],
          de: jsonContent[i]['scaleLevel.de']
        },
        statistics: {
          firstQuartile: jsonContent[i]['statistics.firstQuartile'],
          highWhisker: jsonContent[i]['statistics.highWhisker'],
          kurtosis: jsonContent[i]['statistics.kurtosis'],
          lowWhisker: jsonContent[i]['statistics.lowWhisker'],
          maximum: jsonContent[i]['statistics.maximum'],
          meanValue: jsonContent[i]['statistics.meanValue'],
          median: jsonContent[i]['statistics.median'],
          minimum: jsonContent[i]['statistics.minimum'],
          skewness: jsonContent[i]['statistics.skewness'],
          standardDeviation: jsonContent[i]
          ['statistics.standardDeviation'],
          thirdQuartile: jsonContent[i]['statistics.thirdQuartile']
        },
        values: data.files['values/' + jsonContent[i].id + '.json'] ?
          JSON.parse(data.files['values/' + jsonContent[i].id + '.json']
          .asBinary()).values :
          data.files['values/' + jsonContent[i].id + '.json'],
        surveyId: jsonContent[i].surveyId,
        conceptId: jsonContent[i].conceptId,
        dataSetIds: ParserUtil.getParsedArray(jsonContent[i].dataSetIds),
      };
      var filterDetails = {
          filterExpression:
          jsonContent[i]['filterDetails.filterExpression'],
          filterExpressionLanguage:
          jsonContent[i]['filterDetails.filterExpressionLanguage']
        };
      var filterDescription = {
          en: jsonContent[i]['filterDetails.filterDescription.de'],
          de: jsonContent[i]['filterDetails.filterDescription.en']
        };
      var generationDetails = {
          rule: jsonContent[i]['generationDetails.rule'],
          ruleExpressionLanguage: jsonContent[i]
          ['generationDetails.ruleExpressionLanguage']
        };
      var generationDetailsDescription = {
           en: jsonContent[i]['generationDetails.description.en'],
           de: jsonContent[i]['generationDetails.description.de']
         };

      if (ParserUtil.isJsonObjectwithValues(filterDescription)) {
        filterDetails.filterDescription = filterDescription;
        variableObj.filterDetails = filterDetails;
      } else {
        if (ParserUtil.isJsonObjectwithValues(filterDetails)) {
          variableObj.filterDetails = filterDetails;
        }
      }
      if (ParserUtil.isJsonObjectwithValues(generationDetailsDescription)) {
        generationDetails.description = generationDetailsDescription;
        variableObj.generationDetails = generationDetails;
      } else {
        if (ParserUtil.isJsonObjectwithValues(generationDetails)) {
          variableObj.generationDetails = generationDetails;
        }
      }

      variablesObjArray.push(new Variable(variableObj));
    }
    console.log(variablesObjArray);
    return variablesObjArray;
  };
  return {
      getVariables: getVariables
    };
});

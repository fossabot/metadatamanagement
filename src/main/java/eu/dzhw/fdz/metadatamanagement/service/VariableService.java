package eu.dzhw.fdz.metadatamanagement.service;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.mysema.query.types.Predicate;

import eu.dzhw.fdz.metadatamanagement.domain.Variable;
import eu.dzhw.fdz.metadatamanagement.repository.VariableRepository;
import eu.dzhw.fdz.metadatamanagement.search.VariableSearchDao;
import eu.dzhw.fdz.metadatamanagement.search.document.VariableSearchDocument;
import eu.dzhw.fdz.metadatamanagement.service.enums.ElasticsearchIndices;
import eu.dzhw.fdz.metadatamanagement.service.exception.EntityExistsException;
import eu.dzhw.fdz.metadatamanagement.service.exception.EntityNotFoundException;

/**
 * Service for creating and updating variable. Used for updating variables in mongo and
 * elasticsearch.
 * 
 * @author René Reitmann
 * @author Daniel Katzberg
 */
@Service
public class VariableService {

  @Inject
  private VariableRepository variableRepository;

  @Inject
  private VariableSearchDao variableSearchDao;

  /**
   * Create a variable in mongo and elasticsearch.
   * 
   * @param variable The variable to create.
   * @return The created variable.
   * @throws EntityExistsException if there is already a variable with the given id
   */
  public Variable createVariable(Variable variable) {
    try {
      variable = variableRepository.insert(variable);
    } catch (DuplicateKeyException e) {
      this.handleDuplicatedKeyExceptions(variable, e.getMessage());
    }
    updateSearchIndices(variable);
    return variable;
  }

  private void updateSearchIndices(Variable variable) {
    for (ElasticsearchIndices index : ElasticsearchIndices.values()) {
      // TODO create different search documents for different languages
      variableSearchDao.save(new VariableSearchDocument(variable), index.getIndexName());
    }
  }

  /**
   * Update an existing variable in mongo and elasticsearch.
   * 
   * @param variable the variable to update.
   * @return The updated variable.
   * @throws EntityNotFoundException if there is no variable with the given id
   */
  public Variable updateVariable(Variable variable) {
    if (!variableRepository.exists(variable.getId())) {
      throw new EntityNotFoundException(Variable.class, variable.getId());
    }
    variable = variableRepository.save(variable);
    updateSearchIndices(variable);
    return variable;
  }

  public Page<Variable> getAllVariables(Predicate predicate, Pageable pageable) {
    return variableRepository.findAll(predicate, pageable);
  }

  public Variable getVariable(String id) {
    return variableRepository.findOne(id);
  }

  /**
   * Delete the variable with the given id.
   * 
   * @param id The id of the variable to delete
   */
  public void deleteVariable(String id) {
    variableRepository.delete(id);
    for (ElasticsearchIndices index : ElasticsearchIndices.values()) {
      variableSearchDao.delete(id, index.getIndexName());
    }
  }

  /**
   * Load all variables from mongo and update the search indices.
   */
  public void reindexAllVariables() {
    Pageable pageable = new PageRequest(0, 50);
    Page<Variable> variables = variableRepository.findAll(pageable);

    while (variables.hasContent()) {
      List<VariableSearchDocument> searchDocuments = new ArrayList<>(50);
      for (Variable variable : variables) {
        // TODO create different search documents for different languages
        searchDocuments.add(new VariableSearchDocument(variable));
      }
      for (ElasticsearchIndices index : ElasticsearchIndices.values()) {
        variableSearchDao.save(searchDocuments, index.getIndexName());
      }
      variables = variableRepository.findAll(pageable.next());
    }
  }

  /**
   * Handles and differ different kinds of duplicated key exceptions.
   * 
   * @param variable An instance of a variable.
   * @param message The error message of the duplicated key (e.getMessage())
   */
  private void handleDuplicatedKeyExceptions(Variable variable, String message) {
    // Double ID
    if (message.contains("$_id_")) {
      throw new EntityExistsException(Variable.class, variable.getId());
    }

    // Double Compound index of name/fdzProjectName
    if (message.contains("$name_1_fdz_project_name_1")) {
      String[] fields = {variable.getName(), variable.getFdzProject().getName()};
      throw new EntityExistsException(Variable.class, fields);
    }
  }
  
  /**
   * Delete all variables from mongo and elasticsearch.
   */
  public void deleteAll() {
    variableRepository.deleteAll();
    for (ElasticsearchIndices index : ElasticsearchIndices.values()) {
      variableSearchDao.deleteAll(index.getIndexName());
    }
  }

  public List<Variable> findAll() {
    return variableRepository.findAll();
  }
}

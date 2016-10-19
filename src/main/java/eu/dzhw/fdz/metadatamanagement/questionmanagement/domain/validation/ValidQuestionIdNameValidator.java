package eu.dzhw.fdz.metadatamanagement.questionmanagement.domain.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import eu.dzhw.fdz.metadatamanagement.questionmanagement.domain.Question;

/**
 * Validates the name of a id.
 */
public class ValidQuestionIdNameValidator
    implements ConstraintValidator<ValidQuestionIdName, Question> {

  /*
   * (non-Javadoc)
   * 
   * @see javax.validation.ConstraintValidator#initialize(java.lang.annotation.Annotation)
   */
  @Override
  public void initialize(ValidQuestionIdName constraintAnnotation) {}

  /*
   * (non-Javadoc)
   * 
   * @see javax.validation.ConstraintValidator#isValid(java.lang.Object,
   * javax.validation.ConstraintValidatorContext)
   */
  @Override
  public boolean isValid(Question question, ConstraintValidatorContext context) {

    // check for set project id
    if (question.getInstrumentId() == null || question.getNumber() == null) {
      return false;
    }
    if (!question.getId()
        .equals(question.getInstrumentId() + "-" + question.getNumber())) {
      return false;
    }
    return true;
  }

}
package eu.dzhw.fdz.metadatamanagement.variablemanagement.domain.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

/**
 * Annotation for the validation of the statistics of a variable. It checks the third quartile has a
 * numeric string, if the variable has a numeric data type.
 * 
 * @author Daniel Katzberg
 *
 */
@Documented
@Constraint(validatedBy = {StatisticsThirdQuartileMustBeANumberOnNumericDataTypeValidator.class})
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface StatisticsThirdQuartileMustBeANumberOnNumericDataType {
  /**
   * Defines the default error message.
   */
  public abstract String message() default "{eu.dzhw.fdz.metadatamanagement.domain.validation."
      + "statisticsThirdQuartileMustBeANumberOnNumericDataType.message}";

  /**
   * This contains groups.
   */
  public Class<?>[] groups() default {};

  /**
   * This method contains the payload.
   */
  public Class<? extends Payload>[] payload() default {};
}

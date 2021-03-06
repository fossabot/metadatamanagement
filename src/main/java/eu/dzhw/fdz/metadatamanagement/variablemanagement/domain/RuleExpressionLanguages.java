package eu.dzhw.fdz.metadatamanagement.variablemanagement.domain;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Rule Expression Language.
 * 
 * @author Daniel Katzberg
 *
 */
public class RuleExpressionLanguages {

  public static final String STATA = "Stata";
  public static final String R = "R";
  public static final Set<String> ALL =
      Collections.unmodifiableSet(new HashSet<String>(Arrays.asList(STATA, R)));
}

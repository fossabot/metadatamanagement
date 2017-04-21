package eu.dzhw.fdz.metadatamanagement.studymanagement.domain;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.beans.BeanUtils;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.google.common.base.MoreObjects;

import eu.dzhw.fdz.metadatamanagement.common.domain.AbstractRdcDomainObject;
import eu.dzhw.fdz.metadatamanagement.common.domain.I18nString;
import eu.dzhw.fdz.metadatamanagement.common.domain.Person;
import eu.dzhw.fdz.metadatamanagement.common.domain.util.Patterns;
import eu.dzhw.fdz.metadatamanagement.common.domain.validation.I18nStringNotEmpty;
import eu.dzhw.fdz.metadatamanagement.common.domain.validation.I18nStringSize;
import eu.dzhw.fdz.metadatamanagement.common.domain.validation.StringLengths;
import eu.dzhw.fdz.metadatamanagement.projectmanagement.domain.DataAcquisitionProject;
import eu.dzhw.fdz.metadatamanagement.studymanagement.domain.validation.ValidDataAvailability;
import eu.dzhw.fdz.metadatamanagement.studymanagement.domain.validation.ValidStudyId;
import eu.dzhw.fdz.metadatamanagement.studymanagement.domain.validation.ValidSurveyDesign;
import io.searchbox.annotations.JestId;
import net.karneim.pojobuilder.GeneratePojoBuilder;

/**
 * The study domain object represents a study. A study can has more than one release. 
 * Every {@link DataAcquisitionProject} has exact one Study.
 * 
 * @author Daniel Katzberg
 *
 */
@Document(collection = "studies")
@GeneratePojoBuilder(
     intoPackage = "eu.dzhw.fdz.metadatamanagement.studymanagement.domain.builders")
@ValidStudyId(message = "study-management.error.study.id.not-valid-id") 
public class Study extends AbstractRdcDomainObject {
  
  @Id
  @JestId
  @NotEmpty(message = "study-management.error.study.id.not-empty")
  @Size(max = StringLengths.MEDIUM, message = "study-management.error.study.id.size")
  @Pattern(regexp = Patterns.GERMAN_ALPHANUMERIC_WITH_UNDERSCORE_AND_MINUS_AND_EXCLAMATIONMARK,
      message = "study-management.error.study.id.pattern")
  private String id;
  
  @Indexed
  @NotEmpty(message = "study-management.error.study.data-acquisition-project.id.not-empty")
  private String dataAcquisitionProjectId;
  
  @NotNull(message = "study-management.error.study.title.not-null")
  @I18nStringSize(max = StringLengths.LARGE,
      message = "study-management.error.study.title.i18n-string-size")
  @I18nStringNotEmpty(message = "study-management.error.study.title.i18n-string-not-empty")
  private I18nString title;
  
  @NotNull(message = "study-management.error.study.description.not-null")
  @I18nStringSize(max = StringLengths.LARGE,
      message = "study-management.error.study.description.i18n-string-size")
  @I18nStringNotEmpty(message = "study-management.error.study.description.i18n-string-not-empty")
  private I18nString description;
  
  @NotNull(message = "study-management.error.study.institution.not-null")
  @I18nStringSize(max = StringLengths.MEDIUM,
      message = "study-management.error.study.institution.i18n-string-size")
  @I18nStringNotEmpty(message = "study-management.error.study.institution.i18n-string-not-empty")
  private I18nString institution;
  
  @I18nStringSize(max = StringLengths.MEDIUM,
      message = "study-management.error.study.survey-series.i18n-string-size")
  private I18nString surveySeries;
  
  @I18nStringSize(max = StringLengths.MEDIUM,
      message = "study-management.error.study.sponsor.i18n-string-size")
  private I18nString sponsor;
  
  @Valid
  @NotEmpty(message = "study-management.error.study.authors.not-empty")
  private List<Person> authors;
  
  @I18nStringSize(max = StringLengths.LARGE,
      message = "study-management.error.study.citation-hint.i18n-string-size")
  private I18nString citationHint;
  
  @NotNull(message = "study-management.error.study.data-availability.not-null")
  @ValidDataAvailability(
      message = "study-management.error.study.data-availability.valid-data-availability")
  private I18nString dataAvailability;
  
  @NotNull(message = "study-management.error.study.survey-design.not-null")
  @ValidSurveyDesign(
      message = "study-management.error.study.survey-design.valid-survey-design")
  private I18nString surveyDesign;
  
  public Study() {
    super();
  }
  
  public Study(Study study) {
    super();
    BeanUtils.copyProperties(study, this);
  }
  
  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }
  
  public String getDataAcquisitionProjectId() {
    return dataAcquisitionProjectId;
  }

  public void setDataAcquisitionProjectId(String dataAcquisitionProjectId) {
    this.dataAcquisitionProjectId = dataAcquisitionProjectId;
  }

  public I18nString getSurveySeries() {
    return surveySeries;
  }

  public void setSurveySeries(I18nString surveySeries) {
    this.surveySeries = surveySeries;
  }

  public I18nString getTitle() {
    return title;
  }

  public void setTitle(I18nString title) {
    this.title = title;
  }

  public I18nString getDescription() {
    return description;
  }

  public void setDescription(I18nString description) {
    this.description = description;
  }

  public I18nString getInstitution() {
    return institution;
  }

  public void setInstitution(I18nString institution) {
    this.institution = institution;
  }

  public I18nString getSponsor() {
    return sponsor;
  }

  public void setSponsor(I18nString sponsor) {
    this.sponsor = sponsor;
  }

  public List<Person> getAuthors() {
    return authors;
  }

  public void setAuthors(List<Person> authors) {
    this.authors = authors;
  }

  /*
   * (non-Javadoc)
   * @see eu.dzhw.fdz.metadatamanagement.common.domain.AbstractRdcDomainObject#toString()
   */
  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("super", super.toString())
      .add("id", id)
      .add("title", title)
      .add("description", description)
      .add("institution", institution)
      .add("surveySeries", surveySeries)
      .add("sponsor", sponsor)
      .add("citationHint", citationHint)
      .add("authors", authors)
      .add("dataAvailability", dataAvailability)
      .add("surveyDesign", surveyDesign)
      .add("dataAcquisitionProjectId", dataAcquisitionProjectId)
      .toString();
  }
  
  public I18nString getCitationHint() {
    return citationHint;
  }

  public void setCitationHint(I18nString citationHint) {
    this.citationHint = citationHint;
  }

  public I18nString getDataAvailability() {
    return dataAvailability;
  }

  public void setDataAvailability(I18nString dataAvailability) {
    this.dataAvailability = dataAvailability;
  }

  public I18nString getSurveyDesign() {
    return surveyDesign;
  }

  public void setSurveyDesign(I18nString surveyDesign) {
    this.surveyDesign = surveyDesign;
  }
}

package eu.dzhw.fdz.metadatamanagement.surveymanagement.rest;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import eu.dzhw.fdz.metadatamanagement.AbstractTest;
import eu.dzhw.fdz.metadatamanagement.common.domain.I18nString;
import eu.dzhw.fdz.metadatamanagement.common.rest.TestUtil;
import eu.dzhw.fdz.metadatamanagement.common.service.JaversService;
import eu.dzhw.fdz.metadatamanagement.common.unittesthelper.util.UnitTestCreateDomainObjectUtils;
import eu.dzhw.fdz.metadatamanagement.searchmanagement.repository.ElasticsearchUpdateQueueItemRepository;
import eu.dzhw.fdz.metadatamanagement.surveymanagement.domain.Survey;
import eu.dzhw.fdz.metadatamanagement.surveymanagement.domain.SurveyAttachmentMetadata;
import eu.dzhw.fdz.metadatamanagement.surveymanagement.repository.SurveyRepository;
import eu.dzhw.fdz.metadatamanagement.surveymanagement.service.SurveyAttachmentService;
import eu.dzhw.fdz.metadatamanagement.usermanagement.security.AuthoritiesConstants;

public class SurveyAttachmentResourceTest extends AbstractTest {
  @Autowired
  private WebApplicationContext wac;

  @Autowired
  private SurveyAttachmentService surveyAttachmentService;
  
  @Autowired
  private SurveyRepository surveyRepository;
  
  @Autowired
  private ElasticsearchUpdateQueueItemRepository elasticsearchUpdateQueueItemRepository;
  
  @Autowired
  private JaversService javersService;

  private MockMvc mockMvc;

  @Before
  public void setup() {
    this.mockMvc = MockMvcBuilders.webAppContextSetup(wac)
      .build();
  }

  @After
  public void cleanUp() {
    this.surveyRepository.deleteAll();
    this.surveyAttachmentService.deleteAll();
    this.elasticsearchUpdateQueueItemRepository.deleteAll();
    javersService.deleteAll();
  }

  @Test
  @WithMockUser(authorities=AuthoritiesConstants.PUBLISHER, username="test")
  public void testUploadValidAttachment() throws Exception {

    MockMultipartFile attachment =
        new MockMultipartFile("file", "filename.txt", "text/plain", "some text".getBytes());
    SurveyAttachmentMetadata surveyAttachmentMetadata = UnitTestCreateDomainObjectUtils
      .buildSurveyAttachmentMetadata("projectid", 1);
    MockMultipartFile metadata = new MockMultipartFile("surveyAttachmentMetadata", "Blob",
        "application/json", TestUtil.convertObjectToJsonBytes(surveyAttachmentMetadata));

    mockMvc.perform(MockMvcRequestBuilders.fileUpload("/api/surveys/attachments")
      .file(attachment)
      .file(metadata))
      .andExpect(status().isCreated());

    // read the created attachment and check the version
    mockMvc.perform(
        get("/api/surveys/" + surveyAttachmentMetadata.getSurveyId() + "/attachments"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.[0].surveyId", is(surveyAttachmentMetadata.getSurveyId())))
      .andExpect(jsonPath("$.[0].version", is(0)))
      .andExpect(jsonPath("$.[0].createdBy", is("test")))
      .andExpect(jsonPath("$.[0].lastModifiedBy", is("test")));
  }

  @Test
  @WithMockUser(authorities=AuthoritiesConstants.PUBLISHER)
  public void testUploadAttachmentWithWrongLanguage() throws Exception {

    MockMultipartFile attachment =
        new MockMultipartFile("file", "filename.txt", "text/plain", "some text".getBytes());
    SurveyAttachmentMetadata surveyAttachmentMetadata = UnitTestCreateDomainObjectUtils
      .buildSurveyAttachmentMetadata("projectid", 1);
    surveyAttachmentMetadata.setLanguage("test");
    MockMultipartFile metadata = new MockMultipartFile("surveyAttachmentMetadata", "Blob",
        "application/json", TestUtil.convertObjectToJsonBytes(surveyAttachmentMetadata));

    mockMvc.perform(MockMvcRequestBuilders.fileUpload("/api/surveys/attachments")
      .file(attachment)
      .file(metadata))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors[0].message",
          is("survey-management.error.survey-attachment-metadata.language.not-supported")));
  }
  
  @Test
  @WithMockUser(authorities=AuthoritiesConstants.PUBLISHER)
  public void testUploadAttachmentWithMissingDescription() throws Exception {

    MockMultipartFile attachment =
        new MockMultipartFile("file", "filename.txt", "text/plain", "some text".getBytes());
    SurveyAttachmentMetadata surveyAttachmentMetadata = UnitTestCreateDomainObjectUtils
      .buildSurveyAttachmentMetadata("projectid", 1);
    surveyAttachmentMetadata.setDescription(new I18nString());

    MockMultipartFile metadata = new MockMultipartFile("surveyAttachmentMetadata", "Blob",
        "application/json", TestUtil.convertObjectToJsonBytes(surveyAttachmentMetadata));

    mockMvc.perform(MockMvcRequestBuilders.fileUpload("/api/surveys/attachments")
      .file(attachment)
      .file(metadata))
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.errors[0].message",
          is("survey-management.error.survey-attachment-metadata.description.i18n-string-not-empty")));
  }
  
  @Test
  @WithMockUser(authorities=AuthoritiesConstants.PUBLISHER)
  public void testAttachmentIsDeletedWithSurvey() throws Exception {
    Survey survey =
        UnitTestCreateDomainObjectUtils.buildSurvey("projectid");

    // create the survey with the given id
    mockMvc.perform(put("/api/surveys/" + survey.getId())
      .content(TestUtil.convertObjectToJsonBytes(survey)))
      .andExpect(status().isCreated());
    
    MockMultipartFile attachment =
        new MockMultipartFile("file", "filename.txt", "text/plain", "some text".getBytes());
    SurveyAttachmentMetadata surveyAttachmentMetadata = UnitTestCreateDomainObjectUtils
      .buildSurveyAttachmentMetadata(survey.getDataAcquisitionProjectId(), survey.getNumber());

    MockMultipartFile metadata = new MockMultipartFile("surveyAttachmentMetadata", "Blob",
        "application/json", TestUtil.convertObjectToJsonBytes(surveyAttachmentMetadata));

    mockMvc.perform(MockMvcRequestBuilders.fileUpload("/api/surveys/attachments")
      .file(attachment)
      .file(metadata))
      .andExpect(status().isCreated());
    
    // delete the survey with the given id
    mockMvc.perform(delete("/api/surveys/" + survey.getId()))
      .andExpect(status().isNoContent());
    
    // check if attachment has been deleted as well
    mockMvc.perform(
        get("/api/surveys/" + surveyAttachmentMetadata.getSurveyId() + "/attachments"))
      .andExpect(status().isOk())
      .andExpect(content().json("[]"));
  }

}

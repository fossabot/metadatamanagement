package eu.dzhw.fdz.metadatamanagement.web.variablemanagement.modify;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.mvc.ControllerLinkBuilderFactory;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.validation.Validator;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import eu.dzhw.fdz.metadatamanagement.data.variablemanagement.documents.AnswerOption;
import eu.dzhw.fdz.metadatamanagement.data.variablemanagement.documents.VariableDocument;
import eu.dzhw.fdz.metadatamanagement.data.variablemanagement.documents.VariableSurvey;
import eu.dzhw.fdz.metadatamanagement.service.variablemanagement.VariableService;


/**
 * Controller for edit and create variables.
 * 
 * @author Amine Limouri
 */
@Controller
@RequestMapping(value = "/{language}/variables/create")
public class VariableModifyController {


  private VariableService variableService;
  private ControllerLinkBuilderFactory controllerLinkBuilderFactory;
  private Validator validator;

  /**
   * Autowire needed objects.
   */
  @Autowired
  public VariableModifyController(VariableService variableService,
      ControllerLinkBuilderFactory controllerLinkBuilderFactory, Validator validator) {
    this.variableService = variableService;
    this.controllerLinkBuilderFactory = controllerLinkBuilderFactory;
    this.validator = validator;
  }

  /**
   * Show edit and create variable page.
   * 
   * @return modify.html
   */
  @RequestMapping(method = RequestMethod.GET)
  public Callable<ModelAndView> get(
      VariableDocument variableDocument, BindingResult bindingResult) {
    return () -> {
      VariableModifyResource resource =
          new VariableModifyResource(VariableModifyController.class, controllerLinkBuilderFactory);

      validator.validate(createVariableDocument(), bindingResult);

      ModelAndView modelAndView = new ModelAndView("variables/modify");
      modelAndView.addObject("resource", resource);
      modelAndView.addObject("variableDocument", bindingResult.getModel().get("variableDocument"));

      return modelAndView;
    };
  }


  /**
   * add a survey to the variable.
   * 
   * @return modify.html
   */
  @RequestMapping(method = RequestMethod.POST, params = {"addSurvey"})
  public Callable<ModelAndView> addSurvey(
      VariableDocument variableDocument, BindingResult bindingResult) {
    return () -> {

      if (variableDocument.getVariableSurvey() == null) {
        VariableSurvey survey = new VariableSurvey();
        variableDocument.setVariableSurvey(survey);
      }
      validator.validate(variableDocument, bindingResult);

      VariableModifyResource resource =
          new VariableModifyResource(VariableModifyController.class, controllerLinkBuilderFactory);
      ModelAndView modelAndView = new ModelAndView("variables/modify");
      modelAndView.addObject("resource", resource);
      modelAndView.addObject("variableDocument", bindingResult.getModel().get("variableDocument"));

      return modelAndView;
    };
  }

  /**
   * remove a survey from the variable.
   * 
   * @return modify.html
   */
  @RequestMapping(method = RequestMethod.POST, params = {"removeSurvey"})
  public Callable<ModelAndView> removeSurvey(
      VariableDocument variableDocument, BindingResult bindingResult) {
    return () -> {
      VariableModifyResource resource =
          new VariableModifyResource(VariableModifyController.class, controllerLinkBuilderFactory);
      variableDocument.setVariableSurvey(null);
      validator.validate(variableDocument, bindingResult);
      ModelAndView modelAndView = new ModelAndView("variables/modify");
      modelAndView.addObject("resource", resource);
      modelAndView.addObject("variableDocument", bindingResult.getModel().get("variableDocument"));
      return modelAndView;
    };
  }

  /**
   * add an answer option to the variable.
   * 
   * @return modify.html
   */
  @RequestMapping(method = RequestMethod.POST, params = {"addOption"})
  public Callable<ModelAndView> addAnswerOption(
      VariableDocument variableDocument, BindingResult bindingResult) {
    return () -> {
      if (variableDocument.getAnswerOptions() == null) {
        List<AnswerOption> answerOpt = new ArrayList<>();
        variableDocument.setAnswerOptions(answerOpt);
      }
      variableDocument.getAnswerOptions().add(new AnswerOption());
      validator.validate(variableDocument, bindingResult);
      VariableModifyResource resource =
          new VariableModifyResource(VariableModifyController.class, controllerLinkBuilderFactory);
      ModelAndView modelAndView = new ModelAndView("variables/modify");
      modelAndView.addObject("resource", resource);
      modelAndView.addObject("variableDocument", bindingResult.getModel().get("variableDocument"));

      return modelAndView;
    };
  }

  /**
   * remove an answer option from the variable.
   * 
   * @return modify.html
   */
  @RequestMapping(method = RequestMethod.POST, params = {"removeOption"})
  public Callable<ModelAndView> removeAnswerOption(
      HttpServletRequest request, VariableDocument variableDocument, BindingResult bindingResult) {
    return () -> {
      try {
        int index = Integer.parseInt(request.getParameter("removeOption"));
        variableDocument.getAnswerOptions().remove(index);
        if (variableDocument.getAnswerOptions().isEmpty()) {
          variableDocument.setAnswerOptions(null);
        }
      } catch (NumberFormatException e) {
        e.printStackTrace();
      }
      VariableModifyResource resource =
          new VariableModifyResource(VariableModifyController.class, controllerLinkBuilderFactory);
      validator.validate(variableDocument, bindingResult);
      ModelAndView modelAndView = new ModelAndView("variables/modify");
      modelAndView.addObject("resource", resource);
      modelAndView.addObject("variableDocument", bindingResult.getModel().get("variableDocument"));
      return modelAndView;
    };
  }

  /**
   * reload the create and edit dialog.
   * 
   * @return modify.html
   */
  @RequestMapping(method = RequestMethod.POST, params = {"reset"})
  public Callable<ModelAndView> reset() {
    return () -> {
      ModelAndView modelAndView = new ModelAndView("redirect:/{language}/variables/create");
      return modelAndView;
    };
  }

  /**
   * save a valid variable document.
   * 
   * @return variableDetails.html or modify.html
   */
  @RequestMapping(method = RequestMethod.POST)
  public Callable<ModelAndView> postVariableDocument(
      VariableDocument variableDocument, BindingResult bindingResult) {
    return () -> {
      ModelAndView modelAndView;
      VariableModifyResource resource =
          new VariableModifyResource(VariableModifyController.class, controllerLinkBuilderFactory);
      validator.validate(variableDocument, bindingResult);
      if (!bindingResult.hasErrors()) {
        variableService.save(variableDocument);
        modelAndView =
            new ModelAndView("redirect:/{language}/variables/" + variableDocument.getId());
        modelAndView.addObject("resource", resource);
      } else {
        modelAndView = new ModelAndView("variables/modify");
        modelAndView.addObject("resource", resource);
        modelAndView
            .addObject("variableDocument", bindingResult.getModel().get("variableDocument"));
      }
      /*
       * try { System.out.println(bindingResult.getGlobalErrors().size() + " : " +
       * bindingResult.getGlobalErrorCount() + bindingResult.getErrorCount() + " : " +
       * bindingResult.getFieldErrorCount() + " : " + bindingResult.getAllErrors().size()); } catch
       * (Exception e) { e.printStackTrace(); }
       */
      return modelAndView;
    };
  }

  /**
   * create a new variable document.
   * 
   * @return VariableDocument
   */
  private VariableDocument createVariableDocument() {
    VariableDocument document = new VariableDocument();
    return document;
  }

}

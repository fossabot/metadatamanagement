*** Settings ***
Documentation     Tests the user experience of searching & finding the Graduate Panel 2005 and opening the survey page of the first wave for bachelor graduates
Resource          ../resources/search_resource.robot
Resource          ../resources/home_page_resource.robot

*** Test Cases ***
Looking for Absolventenpanel 2005s first wave survey in german
  Click on surveys tab
  Search for  Absolventenpanel 2005 Erste Welle
  Click on search result by id  sur-gra2005-sy3$
  Page Should Contain  n = 1.622
  [Teardown]  Get back to home page

Looking for Graduate Panel 2005s first wave survey in english
  [Setup]   Change language to english
  Click on surveys tab
  Search for  DZHW Graduate Panel 2005 First Wave
  Click on search result by id  sur-gra2005-sy3$
  Page Should Contain  n = 1,622
  [Teardown]  Get back to german home page

*** Keywords ***
Click on surveys tab
  Wait Until Keyword Succeeds  5s  1s  Click Element Through Tooltips  xpath=//md-pagination-wrapper/md-tab-item[2]

Feature: Admin upload media files
In order to manage media in presentation machines
As an admin
I need to upload media files to any presentation machines by title

Background:
  Given I am logged in as admin

  #passed: note - Bring Selenium chrome browser to front of other window, otherwise test failed sometime(it seems to be Selenium driver bug)
  Scenario: Admin should upload media files to specific presentation machine
    Given I am on list media files page
    When I upload media file
    And input title
    And select industry, theme, tags
    And select the target presentation machines
    And submit the form
    Then I should see the uploaded media file in the media list
    And I should see the presentation machines that have the uploaded media file

  #passed: note - Bring Selenium chrome browser to front of other window, otherwise test failed sometime(it seems to be Selenium driver bug)
  Scenario: Admin should upload media files to specific presentation machine when pressing enter
    Given I am on list media files page
    When I upload media file
    And input title
    And select industry, theme, tags
    And select the target presentation machines
    And press enter
    Then I should see the uploaded media file in the media list
    And I should see the presentation machines that have the uploaded media file

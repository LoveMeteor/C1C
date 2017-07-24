Feature: Admin reserve time slot for a engagement
  In order to reserve a time slot for an expected engagement
  As an admin
  I need to add new engagement or modify existing one

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should add new engagement by selecting client, engagement name, start time and end time
    Given I am viewing engagements in list view
    When I add new engagement by entering engagement client name and engagement name
    Then new engagement should be created with the entered information

  #passed
  Scenario: Admin should edit existing engagement
    Given I am viewing engagements in list view
    When I edit any scheduled engagement by entering engagement name, client name and time
    Then I should see the engagement with the updated information

  #passed
  Scenario: Admin should see preview of a media file from search results to be added to the engagement
    Given I am adding new media file to a engagement
    When I select a playlist
    And I choose to preview a media file
    Then I should see a preview of this media file
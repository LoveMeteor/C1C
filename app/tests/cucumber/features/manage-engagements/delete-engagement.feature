Feature: Admin delete engagement
  In order to respond to changes like engagement cancelation
  As an admin
  I need to delete scheduled engagement

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should delete engagement
    Given I am viewing engagements in list view
    When I delete a scheduled engagement
    Then I shouldn't see this engagement in list view
    And I shouldn't see this engagement in weekly view

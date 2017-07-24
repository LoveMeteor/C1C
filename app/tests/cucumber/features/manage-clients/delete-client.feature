Feature: Admin delete client
  In order to manage clients
  As an admin
  I need to delete existing client

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should delete client having no engagements from clients list
    Given I am on clients management page
    When I delete client having no engagements
    Then I should not see him in the clients list

  #not-passed: Not implemented on the FrontEnd yet
  Scenario: Admin should delete client having engagements by confirmation from clients list
    Given I am on clients management page
    When I delete client having engagements
    And confirm deletion
    Then I should not see him in the clients list

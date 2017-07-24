Feature: add and edit clients
  In order to keep track of clients
  As an admin
  I need to add new client, edit existing clients and manage client teams and team mebers.

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should add new client
    Given I am on clients management page
    When I add new client by entering client name, logo, industry and social links
    Then I should see the newely added client in the clients list

  #passed
  Scenario: Admin should edit existing client
    Given I am on clients management page
    When I edit existing client by changing client name, logo, industry and social links
    Then I should see the client with updated data
Feature: list and search clients
  In order to keep track of clients
  As an admin
  I need to list, search clients

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should list all clients
    Given I am on clients management page
    Then I should see all clients listed by name, team and industry

  #passed
  Scenario: Admin should search clients by client name
    Given I am on clients management page
    When I search client names with a keyword with available matches
    Then I should see all clients that exactly/partially match the entered keyword with client name

  #passed
  Scenario: Admin should search clients by industry
    Given I am on clients management page
    When I select an industry
    Then I should see all clients that has this industry

  #passed
  Scenario: Admin should see an empty state if he search for a keyword that doesn't exist
    Given I am on clients management page
    When I search with a keyword with no available matches for clients
    Then I should see no clients found message

  #passed
  Scenario:  Admin should sort clients alphabetically
    Given I am on clients management page
    When I sort clients by title (A-Z)
    Then I should see all clients sorted alphabetically ascending

  #passed
  Scenario: Admin should sort playlists by Newest
    Given I am on clients management page
    When I sort clients by Newest
    Then I should see all clients sorted by creation time descending

  #passed
  Scenario: Admin should sort playlists by Oldest
    Given I am on clients management page
    When I sort clients by Oldest
    Then I should see all clients sorted by creation time ascending

Feature: Admin list all saved playlists
In order to manage playlists
As an admin
I need to list all saved playlists

Background:
  Given I am logged in as admin


  #passed
  Scenario: Admin should see list of all playlists
    Given I am on list playlists page
    Then I should see all saved playlists
    And I should see the presentation machine that have each playlist

  #passed
  Scenario: Admin should search playlists with title
    Given I am on list playlists page
    When I search by a keyword with available matches
    Then I should see all playlists that exactly/partially match the search keyword

  #passed
  Scenario: Admin should search playlists with theme
    Given I am on list playlists page
    When I select a theme
    Then I should see all playlists that has this theme

  #passed
  Scenario: Admin should search playlists with industry
    Given I am on list playlists page
    When I select an industry
    Then I should see all playlists that has this industry

  #passed
  Scenario: Admin should filter playlists by presentation machine
    Given I am on list playlists page
    When I select specific presentation machine
    Then I should see only playlists on this presentation machine

  #passed
  Scenario: Admin should  be able to reset filtering by presentation machine
    Given I am on list playlists page
    When I select all areas filter
    Then I should see all playlists whatever its presentation machine

  #passed
  Scenario: Admin should see an empty state if he search for a keyword that doesn't exist
    Given I am on list playlists page
    When I search with a keyword with no available matches
    Then I should see no results found message

  #passed
  Scenario: Admin should sort playlists alphabetically
    Given I am on list playlists page
    When I sort playlists by title (A-Z)
    Then I should see all playlists sorted alphabetically ascending

  #passed
  Scenario: Admin should sort playlists by Newest
    Given I am on list playlists page
    When I sort playlists by Newest
    Then I should see all playlists sorted by creation time descending

  #passed
  Scenario: Admin should sort playlists by Oldest
    Given I am on list playlists page
    When I sort playlists by Oldest
    Then I should see all playlists sorted by creation time ascending

  #pending: frontend has no 'Verified' option
#  Scenario: Admin should sort playlists by verified
#    Given I am on list playlists page
#    When I sort playlists by verified
#    #pending
#    Then I should see all playlists sorted by verification status ascending

  #passed
  Scenario: Admin should display single playlist details
    Given I am on list playlists page
    When I select a playlist
    Then I should see list of its content

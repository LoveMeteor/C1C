Feature: Admin search media files
In order to manage media in presentation machines
As an admin
I need to search media files at all presentation machines by title

Background:
  Given I am logged in as admin

  #passed
  Scenario: Admin should search media files with title
    Given I am on list media files page
    When I search with a keyword with available matches on list media files page
    Then I should see all media files that exactly/partially match the search keyword

  #passed
  Scenario: Admin should search media files with theme
    Given I am on list media files page
    When I select a theme
    Then I should see all media files that has this theme

  #passed
  Scenario: Admin should search media files with industry
    Given I am on list media files page
    When I select an industry
    Then I should see all media files that has this industry

  #passed
  Scenario: Admin should filter media files to show only images
    Given I am on list media files page
    When I select images filter
    Then I should see only images files

  #passed
  Scenario: Admin should filter media files to show only videos
    Given I am on list media files page
    When I select videos filter
    Then I should see only videos files

  #passed
  Scenario: Admin should be able to reset filtering by media type
    Given I am on list media files page
    When I select all media filter
    Then I should see all media files whatever its type

  #passed
  Scenario: Admin should filter media files by presentation machine
    Given I am on list media files page
    When I select specific presentation machine on list media files page
    Then I should see only media files on this presentation machine

  #passed
  Scenario: Admin should be able to reset filtering by presentation machine
    Given I am on list media files page
    When I select all areas filter on list media files page
    Then I should see all media files whatever its presentation machine

  #passed
  Scenario: Admin should see an empty state if he search for a keyword that doesn't exist
    Given I am on list media files page
    When I search with a keyword with no available matches for media files
    Then I should see no results found message for media files

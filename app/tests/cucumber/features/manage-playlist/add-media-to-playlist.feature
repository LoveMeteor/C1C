Feature: Admin add media to playlist
  In order to manage playlists in presentation machines
  As an admin
  I need to add media to a playlist at any presentation machines

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should add media to a playlist
    Given I am on create playlist page
    When I choose to add new media file
    Then I should see a search form to search media files by industry,theme or title

  #passed
  Scenario: Admin should search media to add it to the playlist
    Given I am adding new media file to a playlist
    When I search with keyword
    Then I should see list of media and playlists that exactly or partially match the entered keyword

  #passed
  Scenario: Admin should filter search results by theme
    Given I am adding new media file to a playlist
    And I entered a keyword to search
    When I filter the results by theme
    Then I should see list of media and playlists that match the keyword and has the entered theme

  #passed
  Scenario: Admin should filter search results by industry
    Given I am adding new media file to a playlist
    And I entered a keyword to search
    When I filter the results by industry
    Then I should see list of media and playlists that match the keyword and has the entered industry

  #passed
  Scenario: Admin should filter search results by type
    Given I am adding new media file to a playlist
    And I entered a keyword to search
    When I filter the results by "all"
    Then I should see list of media according to the selected type
    When I filter the results by "video"
    Then I should see list of media according to the selected type
    When I filter the results by "image"
    Then I should see list of media according to the selected type

  #passed
  Scenario: Admin should select media from search results to be added to the current playlist
    Given I am adding new media file to a playlist
    And I entered a keyword to search
    When I select media
    Then I should see this media added to the current playlist

  #passed
  Scenario: Admin should select playlist from search results to be added to the current playlist
    Given I am adding new media file to a playlist
    And I entered a keyword to search
    When I select to append a playlist
    Then I should see all media files in this playlist added to the current playlist

  #no-passed: No remove icon
  Scenario: Admin should delete one media file from a playlist
    Given I am adding new media file to a playlist
    When I select to append a playlist
    And I delete already added media file
    Then I should not see it in the current playlist

  # Webdriver doesn't support drag and drop ( tested on FF,Chrome and PhantomJS )
  # Scenario: Admin should reoreder media files in the playlist
  #   Given I am adding new media file to a playlist
  #   When I select to append a playlist
  #   And I choose to change selected media files order
  #   Then I should see the updated media files order

  #passed
  Scenario: Admin should set duaration time for an image in playlist
    Given I am adding new media file to a playlist
    When I select image file
    And I set it's duaration in seconds
    Then I should see the image with duration added to this playlist media

  #passed
  Scenario: Admin should see preview of a media file from search results to be added to the current playlist
    Given I am adding new media file to a playlist
    When I select a playlist
    And I choose to preview a media file
    Then I should see a preview of this media file
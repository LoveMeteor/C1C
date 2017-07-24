Feature: Presenter search content
  In order to manage playlists in presentation machines
  As a Presenter
  I need to search for media or playlist

  Background:
    Given I am logged in as presenter

  #passed
  Scenario: search playlists with a keyword
    Given I am searching with a keyword
    When I select playlists accordian
    Then I should see all playlists that exactly or partially match the entered keyword

  #passed
  Scenario: search images with a keyword
    Given I am searching with a keyword
    When I select images accordian
    Then I should see all images that exactly or partially match the entered keyword

  #passed
  Scenario: search videos with a keyword
    Given I am searching with a keyword
    When I select videos accordian
    Then I should see all videos that exactly or partially match the entered keyword

  #passed
  Scenario: Append playlist to current playlist
    Given I am searching for playlist with a keyword
    When I add playlist and choose to Append to currently playing playlist
    Then I should see all media files in this playlist added to the current playlist

  #no-passed: Sometime failed because of canoncial playlistitem empty issue - no found the cause yet
  Scenario: Overwrite current playlist with a playlist
    Given I am searching for playlist with a keyword
    When I add playlist and choose to Overwrite the currently playing playlist
    Then I should see all media files in this playlist replaced the current playlist

  #passed
  Scenario: Add video to the current playlist
    Given I am searching for video with a keyword
    When I add video to the currently playing playlist
    Then I should see this video added at the end of the currently playing playlist

  #passed
  Scenario: Add image to the current playlist
    Given I am searching for image with a keyword
    When I add image to the currently playing playlist
    And set duration to this image
    Then I should see this image added at the end of the currently playing playlist

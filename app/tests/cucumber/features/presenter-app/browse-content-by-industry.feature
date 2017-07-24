Feature: Presenter browse content by Industry
  In order to manage playlists in presentation machines
  As a Presenter
  I need to browse media and playlists by industries

  Background:
    Given I am logged in as presenter

  #passed
  Scenario: list all presentation machines
    Given I am on home page
    Then I should see all Presentation Machines listed

  #passed
  Scenario: List all industries
    Given I am on home page
    When I select specific presentation machine
    And I select industries tab
    Then I should see list of system industries displayed

  #passed
  Scenario: browse playlists by Industry
    Given I am browsing content at specific presentation machine by Industry
    When I select an industry
    Then I should see all playlists in this presentation machine that has the selected Industry

  #passed
  Scenario: Append playlist to current playlist
    Given I am browsing playlists at specific presentation machine by Industry
    When I add playlist and choose to Append to currently playing playlist
    Then I should see all media files in this playlist added to the current playlist

  #no-passed: Sometime failed because of canoncial playlistitem empty issue - no found the cause yet
  Scenario: Overwrite current playlist with a playlist
    Given I am browsing playlists at specific presentation machine by Industry
    When I add playlist and choose to Overwrite the currently playing playlist
    Then I should see all media files in this playlist replaced the current playlist

  #passed
  Scenario: Add playlist to my favourites
    Given I am browsing playlists at specific presentation machine by Industry
    When I add playlist to my favourites
    Then I should see it in my favourites list

  #passed
  Scenario: browse media by Industry
    Given I am browsing content at specific presentation machine by Industry
    When I select an industry
    And switch to media view
    Then I should see all media files in this presentation machine that has the selected Industry listed as media title and media type

  #passed
  Scenario: Add video to the current playlist
    Given I am browsing media at specific presentation machine by Industry
    When I add video to the currently playing playlist
    Then I should see this video added at the end of the currently playing playlist

  #passed
  Scenario: Add image to the current playlist
    Given I am browsing media at specific presentation machine by Industry
    When I add image to the currently playing playlist
    And set duration to this image
    Then I should see this image added at the end of the currently playing playlist

  #passed
  Scenario: Add media to my favourites
    Given I am browsing media at specific presentation machine by Industry
    When I add media to my favourites
    Then I should see it in my favourites list

  #passed
  Scenario: Preview media file
    Given I am browsing media at specific presentation machine by Industry
    When I choose to preview a media file
    Then I should see a preview of this media file

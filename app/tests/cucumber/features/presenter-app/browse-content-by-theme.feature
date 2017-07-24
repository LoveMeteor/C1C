Feature: Presenter browse content by theme
  In order to manage playlists in presentation machines
  As a Presenter
  I need to browse media and playlists by themes

  Background:
    Given I am logged in as presenter

  #passed
  Scenario: List all themes
    Given I am browsing content at specific presentation machine
    When I select browsing by themes
    Then I should see list of system themes displayed

  #passed
  Scenario: browse playlists by theme
    Given I am browsing content at specific presentation machine by theme
    When I select a theme
    Then I should see all playlists in this presentation machine that has the selected theme

  #passed
  Scenario: Append playlist to current playlist
    Given I am browsing playlists at specific presentation machine by theme
    When I add playlist and choose to Append to currently playing playlist
    Then I should see all media files in this playlist added to the current playlist

  #no-passed: Sometime failed because of canoncial playlistitem empty issue - no found the cause yet
  Scenario: Overwrite current playlist with a playlist
    Given I am browsing playlists at specific presentation machine by theme
    When I add playlist and choose to Overwrite the currently playing playlist
    Then I should see all media files in this playlist replaced the current playlist

  #passed
  Scenario: Add playlist to my favourites
    Given I am browsing playlists at specific presentation machine by theme
    When I add playlist to my favourites
    Then I should see it in my favourites list

  #passed
  Scenario: browse media by theme
    Given I am browsing content at specific presentation machine by theme
    When I select a theme
    And switch to media view
    Then I should see all media files in this presentation machine that has the selected theme listed as media title and media type

  #passed
  Scenario: Add video to the current playlist
    Given I am browsing media at specific presentation machine by theme
    When I add video to the currently playing playlist
    Then I should see this video added at the end of the currently playing playlist

  #passed
  Scenario: Add image to the current playlist
    Given I am browsing media at specific presentation machine by theme
    When I add image to the currently playing playlist
    And set duration to this image
    Then I should see this image added at the end of the currently playing playlist

  #passed
  Scenario: Add media to my favourites
    Given I am browsing media at specific presentation machine by theme
    When I add media to my favourites
    Then I should see it in my favourites list

  #passed
  Scenario: Preview media file
    Given I am browsing media at specific presentation machine by theme
    When I choose to preview a media file
    Then I should see a preview of this media file

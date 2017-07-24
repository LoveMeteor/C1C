Feature: Admin view playlist content
  In order to manage playlists
  As an admin
  I need to view list of media files in a playlist

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should list playlist media files
    Given I am on list playlists page
    When I select a playlist
    Then I should see list of media files titles,type and duration in this playlist

  #passed
  Scenario: Admin should see a preview of a media file
    Given I am on list playlists page
    When I select a playlist
    And I choose to preview a media file
    Then I should see a preview of this media file

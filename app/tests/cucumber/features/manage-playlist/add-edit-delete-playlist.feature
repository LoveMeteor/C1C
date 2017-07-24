Feature: Admin add, edit and delete new playlist
  In order to keep lists of related media together
  As an admin
  I need to add, edit and delete playlist

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should add new playlist by giving it a name and select theme, industry and tags
    Given I am on create playlist page
    When I enter playlist name, theme, industry and tags
    And choose the suitable area
    And add medias
    Then new playlist should be created in the selected area

  #passed
  Scenario: Admin should edit existing playlist
    Given I am viewing a playlist
    When I edit a playlist by changing playlist name, theme, industry or tags
    Then I should see the playlist with the updated information

  #passed
  Scenario: Admin should delete playlist
    Given I am on list playlists page
    When I delete a playlist
    Then I shouldn't see this playlist in the list

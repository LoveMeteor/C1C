Feature: Presenter manage currently playing content
  In order to manage playlists in presentation machines
  As a Presenter
  I need to manage and control currently playing content

  Background:
    Given I am logged in as presenter

  #passed
  Scenario: Presenter should list currently playing playlist
    Given I am viewing currently playing playlist in a presentation machine
    Then I should see list of media files titles,type and duration in this playlist

  #passed
  Scenario: Presenter should switch between presentation machines playlists
    Given I am viewing currently playing playlist in a presentation machine
    When I select another presentation machine
    Then I should see playlist of the selected presentation machine

  #passed
  Scenario: Presenter should see currently playing media in the current playlist
    Given I am viewing currently playing playlist in a presentation machine
    Then I should see the currently playing media in different style

  #passed
  Scenario: Presenter should see playlist duration and current progress
    Given I am viewing currently playing playlist in a presentation machine
    Then I should see playlist total duration
    And I should see passed time from the whole playlist duration

  #passed
  Scenario: Pause currently playing media
    Given I am viewing currently playing playlist in a presentation machine
    And this playlist is being played
    When I click pause
    Then the playing of the currently playing media should be paused

  #not passed, not implemented yet
  Scenario: Play media in the playlist
    Given I am viewing currently playing playlist in a presentation machine
    And this playlist is paused
    When I click play
    Then the playing should be started from the same pausing position

  #passed
  Scenario: Jump to next track in the playing playlist
    Given I am viewing currently playing playlist in a presentation machine
    When I click next
    Then the next track in the playlist should be started

  #passed
  Scenario: Jump to previous track in the playing playlist
    Given I am viewing currently playing playlist in a presentation machine
    When I click previous
    Then the previous track in the playlist should be started

  #not passed, not abale to simulate drag and drop
#  @ignore
#  Scenario: Order media files in the playing playlist
#    Given I am viewing currently playing playlist in a presentation machine
#    When I change order of the items in the playlist
#    Then the new order should be saved
#    #pending
#    And I should see the passed time from the whole playlist duration updated

  #not clear scenario yet
  Scenario: toggle repeat option

@ignore
Feature: Admin set overlay to media in a playlist
  In order to manage playlists in presentation machines
  As an admin
  I need to add an overlay to media in a playlist at any presentation machines

  Background:
    Given I am logged in as admin

  Scenario: Admin should set overlay to media file
    Given I am viewing currently playing playlist in a presentation machine
    When I choose overlay
    Then I should be able to enter text to be displayed as overlay
    And see a preview of this overlay style

  Scenario: Admin should enable overlay for a media file
    Given I am viewing currently playing playlist in a presentation machine
    And I entered overlay text
    When I choose enable overlay for a media file
    Then I should see this media file marked as overlay enabled

  Scenario: Admin should disable overlay for a media file
    Given I am viewing currently playing playlist in a presentation machine
    And I entered overlay text
    When I choose disable overlay for a media file
    Then I should see this media file marked as overlay disabled


  Scenario: Admin should enable overlay for multiple media file
    Given I am viewing currently playing playlist in a presentation machine
    And I entered overlay text
    When I select multiple media files
    And I choose enable overlay from bulk actions list
    Then I should see these media files marked as overlay enabled

  Scenario: Admin should disable overlay for a media file
    Given I am viewing currently playing playlist in a presentation machine
    And I entered overlay text
    When I select multiple media files
    And I choose disable overlay from bulk actions list
    Then I should see these media files marked as overlay disabled

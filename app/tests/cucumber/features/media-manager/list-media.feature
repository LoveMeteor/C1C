Feature: Admin list media at Presentation Machine
  In order to manage media and playlist in presentation machines
  As an admin
  I need to browse media at any presentation machines

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should list all media files
    Given I am on list media files page
    Then I should see all uploaded media files
    And I should see it's duration
    And I should see the presentation machines that have this media file
    And I should see all media type beside each media file


  #passed
  Scenario: Admin should sort medias by title alphabetically and created time
    Given I am on list media files page
    When I sort medias by Title (A-Z)
    Then I should see all medias sorted by alphabetically ascending
    When I sort medias by Title (Z-A)
    Then I should see all medias sorted by alphabetically descending
    When I sort medias by Newest
    Then I should see all medias sorted by creation time descending
    When I sort medias by Oldest
    Then I should see all medias sorted by creation time ascending


  #passed
  Scenario: Admin should see a preview of a media file
    Given I am on list media files page
    When I choose to preview a media file
    Then I should see a preview of this media file
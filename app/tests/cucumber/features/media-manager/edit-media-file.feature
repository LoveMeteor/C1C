Feature: Admin edit media files
  In order to manage media in presentation machines
  As an admin
  I need to edit media at any presentation machines

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should edit one media file
    Given I am on list media files page
    When I edit media file in media files page
    Then I should see this media with updated data

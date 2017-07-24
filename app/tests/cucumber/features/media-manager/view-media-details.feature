Feature: Admin view media details
  In order to manage media and playlist in presentation machines
  As an admin
  I need to view media information at any presentation machines

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should view media basic information
    Given I am on list media files page
    When I click on the cog icon
    Then I should see media title
    And I should see media tags
    And I should see media industry and theme
    And I should see list of presentation machines that have this media file

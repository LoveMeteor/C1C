# Has same name bug for Theme and Tag
Feature: Admin manage media tags
  In order to manage media in presentation machines
  As an admin
  I need to add/remove media tag at any presentation machines

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should view media tags
    Given I am on list media files page
    When I click on the cog icon
    Then I should see media tags

  #passed
  Scenario: Admin should tag media using auto complete list from previously added tags
    Given I am viewing media information
    When I add existing tag using auto complete list
    Then I should see this tag listed in tags list

  #passed
  Scenario: Admin should tag media with new tags that is not existing in the tag list
    Given I am viewing media information
    When I add new tag that's not exist in the auto complete list
    Then I should see this tag listed in tags list

  #passed
  Scenario: Admin should remove tag media
    Given I am viewing media information
    And this media has at least one tag
    When I remove a tag
    Then I should not see this tag listed in tags list

  #passed
  Scenario: Admin should see the available areas from list of presentation machines
    Given I am viewing media information
    Then I should be able to see presentation machines that has this media selected in different style

  #passed
  Scenario: Admin should set media available for other presentation machines
    Given I am viewing media information at any presentation machine
    When I set this media available to another presentation machine
    Then I should be able to see presentation machine in different style

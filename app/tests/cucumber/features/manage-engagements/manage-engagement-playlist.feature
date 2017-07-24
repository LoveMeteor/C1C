Feature: manage engagement playlist for all presentation machines
  In order to manage the playlist of an expected engagement
  As an admin
  I need to list, add, delete, set overlay and order media files in a playlist

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should list media files for each presentation machine
    Given I am on engagement details page
    Then I should see playlist for each presentation machine

  #passed
  Scenario: Admin should add media file to a playlist
    Given I am on engagement details page
    When I add media file to presentation machine playlist
    Then I should see this media file in the playlist
    And I should see icon to determine its type

  #no-passed: Could not find overlay toggle and text input on new review section
#  Scenario: Admin should set overlay for Reception Hall presentation machine's playlist
#    Given I am on engagement details page
#    Then I should be able to enter text to be displayed as overlay

  #no-passed: by Issue #613 and no overlay toogle on new review section
#  Scenario: Admin should enable overlay for a media file in a playlist
#    Given I am on engagement details page
#    And I entered overlay text
#    When I choose enable overlay for a media file
#    Then I should see this media file marked as overlay enabled

  #no-passed: by Issue #613 and no overlay toogle on new review section
#  Scenario: Admin should disable overlay for a media file in a playlist
#    Given I am on engagement details page
#    And I entered overlay text
#    When I choose disable overlay for a media file
#    Then I should see this media file marked as overlay disabled

  #no-passed: by Issue #613 and no remove icon on new review section
#  Scenario: Admin should delete media file from a playlist
#    Given I am on engagement details page
#    When I delete media file in engagement detail
#    Then I should not see it in its old playlist

  #pending
  #Scenario: Admin should order media files for each presentation machine's playlist
  #  Given I am on engagement details page
  #  When I choose to change media file order
  #  Then I should see the updated media files order

  #passed
  Scenario: Admin should create new engagement by copying previous engagement's playlist
    Given I am on engagement creation page
    When I search for previous engagement and select it
    Then I should see engagement title and date empty
    And I should see playlist content filled with the content from the selected playlist



Feature: Admin delete media files
  In order to manage media in presentation machines
  As an admin
  I need to remove media at any presentation machines

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should delete one unlinked media file
    Given I am on list media files page
    When I delete media file in media files page
    Then I should not see it in the media list

#  Scenario: Admin could not delete medias linked to canoncial playlist
#    Given I am on list media files page
#    When I delete media file linked to canoncial playlist in media files page
#    Then I should see "Couldn't delete medias to linked canoncial playlist" alert
#
#  Scenario: Admin could not delete medias linked to future engagement playlist
#    Given I am on list media files page
#    When I delete media file linked to engagement playlist in media files page
#    Then I should see "Couldn't delete medias to linked future engagement playlist" alert


Feature: Admin view all engagements
  In order to see what is happening and where available slots are
  As an admin
  I need to view all engagements

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should see today engagements in calendar view showing its start and end time
    Given I am viewing engagements in list view
    Then I should see list of all engagements scheduled today
    And I should see it's start and end time

  #passed
  Scenario: Admin should see this week engagements in calendar view showing its start and end time
    Given I am viewing this week engagements in weekly view
    Then I should see names and start, end times of all engagements scheduled in this week

  #passed
  Scenario: Admin should navigate through weeks to see engagements in each week
    Given I am viewing this week engagements in weekly view
    When I choose another week
    Then I should see names and start, end times of all engagements scheduled in that week

  #passed
  Scenario: Admin should search engagements with title
    Given I am viewing engagements in list view
    When I search with a keyword with available matches
    Then I should see all engagements that exactly/partially match the search keyword

  #passed
  Scenario: Admin should search engagements by client
    Given I am viewing engagements in list view
    When I select a client
    Then I should see this client's engagements

  #passed
  Scenario: Admin should search engagements by date
    Given I am viewing engagements in list view
    When I select a specific date
    Then I should see all engagementsthis scheduled on this date

  #passed
  Scenario: Admin should sort engagements
    Given I am viewing engagements in list view
    When I sort engagements by Chronological
    Then I should see all engagements sorted chronologically
    When I sort engagements by Title (A-Z)
    Then I should see all engagements sorted ascending alphabetically
    When I sort engagements by Title (Z-A)
    Then I should see all engagements sorted descending alphabetically


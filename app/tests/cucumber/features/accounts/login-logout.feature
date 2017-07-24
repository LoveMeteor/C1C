Feature: User login and logout
  In order to connect to the Admin or the presenter
  As an human
  I need to connect and disconnect to the website

  Background:
    Given I am not logged in

  #passed
  Scenario: Admin should login as an administrator
    Given I am on login page
    When I log in as an administrator
    Then I should see the engagement page

  #passed
  Scenario: Admin should logout from the Admin
    Given I am logged in as an admin
    When I click on Account button
    And I click on Sign out button
    Then I should be redirected to the login page

  #passed
  Scenario: Presenter should login as a presenter
    Given I am on login page
    When I log in as a presenter
    Then I should see the presenter page

  #passed
  Scenario: Presenter should logout from the presenter
    Given I am logged in as a presenter
    When I click on Sign out button
    Then I should be redirected to the login page
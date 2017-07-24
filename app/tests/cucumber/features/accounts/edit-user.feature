Feature: Admin edit user
  In order to manage user list
  As an admin
  I need to edit and delete user

  Background:
    Given I am logged in as admin

  #passed
  Scenario: Admin should edit user
    Given I am viewing user list
    When I edit existing user by changing first name, last name and role
    Then I should see the user with updated data

  #passed
  Scenario: Admin should delete user
    Given I am viewing user list
    When I delete an user
    Then I shouldn't see this user in list

Feature: Setup tests

  As a human
  I want to setup tests with cucumber.js
  So cucumber tests run

  Scenario: Setup mocha test
    Given I am in cic-cms repo
    And I have done `meteor install`
    When I do `meteor test`
    Then the mocha tests should run

  Scenario: Setup cucumber test
    Given I am in cic-cms repo
    And I have done `meteor install`
    And I have done `cd tests/cucumber`
    When I do `chimp —browser=phantomjs`
    Then all my cucumber.js tests should run
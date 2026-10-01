@authentication
Feature: Authentication
  As a registered store customer
  I want to log in and log out with my credentials
  So that I can access my account securely

  @smoke
  Scenario: 002 [LOGIN] Validate registered user logs in and sees their name in the header
    Given a registered user with valid credentials
    When the user logs in
    Then the user is logged in to their account

  Scenario: 003 [LOGIN] Validate incorrect password shows the invalid credentials error
    Given a registered user with valid credentials
    When the user logs in with an incorrect password
    Then the user is told the credentials are incorrect

  Scenario: 004 [LOGOUT] Validate logged-in user returns to the login page without an active session
    Given a registered user is logged in
    When the user logs out
    Then the user is back on the login page without an active session

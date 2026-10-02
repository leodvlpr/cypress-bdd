@registration
Feature: User registration
  As a store visitor
  I want to create an account
  So that I can shop with my details saved

  @smoke
  Scenario: 005 [SIGNUP] Validate new visitor creates an account and is logged in
    When a visitor signs up with new details
    Then the account is created and the user is logged in

  Scenario: 006 [SIGNUP] Validate already registered email shows the email exists error
    Given a registered user with valid credentials
    When a visitor tries to sign up with that user's email
    Then the visitor is told the email is already registered

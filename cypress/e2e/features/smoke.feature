Feature: Smoke test
  As a developer
  I want to confirm the Cypress + Cucumber wiring works
  So that I can start building real coverage with confidence

  Scenario: Homepage loads
    Given I visit the homepage
    Then I should see the automationexercise logo

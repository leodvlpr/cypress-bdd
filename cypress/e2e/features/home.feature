@home
Feature: Home page
  As a store visitor
  I want the home page to load with the store branding
  So that I know I am on the right store

  @smoke
  Scenario: 001 [HOME] Validate homepage loads and displays the site logo
    When a visitor opens the home page
    Then the store logo is displayed in the header

@contact
Feature: Contact
  As a store visitor
  I want to send an inquiry
  So that I get help from the support team

  Scenario: 012 [CONTACT] Validate contact form submission shows the success confirmation
    When a visitor submits an inquiry through the contact form
    Then the visitor sees confirmation that the inquiry was sent

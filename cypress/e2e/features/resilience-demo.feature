@demo @resilience
Feature: Selector resilience demo
  As a test engineer
  I want to see a deliberately degraded selector resolved by its fallback
  So that I can trust drift logging to flag broken selectors without failing the suite

  Scenario: 013 [RESILIENCE] Validate degraded primary selector falls back to its next strategy and logs demo drift
    When a visitor opens the home page
    Then the store logo is still found through its fallback selector
    And the fallback is recorded in the demo drift log

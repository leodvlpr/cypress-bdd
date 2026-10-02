@catalog
Feature: Product catalog
  As a store customer
  I want to find products and check their information
  So that I can decide what to buy

  @smoke
  Scenario: 007 [SEARCH] Validate searched product appears in the search results
    When the customer searches for the product "Blue Top"
    Then "Blue Top" appears in the search results

  Scenario: 008 [PRODUCT] Validate product detail shows name, category, price, availability, condition and brand
    When the customer opens the details of the product "Blue Top"
    Then the full details of the product "Blue Top" are shown

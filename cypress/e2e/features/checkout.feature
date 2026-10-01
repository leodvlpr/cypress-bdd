@checkout
Feature: Checkout
  As a registered customer
  I want to pay for the products in my cart
  So that I receive my order at my account address

  @smoke
  Scenario: 011 [CHECKOUT] Validate logged-in user places an order delivered to their profile address
    Given a registered user is logged in
    And the customer has 2 units of "Blue Top" in the cart
    When the customer proceeds to checkout
    Then the delivery address matches the customer's profile
    When the customer pays for the order with a test card
    Then the order is confirmed

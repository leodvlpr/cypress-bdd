@cart
Feature: Shopping cart
  As a store customer
  I want to manage the products in my cart
  So that I buy exactly what I need

  @smoke
  Scenario: 009 [CART] Validate cart lists each added product with its quantity and total price
    When the customer adds to the cart:
      | product    | quantity |
      | Blue Top   | 3        |
      | Men Tshirt | 1        |
    Then the cart contains:
      | product    | quantity |
      | Blue Top   | 3        |
      | Men Tshirt | 1        |

  Scenario: 010 [CART] Validate removed product disappears and the cart is shown as empty
    Given the customer has 1 unit of "Blue Top" in the cart
    When the customer removes "Blue Top" from the cart
    Then "Blue Top" is no longer in the cart

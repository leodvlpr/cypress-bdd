@cart
Feature: Carrito de compra
  Como cliente de la tienda
  Quiero gestionar los productos de mi carrito
  Para comprar exactamente lo que necesito

  @smoke
  Scenario: Un cliente añade varios productos con distintas cantidades
    When añade al carrito:
      | producto   | cantidad |
      | Blue Top   | 3        |
      | Men Tshirt | 1        |
    Then el carrito contiene:
      | producto   | cantidad |
      | Blue Top   | 3        |
      | Men Tshirt | 1        |

  Scenario: Un cliente elimina un producto del carrito
    Given tiene en el carrito 1 unidad de "Blue Top"
    When elimina "Blue Top" del carrito
    Then "Blue Top" ya no está en el carrito

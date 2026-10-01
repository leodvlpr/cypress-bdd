@checkout
Feature: Finalizar compra
  Como cliente registrado
  Quiero pagar los productos de mi carrito
  Para recibir mi pedido en la dirección de mi cuenta

  @smoke
  Scenario: Un cliente con sesión iniciada completa un pedido
    Given ha iniciado sesión como usuario registrado
    And tiene en el carrito 2 unidades de "Blue Top"
    When procede a finalizar la compra
    Then la dirección de entrega es la de su perfil
    When paga el pedido con una tarjeta de prueba
    Then el pedido queda confirmado

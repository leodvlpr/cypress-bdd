@catalog
Feature: Catálogo de productos
  Como cliente de la tienda
  Quiero encontrar productos y consultar su información
  Para decidir qué comprar

  @smoke
  Scenario: Un cliente busca un producto por su nombre
    When busca el producto "Blue Top"
    Then "Blue Top" aparece en los resultados de búsqueda

  Scenario: Un cliente consulta el detalle de un producto
    When consulta el detalle del producto "Blue Top"
    Then ve la ficha completa del producto "Blue Top"

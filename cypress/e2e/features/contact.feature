@contact
Feature: Contacto
  Como visitante de la tienda
  Quiero enviar una consulta
  Para recibir ayuda del equipo de atención

  Scenario: Un visitante envía una consulta
    When un visitante envía una consulta desde el formulario de contacto
    Then recibe la confirmación de que su consulta se ha enviado

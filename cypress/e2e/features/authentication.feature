@authentication
Feature: Autenticación
  Como cliente registrado de la tienda
  Quiero iniciar y cerrar sesión con mis credenciales
  Para acceder a mi área privada de forma segura

  @smoke
  Scenario: Un usuario registrado accede a su área privada
    Given existe un usuario registrado con credenciales válidas
    When inicia sesión
    Then accede a su área privada

  Scenario: Un usuario no puede acceder con una contraseña incorrecta
    Given existe un usuario registrado con credenciales válidas
    When inicia sesión con una contraseña incorrecta
    Then se le informa de que las credenciales son incorrectas

  Scenario: Un usuario cierra su sesión
    Given ha iniciado sesión como usuario registrado
    When cierra sesión
    Then vuelve a la pantalla de acceso sin sesión activa

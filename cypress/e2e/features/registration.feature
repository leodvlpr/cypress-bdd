@registration
Feature: Registro de usuarios
  Como visitante de la tienda
  Quiero crear una cuenta
  Para poder comprar con mis datos guardados

  @smoke
  Scenario: Un visitante crea una cuenta nueva
    When un visitante se registra con datos nuevos
    Then su cuenta queda creada con la sesión iniciada

  Scenario: No se puede registrar un email que ya existe
    Given existe un usuario registrado con credenciales válidas
    When un visitante intenta registrarse con el email de ese usuario
    Then se le informa de que el email ya está registrado

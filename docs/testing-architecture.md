# Arquitectura de pruebas

Framework E2E con Cypress + TypeScript + Cucumber (`@badeball/cypress-cucumber-preprocessor`) contra
https://automationexercise.com. Está organizado en **componentes de interacción y flows de negocio**, no en
Page Objects.

## Flujo de capas

```text
feature (.feature)  →  step definition  →  flow  →  component  →  selector / custom command
```

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Feature | `cypress/e2e/features/` | Comportamiento observable en Gherkin. Sin selectores ni rutas. |
| Step definition | `cypress/support/step_definitions/` | Traduce Gherkin a llamadas a flows/componentes. Delgada, sin selectores. |
| Flow | `cypress/support/flows/` | Compone componentes para una intención de negocio (`signIn`). No conoce Gherkin. |
| Component | `cypress/support/components/` | Una interacción pequeña y estable sobre un fragmento de UI (`authComponent.fillCredentials`). Objetos de funciones, no clases. |
| Selector | `cypress/support/selectors/` | Valores `data-qa` por dominio. Sin lógica de Cypress. |
| Command | `cypress/support/commands/` | Primitivas universales (`cy.getByQa`) y seeding por API. Tipados en `support/types/cypress.d.ts`. |
| Datos | `cypress/support/data/`, `cypress/fixtures/` | Factorías de datos únicos por escenario y catálogo de productos de referencia. |
| Contexto | `cypress/support/world.ts`, `step_definitions/hooks.ts` | Estado por escenario (`this`) y limpieza tras cada escenario. |

## Cobertura actual

| Feature | Escenarios | Componentes / flows |
| --- | --- | --- |
| `authentication.feature` | Login correcto (`@smoke`), contraseña incorrecta, logout | `auth`, `navigation` / `authentication.flow` |
| `registration.feature` | Alta de cuenta por UI (`@smoke`), email ya registrado | `registration`, `navigation` / `registration.flow` |
| `catalog.feature` | Búsqueda (`@smoke`), ficha de producto | `catalog` / `catalog.flow` |
| `cart.feature` | Añadir varios productos con cantidades (`@smoke`, DataTable tipada), eliminar producto | `catalog`, `cart` / `cart.flow` |
| `checkout.feature` | Pedido completo con sesión: dirección de entrega + pago (`@smoke`) | `cart`, `checkout` / `checkout.flow` |
| `contact.feature` | Envío del formulario de contacto | `contact` / `contact.flow` |
| `smoke.feature` | Carga de la home (cableado del setup) | — |

Fuera de alcance por ahora: suscripción, categorías/marcas, reseñas, factura y scroll.

> Los step definitions viven en `cypress/support/step_definitions/` porque así lo define
> `.cypress-cucumber-preprocessorrc.json` desde el setup inicial.

## Convención de selectores

- La aplicación ya usa **`data-qa`** (`login-email`, `login-password`, `login-button`, …), por eso es la única
  convención del framework: `cy.getByQa('login-email')`. No se introduce `data-testid` ni `data-cy`.
- Los selectores se guardan como **valor** del atributo, agrupados por dominio y con nombre semántico:

  ```ts
  export const authSelectors = { loginEmailInput: 'login-email' } as const;
  ```

- **Orden de preferencia** cuando un elemento no tiene `data-qa`:
  1. `id` o atributo `data-*` propio de la app (`#search_product`, `#product-1`, `[data-product-id="1"]`),
     guardado como selector CSS completo en el fichero de selectores y usado con `cy.get`. Cada uno está
     marcado con un comentario y listado abajo como petición de `data-qa`.
  2. Nombre accesible del control (`cy.contains('button', 'Add to cart')`) cuando no hay ningún atributo estable.
- Prohibido: XPath, clases de estilo, estructura DOM, índices (`:nth-child`) o texto como selector principal.
  El texto visible solo se usa cuando **es** el contrato que se valida (p. ej. `Logged in as <nombre>`).
- Si un elemento no tiene `data-qa`, se documenta la petición a desarrollo en lugar de inventar un selector frágil.

### Atributos `data-qa` pendientes de desarrollo

| Elemento | Atributo propuesto | Uso actual |
| --- | --- | --- |
| Indicador de sesión en cabecera ("Logged in as …") | `data-qa="logged-in-user"` | Texto visible (contrato de negocio) |
| Enlace Logout de la cabecera | `data-qa="logout-link"` | Nombre accesible "Logout" |
| Mensajes de error de login / registro | `data-qa="login-error"`, `data-qa="signup-error"` | Texto visible del mensaje |
| Buscador de productos | `data-qa="search-input"`, `data-qa="search-button"` | `#search_product`, `#submit_search` |
| Cantidad y botón "Add to cart" en la ficha | `data-qa="quantity"`, `data-qa="add-to-cart"` | `#quantity`, nombre accesible |
| Modal "Added!" | `data-qa="cart-added-modal"` | `#cartModal` |
| Filas del carrito, cantidad y borrar | `data-qa="cart-row"`, `data-qa="cart-quantity"`, `data-qa="cart-remove"` | `#product-<id>`, `[data-product-id]`, texto del botón |
| "Proceed To Checkout" / "Place Order" | `data-qa="proceed-to-checkout"`, `data-qa="place-order"` | Nombre accesible |
| Dirección de entrega y comentario del pedido | `data-qa="delivery-address"`, `data-qa="order-comment"` | `#address_delivery`, `textarea[name="message"]` |
| Mensaje de éxito de contacto | `data-qa="contact-success"` | Texto visible del mensaje |

## Cuándo crear cada pieza

- **Component**: una interacción reutilizable sobre una zona concreta de la UI (formulario de login, cabecera,
  modal, toast). Hace una comprobación mínima de disponibilidad (`should('be.visible')`) antes de interactuar.
  Nunca navega, autentica y verifica a la vez.
- **Flow**: cuando una intención de negocio necesita varios componentes (`openLogin`, `signIn`). Sin asserts
  propios de un escenario; espera condiciones observables (alias de red) que forman parte de su contrato.
- **Custom command**: solo para primitivas universales y repetidas (`getByQa`) o seeding/limpieza por API
  (`createAccountByApi`, `deleteAccountByApi`). No se convierten flows en `cy.*` ni se crean comandos que acepten
  selectores arbitrarios. Cada comando lleva JSDoc y declaración en `cypress.d.ts`.
- **Step definition**: vocabulario de dominio (`When inicia sesión`), nunca genérico (`When I click "X"`).

## Datos de prueba

- Cada escenario crea su propio usuario con `buildUniqueUser()` (email único + contraseña aleatoria) mediante
  `cy.createAccountByApi()` contra la API pública `POST /api/createAccount`.
- El hook `After` lo elimina con `cy.deleteAccountByApi()` (`DELETE /api/deleteAccount`), así la ejecución es
  idempotente y paralelizable.
- El estado del escenario se comparte en el contexto (`this`) del preprocesador y se limpia tras cada escenario.
- No hay credenciales reales en el repositorio. Las contraseñas no se escriben en el log de Cypress
  (`log: false`, `failOnStatusCode: false`).
- El catálogo de referencia (`cypress/fixtures/products.json`) refleja productos estables de la tienda demo
  (verificados contra `GET /api/productsList`). Los features nombran productos y `findProduct()` falla con la
  lista de productos conocidos si el nombre no existe.
- Las tablas de Gherkin se convierten a tipos (`parseCartTable`) y una fila inválida falla indicando fila y columna.
- El pago usa la tarjeta pública de prueba 4111 1111 1111 1111; la tienda no procesa pagos reales.
- `cy.loginByApi` / `cy.setAuthSession` **no** se implementan: `POST /api/verifyLogin` solo valida credenciales
  y no emite cookie de sesión, por lo que el login se hace por UI.

## Red y terceros

- Cada flow declara `cy.intercept()` antes de la acción y espera el alias, nunca una duración fija: `POST /login`,
  `GET /logout`, `POST /signup`, `GET /products?search=`, `GET /add_to_cart/<id>`, `GET /delete_cart/<id>`,
  `GET /checkout`, `POST /payment`.
- El formulario de contacto **no envía nada al servidor**: el JS de la página muestra un `confirm` y pinta el
  mensaje de éxito en cliente. El flow espera ese `confirm` (stub `window:confirm`) como condición observable.
  El escenario valida la experiencia de usuario, no la recepción del mensaje en backend.
- `cypress.config.ts` bloquea con `blockHosts` el diálogo de consentimiento (Google Funding Choices) y los
  anuncios: superponen la página de forma no determinista y no forman parte del sistema bajo prueba.

## Ejecución local

```bash
npm install
npm run typecheck
npx cypress run --spec cypress/e2e/features/authentication.feature   # feature de referencia
npx cypress run --spec "cypress/e2e/features/cart.feature"           # cualquier feature por separado
npm run cy:run                                                       # toda la suite
npm run cy:open                                                      # modo interactivo
```

Requiere acceso a internet hacia https://automationexercise.com.

## Política futura de self-healing (no implementada)

1. Detectar el selector roto y recopilar evidencia (DOM, screenshot, request/response, histórico de ejecuciones).
2. Proponer una reparación basada en atributos de prueba, sujeta a revisión humana.
3. Validar en CI y abrir PR; nunca modificar selectores ni aceptar resultados automáticamente en `main`.
4. Medir tasa de flakiness, fallos reparados y falsos positivos.

Un mecanismo que "encuentra algo parecido" puede ocultar una regresión real y restar credibilidad a la suite, por
eso no se añaden fallbacks de selectores ni auto-reparación silenciosa.

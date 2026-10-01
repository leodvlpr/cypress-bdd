# Instrucciones para Claude Code: Componentes reutilizables para Cypress + Cucumber

## Rol y objetivo

Actúa como un **Senior QA Automation Engineer**. Trabaja sobre el repositorio existente y construye únicamente la primera capa de un framework de pruebas E2E basado en **Cypress + Cucumber + Gherkin + BDD**. La arquitectura debe estar orientada a **componentes de interacción reutilizables por flujo de negocio**, no a Page Object Model (POM).

El objetivo de este cambio es dejar una base pequeña, clara y extensible para escribir escenarios Gherkin legibles y vincularlos a flujos/componentes reutilizables. No implementes todavía GitHub Actions, notificaciones por email, revisión con Claude, ni self-healing completo; solo deja puntos de extensión documentados cuando aporten valor.

> Antes de modificar archivos, inspecciona el `package.json`, la configuración de Cypress, los directorios existentes, el `README` y los ficheros de configuración de TypeScript/ESLint. Conserva las decisiones y versiones ya adoptadas. No sustituyas el preprocesador Cucumber ni reestructures el proyecto si el setup actual ya funciona.

## Principios obligatorios

1. **BDD primero.** Los `.feature` describen intención y comportamiento observable, no selectores, rutas internas ni detalles de implementación.
2. **Sin POM.** No crees clases del estilo `LoginPage`, `DashboardPage`, `BasePage`, ni métodos que representen una página completa. Tampoco escondas POM bajo otro nombre.
3. **Componentes y flujos.** Modela capacidades reutilizables de interfaz: `auth`, `navigation`, `form`, `modal`, `toast`, `table`, `date-picker`, etc. Los _flows_ componen esas capacidades para lograr una intención de negocio, por ejemplo `signInAs()` o `createProject()`.
4. **Responsabilidad única.** Los componentes encapsulan una interacción estable y pequeña; los flows orquestan varios componentes; los step definitions traducen lenguaje Gherkin a flows/acciones. No mezclar estas capas.
5. **Selectores explícitos y estables.** Prioriza `data-testid` o `data-cy` acordados con desarrollo. No uses XPath, selectores dependientes de clases de estilo, estructura DOM, índices (`:nth-child`) ni texto como selector principal. Usa el texto visible solo cuando sea el contrato de accesibilidad/negocio que se está validando.
6. **Pruebas deterministas.** No uses `cy.wait(1000)`, esperas arbitrarias, `force: true`, reintentos manuales ni dependencias entre escenarios. Espera una condición observable, un alias de red o un estado accesible.
7. **Código TypeScript estricto.** Respeta la configuración existente. No introduzcas `any` salvo una justificación localizada. Añade tipos para datos de escenario, respuestas y comandos personalizados.
8. **Cambios mínimos.** Añade solo dependencias imprescindibles. No cambies reglas globales de timeout para resolver inestabilidad local.

## Arquitectura objetivo

Adapta nombres y extensiones a la estructura real del repositorio, pero preserva estas responsabilidades:

```text
cypress/
  e2e/
    features/
      authentication.feature
    step-definitions/
      authentication.steps.ts
  support/
    commands/
      authentication.commands.ts
      ui.commands.ts
      index.ts
    components/
      auth.component.ts
      navigation.component.ts
      feedback.component.ts
    flows/
      authentication.flow.ts
    selectors/
      auth.selectors.ts
    types/
      cypress.d.ts
    e2e.ts
  fixtures/
```

Si el preprocesador obliga a otra ubicación para features o step definitions, conserva su convención. La separación de responsabilidades sí es obligatoria.

### 1. Selectores (`support/selectors`)

- Centraliza únicamente selectores `data-*` que sean propios y estables.
- Expórtalos por dominio, con nombres semánticos y sin lógica de Cypress.
- Un selector debe ser un contrato de UI, por ejemplo `emailInput: '[data-cy="login-email"]'`.
- Si la aplicación no dispone todavía de atributos estables, documenta qué atributos necesita añadir desarrollo. No inventes selectores frágiles como sustituto.

### 2. Componentes (`support/components`)

- Deben ser funciones puras de orquestación Cypress, no clases.
- Cada función opera sobre una capacidad o fragmento de interfaz y recibe datos explícitos.
- Deben realizar una comprobación mínima de disponibilidad antes de interactuar y devolver la cadena Cypress cuando tenga sentido.
- Ejemplos válidos: `authComponent.fillCredentials()`, `authComponent.submit()`, `feedbackComponent.expectSuccessToast()`.
- Ejemplos inválidos: `loginPage.login()`, `dashboardPage.openSettings()`, o un componente que navega, autentica y verifica todo a la vez.

### 3. Flows (`support/flows`)

- Componen componentes para una intención reutilizable de negocio.
- Ejemplo: `signIn({ email, password })` llama a `authComponent.fillCredentials()` y `authComponent.submit()`; la navegación inicial puede ser responsabilidad explícita del escenario o de un flow `openLogin()` separado.
- No coloques asserts específicos de un escenario dentro de un flow, salvo postcondiciones universales del flow que formen parte de su contrato.
- El flow no debe conocer frases Gherkin ni tablas Cucumber.

### 4. Custom Commands (`support/commands`)

Usa comandos para primitivas universales, repetidas y expresivas; no conviertas todos los flows en `cy.*`.

Implementa, si no existen equivalentes:

- `cy.getByTestId(testId, options?)`: localiza `[data-testid="..."]` de forma segura.
- `cy.getByCy(testId, options?)`: localiza `[data-cy="..."]` si esa es la convención ya adoptada. No mantengas dos convenciones nuevas sin necesidad.
- `cy.loginByApi(credentials)`: solo si el backend y el setup de test lo permiten; debe autenticar por API de forma controlada, validar la respuesta y no registrar secretos.
- `cy.setAuthSession(...)`: solo si el mecanismo de sesión de la aplicación está bien definido y permite aislamiento. Usa `cy.session()` cuando corresponda.

Todos los comandos deben tener declaración TypeScript en `cypress.d.ts`, documentación JSDoc breve y tests de uso representativos. Evita un comando genérico que acepte una cadena arbitraria de selector: solo oculta fragilidad.

### 5. Step definitions (`e2e/step-definitions`)

- Deben ser delgadas: parsean parámetros Gherkin, convierten datos de tablas a tipos y llaman a flows/componentes.
- No deben contener selectores, peticiones HTTP de bajo nivel, lógica de negocio duplicada ni grandes assertions.
- Evita steps genéricos como `When I click "X"`; favorece vocabulario de dominio: `When el usuario inicia sesión con credenciales válidas`.
- Define tipos para `DataTable` y validación clara de campos obligatorios. Un dato inválido debe fallar con un mensaje útil.
- No uses estado global mutable entre steps. Si es imprescindible compartir datos de escenario, usa el `World`/contexto que recomiende el preprocesador ya instalado y límpialo por escenario.

## Entregables a implementar

1. Verifica que los scripts de Cypress y Cucumber existentes ejecutan al menos un feature. Si faltan por una configuración incompleta, corrígela con el cambio mínimo y explica la decisión.
2. Crea un feature de referencia pequeño y realista: **autenticación exitosa**. Debe expresar el comportamiento, por ejemplo:

```gherkin
@smoke @authentication
Feature: Autenticación

  Scenario: Un usuario registrado accede a su área privada
    Given existe un usuario registrado con credenciales válidas
    When inicia sesión
    Then accede a su área privada
```

No implementes pasos que supongan datos/productos que el repositorio no posee. Ajusta el feature al dominio real de la aplicación. Si no hay app o entorno disponible, deja el feature marcado como plantilla/documentación y explica qué contratos faltan.

3. Implementa el conjunto mínimo de selector + componente + flow + step definitions necesario para dicho feature, siguiendo las capas anteriores.
4. Implementa los custom commands estrictamente necesarios y sus declaraciones TypeScript.
5. Añade documentación corta en el `README` existente, o en `docs/testing-architecture.md` si aún no hay sección apropiada, que explique:
   - flujo `feature → step definition → flow → component → selector/command`;
   - convención para nuevos selectores;
   - cuándo crear un componente, flow o command;
   - cómo ejecutar localmente el feature de referencia.
6. Añade o actualiza una estrategia de datos de prueba para el ejemplo. Prioridad: API/seeding idempotente o fixture controlado. Nunca credenciales reales ni datos de producción en el repositorio.

## Manejo de red y datos

- Para E2E crítico, usa el backend real en un entorno de prueba controlado cuando sea viable; observa endpoints relevantes con `cy.intercept()` y espera el alias, no una duración fija.
- Usa _stubs_ con `cy.intercept()` para errores, latencia y casos límite; no para convertir toda la suite E2E en una prueba aislada del backend.
- Declara `cy.intercept()` antes de la acción que dispara la solicitud, especialmente antes de `cy.visit()` si la solicitud se hace al cargar la página.
- Los escenarios deben crear y limpiar sus datos o usar datos idempotentes con identificadores únicos. La ejecución paralela no debe generar colisiones.
- No expongas tokens, contraseñas, connection strings ni PII en logs, screenshots, vídeos, fixtures o mensajes de error.

## Preparación para mantenimiento y self-healing (sin implementarlo todavía)

Diseña para que los cambios de UI se localicen en archivos de selector/componente. **No** agregues IA, auto-reparación silenciosa, fallback a múltiples selectores ni tests que aprueben pese a no verificar el comportamiento esperado.

Deja, como máximo, una sección de documentación con esta política futura:

1. Detectar selector roto y recopilar evidencia (DOM, screenshot, request/response, ejecución histórica).
2. Proponer una reparación usando atributos de prueba y revisión humana.
3. Ejecutar validación en CI y abrir PR; nunca modificar selectores ni aceptar resultados automáticamente en `main`.
4. Medir tasa de flakiness, fallos reparados y falsos positivos.

La razón es importante: un mecanismo que “encuentra algo parecido” puede ocultar una regresión real y reducir la credibilidad de la suite.

## Calidad, verificación y entrega

Antes de finalizar:

1. Ejecuta el chequeo de tipos, lint y formato disponibles.
2. Ejecuta el feature/espec de referencia en modo headless si hay aplicación/entorno configurado. Si no puede ejecutarse, no simules éxito: indica exactamente el comando intentado, el bloqueo y lo que falta.
3. Comprueba que cada escenario pasa de manera independiente y que no contiene `cy.wait(<número>)`, `force: true`, `.only`, credenciales hard-coded ni selectores CSS de presentación.
4. Revisa el diff para asegurar que no se han modificado archivos ajenos a este alcance.
5. Entrega un resumen con: archivos creados/modificados, arquitectura resultante, comandos ejecutados, resultados y cualquier decisión/limitación que requiera revisión humana.

## Criterios de aceptación

- Existe un feature Gherkin de referencia legible, junto con step definitions delgadas.
- La interacción se organiza como selector → componente → flow → step definition, sin clases Page Object ni funciones “de página”.
- Los custom commands necesarios están tipados y no duplican flows.
- No hay esperas fijas ni selectores frágiles en los archivos nuevos.
- La documentación permite a otro ingeniero extender el framework de modo consistente.
- La validación ejecutada y sus resultados quedan reportados con honestidad.

## Fuera de alcance de esta iteración

- Workflow semanal de GitHub Actions y correo.
- Automatización de PR review con Claude.
- Implementación de self-healing con IA.
- Cobertura completa de UI/API, reportes, visual testing, performance o accesibilidad.

Después de entregar esta base, espera confirmación antes de implementar cualquiera de esos bloques.

import { resilienceDemoSelectors } from '../selectors/resilience-demo.selectors';

/** The header logo, looked up through a deliberately degraded definition (@demo only). */
export const resilienceDemoComponent = {
  expectDegradedLogoResolved() {
    return cy.getElement(resilienceDemoSelectors.degradedLogo).should('be.visible');
  },
};

import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { expectDegradedLogoDriftInDemoLog } from '../assertions/drift.assertions';
import { resilienceDemoComponent } from '../components/resilience-demo.component';

Then('the store logo is still found through its fallback selector', () => {
  resilienceDemoComponent.expectDegradedLogoResolved();
});

Then('the fallback is recorded in the demo drift log', () => {
  expectDegradedLogoDriftInDemoLog();
});

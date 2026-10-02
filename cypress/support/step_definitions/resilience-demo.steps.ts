import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { resilienceDemoComponent } from '../components/resilience-demo.component';
import { expectDegradedLogoDriftInDemoLog } from '../flows/resilience-demo.flow';

Then('the store logo is still found through its fallback selector', () => {
  resilienceDemoComponent.expectDegradedLogoResolved();
});

Then('the fallback is recorded in the demo drift log', () => {
  expectDegradedLogoDriftInDemoLog();
});

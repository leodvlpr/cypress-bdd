import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { headerComponent } from '../components/header.component';
import { visitHome } from '../flows/navigation.flow';

When('a visitor opens the home page', () => {
  visitHome();
});

Then('the store logo is displayed in the header', () => {
  headerComponent.expectLogoVisible();
});

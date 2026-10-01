import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { contactComponent } from '../components/contact.component';
import { buildContactMessage } from '../data/contact.factory';
import { sendContactMessage } from '../flows/contact.flow';

When('a visitor submits an inquiry through the contact form', () => {
  sendContactMessage(buildContactMessage());
});

Then('the visitor sees confirmation that the inquiry was sent', () => {
  contactComponent.expectSubmitted();
});

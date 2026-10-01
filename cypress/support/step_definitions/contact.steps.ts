import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { contactComponent } from '../components/contact.component';
import { buildContactMessage } from '../data/contact.factory';
import { sendContactMessage } from '../flows/contact.flow';

When('un visitante envía una consulta desde el formulario de contacto', () => {
  sendContactMessage(buildContactMessage());
});

Then('recibe la confirmación de que su consulta se ha enviado', () => {
  contactComponent.expectSubmitted();
});

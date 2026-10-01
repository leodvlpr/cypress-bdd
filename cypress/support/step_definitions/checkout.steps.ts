import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { checkoutComponent } from '../components/checkout.component';
import { buildTestCard } from '../data/payment.factory';
import { payOrder, proceedToCheckout } from '../flows/checkout.flow';
import { requireRegisteredUser, type ScenarioWorld } from '../world';

When('procede a finalizar la compra', () => {
  proceedToCheckout();
});

When('paga el pedido con una tarjeta de prueba', function (this: ScenarioWorld) {
  payOrder('Pedido generado por la suite E2E', buildTestCard(requireRegisteredUser(this).name));
});

Then('la dirección de entrega es la de su perfil', function (this: ScenarioWorld) {
  checkoutComponent.expectDeliveryAddress(requireRegisteredUser(this).profile);
});

Then('el pedido queda confirmado', () => {
  checkoutComponent.expectOrderPlaced();
});

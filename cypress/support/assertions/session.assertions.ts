import { headerComponent } from '../components/header.component';
import { expectCurrentPath, routes } from '../flows/navigation.flow';

/** Logged-out state: on the login page with no session indicator in the header. */
export function expectSignedOutOnLoginPage() {
  expectCurrentPath(routes.login);
  headerComponent.expectLoggedOut();
}

// Routes are navigation concerns, not UI pieces, so they live with the flows.
export const routes = {
  home: '/',
  login: '/login',
  products: '/products',
  productDetails: (productId: number) => `/product_details/${productId}`,
  cart: '/view_cart',
  contactUs: '/contact_us',
} as const;

export function visitHome() {
  cy.visit(routes.home);
}

export function visitLogin() {
  cy.visit(routes.login);
}

export function visitProducts() {
  cy.visit(routes.products);
}

export function visitProductDetails(productId: number) {
  cy.visit(routes.productDetails(productId));
}

export function visitCart() {
  cy.visit(routes.cart);
}

export function visitContactUs() {
  cy.visit(routes.contactUs);
}

export function expectCurrentPath(path: string) {
  cy.location('pathname').should('eq', path);
}

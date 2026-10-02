# Selector fallback verification

Every selector definition with more than one strategy was checked on the live site
(https://automationexercise.com) with Playwright on **2026-10-02**.

For each definition, every strategy was resolved on the real page, and the first match of each fallback was
compared against the first match of the primary (`element === primary`). **SAME** means both strategies resolved
to the identical DOM node.

How to re-check:
1. In Playwright, resolve each strategy on the page listed below.
2. Compare the first matched node of each fallback with the primary's (`el === other`).
3. Update this table.

Definitions with a single strategy (e.g. `cartTable.row`, `#cartModal`, `#submit_search`) have nothing to compare
and are not listed.

## Results

| Definition | Page | Strategies (primary first) | Result |
| --- | --- | --- | --- |
| `header.logo` | `/login` | `role(img, "Website for automation practice")` → `css(img[src="/static/images/home/logo.png"])` | 1 match each, SAME |
| `header.loginLink` | `/login` | `role(link, "Signup / Login")` → `css(a[href="/login"])` → `text(Signup / Login, a)` | 1 match each, SAME ¹ |
| `header.logoutLink` | `/` (signed in) | `role(link, "Logout")` → `css(a[href="/logout"])` → `text(Logout, a)` | 1 match each, SAME ¹ |
| `auth.loginEmailInput` | `/login` | `data-qa(login-email)` → `css(form[action="/login"] input[name="email"])` | 1 match each, SAME |
| `auth.loginPasswordInput` | `/login` | `data-qa(login-password)` → `css(form[action="/login"] input[name="password"])` | 1 match each, SAME |
| `auth.loginSubmitButton` | `/login` | `data-qa(login-button)` → `role(button, "Login")` | 1 match each, SAME |
| `signupForm.nameInput` | `/login` | `data-qa(signup-name)` → `css(form[action="/signup"] input[name="name"])` | 1 match each, SAME |
| `signupForm.emailInput` | `/login` | `data-qa(signup-email)` → `css(form[action="/signup"] input[name="email"])` | 1 match each, SAME |
| `signupForm.submitButton` | `/login` | `data-qa(signup-button)` → `role(button, "Signup")` | 1 match each, SAME |
| `accountDetailsForm.titleRadio(Mr)` | `/signup` | `id(id_gender1)` → `role(radio, "Mr.")` → `css([data-qa="title"] input[value="Mr"])` | 1 match each, SAME ² |
| `accountDetailsForm.titleRadio(Mrs)` | `/signup` | `id(id_gender2)` → `role(radio, "Mrs.")` → `css([data-qa="title"] input[value="Mrs"])` | 1 match each, SAME ² |
| `accountDetailsForm.*` text inputs and selects (14) | `/signup` | `data-qa(<field>)` → `id(<field>)` | 1 match each, SAME (all 14) |
| `accountDetailsForm.createAccountButton` | `/signup` | `data-qa(create-account)` → `role(button, "Create Account")` | 1 match each, SAME |
| `accountCreated.heading` | `/account_created` | `data-qa(account-created)` → `role(heading, "Account Created!")` | 1 match each, SAME |
| `accountCreated.continueButton` | `/account_created` | `data-qa(continue-button)` → `role(link, "Continue")` | 1 match each, SAME |
| `productSearch.searchInput` | `/products` | `id(search_product)` → `css(input[name="search"])` | 1 match each, SAME |
| `productSearch.resultsHeading` | `/products?search=Blue Top` | `role(heading, "Searched Products")` → `text(/searched products/i, h2)` | 1 match each, SAME |
| `productDetail.name("Blue Top")` | `/product_details/1` | `role(heading, "Blue Top")` → `text(Blue Top, h2)` | 1 match each, SAME |
| `productDetail.quantityInput` | `/product_details/1` | `id(quantity)` → `css(input[name="quantity"])` | 1 match each, SAME |
| `productDetail.addToCartButton` | `/product_details/1` | `role(button, "Add to cart")` → `text(Add to cart, button)` | 1 match each, SAME ¹ |
| `cartTable.productName("Blue Top")` | `/view_cart`, within `#product-1` | `role(link, "Blue Top")` → `text(Blue Top)` | 1 match each, SAME |
| `cartTable.quantity(3)` | `/view_cart`, within `#product-1` | `role(button, "3")` → `text(/^\s*3\s*$/, button)` | 1 match each, SAME |
| `orderReview.placeOrderButton` | `/checkout` | `role(link, "Place Order")` → `css(a[href="/payment"])` → `text(Place Order, a)` | 1 match each, SAME |
| `paymentForm.*` inputs (5) | `/payment` | `data-qa(<field>)` → `css(input[name="<field>"])` | 1 match each, SAME (all 5) |
| `paymentForm.payButton` | `/payment` | `data-qa(pay-button)` → `role(button, "Pay and Confirm Order")` | 1 match each, SAME |
| `orderConfirmation.heading` | `/payment_done/<amount>` | `data-qa(order-placed)` → `role(heading, "Order Placed!")` | 1 match each, SAME |
| `contact.*` inputs (4) | `/contact_us` | `data-qa(<field>)` → `css(input/textarea[name="<field>"])` | 1 match each, SAME (all 4) |
| `contact.submitButton` | `/contact_us` | `data-qa(submit-button)` → `role(button, "Submit")` | 1 match each, SAME |

¹ **Icon links and buttons.** Playwright includes the icon-font glyph (CSS `::before`) in the accessible name, so
an *exact* `getByRole` match fails. A substring match resolves to the same node. The suite's role matcher ignores
pseudo-content, so the exact name in the table is correct for `cy.getElement`.

² **`titleRadio` order.** The verification compared all three strategies against each other. After the PR review,
the strategies were reordered so the app-owned `id` is primary and the ancestor-scoped `css` is the last fallback.
The node identity does not depend on the order.

## Elements without a second strategy

These keep a single strategy because no second stable hook exists on the site:

| Element | Reason |
| --- | --- |
| `header.sessionIndicator`, `header.loggedInAs` | `<a>` without `href`: no `link` role, so text is the only contract. |
| `cartTable.proceedToCheckoutButton` | `<a>` without `href`: no `link` role, so text is the only contract. |
| `productSearch.searchButton` | Icon-only button with no accessible name. |
| `cartAddedModal.modal` | No `dialog` role and no `data-qa`. |
| `cartTable.row`, `cartTable.removeButton`, `cartTable.emptyMessage` | Only app ids / `data-product-id`. |
| `orderReview.deliveryAddress`, `orderReview.orderComment`, `orderReview.checkoutInfo` | Single hook each. |

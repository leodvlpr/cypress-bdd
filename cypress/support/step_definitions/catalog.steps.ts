import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { catalogComponent } from '../components/catalog.component';
import { findProduct } from '../data/catalog';
import { openProductDetails, searchProduct } from '../flows/catalog.flow';

When('the customer searches for the product {string}', (term: string) => {
  searchProduct(term);
});

When('the customer opens the details of the product {string}', (name: string) => {
  openProductDetails(findProduct(name));
});

Then('{string} appears in the search results', (name: string) => {
  catalogComponent.expectSearchResultsShown();
  catalogComponent.expectProductListed(name);
});

Then('the full details of the product {string} are shown', (name: string) => {
  catalogComponent.expectProductDetails(findProduct(name));
});

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { productDetailComponent } from '../components/product-detail.component';
import { productSearchComponent } from '../components/product-search.component';
import { findProduct } from '../data/catalog';
import { openProductDetails, searchProduct } from '../flows/catalog.flow';

When('the customer searches for the product {string}', (term: string) => {
  searchProduct(term);
});

When('the customer opens the details of the product {string}', (name: string) => {
  openProductDetails(findProduct(name));
});

Then('{string} appears in the search results', (name: string) => {
  productSearchComponent.expectResultsShown();
  productSearchComponent.expectResult(name);
});

Then('the full details of the product {string} are shown', (name: string) => {
  productDetailComponent.expectDetails(findProduct(name));
});

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { catalogComponent } from '../components/catalog.component';
import { findProduct } from '../data/catalog';
import { openProductDetails, searchProduct } from '../flows/catalog.flow';

When('busca el producto {string}', (term: string) => {
  searchProduct(term);
});

When('consulta el detalle del producto {string}', (name: string) => {
  openProductDetails(findProduct(name));
});

Then('{string} aparece en los resultados de búsqueda', (name: string) => {
  catalogComponent.expectSearchResultsShown();
  catalogComponent.expectProductListed(name);
});

Then('ve la ficha completa del producto {string}', (name: string) => {
  catalogComponent.expectProductDetails(findProduct(name));
});

export interface Product {
  id: number;
  name: string;
  /** Unit price in rupees, as shown in the store ("Rs. 500"). */
  price: number;
  category: string;
  brand: string;
  availability: string;
  condition: string;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

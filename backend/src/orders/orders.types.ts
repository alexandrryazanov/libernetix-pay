export interface Order {
  email: string;
  products: Product[];
}

export interface Product {
  name: string;
  price: number;
}

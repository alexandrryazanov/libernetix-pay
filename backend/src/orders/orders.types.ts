export interface Order {
  email: string;
  products: Product[];
  paymentId: string | null;
}

export interface Product {
  name: string;
  price: number;
}

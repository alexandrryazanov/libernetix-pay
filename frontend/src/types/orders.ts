export interface Order {
  id: string;
  email: string;
  products: Product[];
  paymentId: string | null;
  status: OrderStatus;
}

export interface Product {
  name: string;
  price: number;
}

export enum OrderStatus {
  CREATED = "created",
  FINISHED = "finished",
}

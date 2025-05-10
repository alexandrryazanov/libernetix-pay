export interface PaymentFormProps {
  orderId: string;
  amount: number;
}

export interface FormState {
  amount: string;
  currency: Currency;
  cardNumber: string;
  cardholderName: string;
  expirationDate: string;
  securityCode: string;
}

export interface FormErrors {
  [key: string]: string;
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
}

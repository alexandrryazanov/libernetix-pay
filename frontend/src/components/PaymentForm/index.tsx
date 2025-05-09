import React, { type ChangeEvent, type FormEvent, useState } from "react";
import styles from "./styles.module.css";
import Input from "../Input";
import {
  Currency,
  type FormErrors,
  type FormState,
  type PaymentFormProps,
} from "./types.ts";

const PaymentForm: React.FC<PaymentFormProps> = ({ orderId }) => {
  const [form, setForm] = useState<FormState>({
    amount: "5",
    currency: Currency.USD,
    cardNumber: "",
    cardholderName: "",
    expirationDate: "",
    securityCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (Object.keys(errors).length) setErrors({});
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.cardNumber) newErrors.cardNumber = "Card number is required";
    if (!form.cardholderName)
      newErrors.cardholderName = "Cardholder name is required";
    if (!form.expirationDate)
      newErrors.expirationDate = "Expiration date is required";
    if (!form.securityCode)
      newErrors.securityCode = "Security code is required";
    if (!Object.values(Currency).includes(form.currency))
      newErrors.currency = `Currency should be one of: ${Object.values(Currency).join(", ")}`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      console.log("Submitted", form);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Pay for {orderId}</h1>
      <div className={styles.row}>
        <Input
          disabled
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          label="Amount"
        />
        <Input
          disabled
          name="currency"
          value={form.currency}
          onChange={handleChange}
          label="Currency"
          error={errors.currency}
        />
      </div>
      <Input
        name="cardNumber"
        value={form.cardNumber}
        onChange={handleChange}
        label="Card Number"
        error={errors.cardNumber}
      />
      <Input
        name="cardholderName"
        value={form.cardholderName}
        onChange={handleChange}
        label="Cardholder Name"
        error={errors.cardholderName}
      />
      <Input
        name="expirationDate"
        value={form.expirationDate}
        onChange={handleChange}
        label="Expiration Date"
        placeholder="MM/YY"
        error={errors.expirationDate}
      />
      <Input
        name="securityCode"
        value={form.securityCode}
        onChange={handleChange}
        label="Security Code"
        error={errors.securityCode}
      />
      <br />
      <button type="submit">Pay</button>
    </form>
  );
};

export default PaymentForm;

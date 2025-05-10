import React, { type ChangeEvent, type FormEvent, useState } from "react";
import styles from "./styles.module.css";
import Input from "../Input";
import {
  Currency,
  type FormErrors,
  type FormState,
  type PaymentFormProps,
} from "./types.ts";
import useMutate from "../../hooks/useMutate.tsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const isProduction = import.meta.env.VITE_ENV === "production";

const PaymentForm: React.FC<PaymentFormProps> = ({ orderId, amount }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    amount: (amount / 100).toFixed(2),
    currency: Currency.USD,
    cardNumber: "",
    cardholderName: "",
    expirationDate: "",
    securityCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [htmlFor3DS, setHtmlFor3DS] = useState("");

  const onSuccessPayment = (data: { orderId: string } | string) => {
    if (typeof data === "object" && data.orderId) {
      navigate(`/orders/${data.orderId}/success`);
    } else if (typeof data === "string") {
      setHtmlFor3DS(data);
    }
  };

  const { mutate: pay, isLoading } = useMutate<{ orderId: string }>(
    "/payment/s2s",
    onSuccessPayment,
    (error) => toast.error(error),
  );

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
    if (!validate()) return;

    pay({
      orderId,
      cardNumber: form.cardNumber,
      cardholderName: form.cardholderName,
      expires: form.expirationDate,
      cvc: form.securityCode,
      userAgent: navigator.userAgent,
      language: navigator.language,
      utcOffset: -new Date().getTimezoneOffset(),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      callbackUrl: isProduction
        ? `${window.location.origin}/orders/${orderId}/success`
        : undefined,
    });
  };

  if (htmlFor3DS) {
    return (
      <div>
        <iframe
          title="3D Secure"
          srcDoc={htmlFor3DS}
          style={{ width: "100%", height: "600px" }}
        />
        <br />
        {!isProduction && (
          <button onClick={() => navigate(`/orders/${orderId}/success`)}>
            For not HTTPS redirect, you can go to success page manually after
            3DS.
          </button>
        )}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Pay for {orderId}</h1>
      <div className={styles.row}>
        <Input
          disabled // get amount from order
          type="number"
          name="amount"
          value={form.amount}
          onChange={() => null}
          label="Amount"
        />
        <Input
          disabled // now use only USD
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
      <button disabled={isLoading} type="submit">
        {isLoading ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

export default PaymentForm;

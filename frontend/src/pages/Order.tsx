import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router";
import useFetch from "../hooks/useFetch.tsx";
import type { Order } from "../types/orders.ts";
import { useMemo } from "react";

const OrderPage = () => {
  const { orderId } = useParams();
  const { isLoading, data, error } = useFetch<Order>(`/orders/${orderId}`, {
    skip: !orderId,
  });

  const amount =
    useMemo(
      () => data?.products.reduce((acc, p) => acc + p.price, 0),
      [data],
    ) || 0;

  if (!orderId) return <div>Order is not specified</div>;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>No such order</div>;

  return (
    <div>
      <PaymentForm orderId={orderId} amount={amount} />
    </div>
  );
};

export default OrderPage;

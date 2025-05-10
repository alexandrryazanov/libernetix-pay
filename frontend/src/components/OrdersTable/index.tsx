import React from "react";
import type { OrdersTableProps } from "./types.ts";
import { useNavigate } from "react-router";
import { OrderStatus } from "../../types/orders.ts";
import useMutate from "../../hooks/useMutate.tsx";
import { toast } from "react-toastify";

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const navigate = useNavigate();
  const { mutate: intentPurchase, isLoading } = useMutate<{ orderId: string }>(
    "/payment/intent",
    (data) => navigate(`/orders/${data.orderId}`),
    (error) => toast.error(error),
  );

  const onOrderClick = (orderId: string) => {
    intentPurchase({ orderId });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Status</th>
          <th>Pay</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{order.status}</td>
            <td>
              {order.status === OrderStatus.CREATED && (
                <button onClick={() => onOrderClick(order.id)}>Pay</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrdersTable;

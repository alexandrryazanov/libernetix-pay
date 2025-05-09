import React from "react";
import type { OrdersTableProps } from "./types.ts";
import { Link } from "react-router";
import { OrderStatus } from "../../types/orders.ts";

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
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
                <Link to={`/orders/${order.id}`}>Pay</Link>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrdersTable;

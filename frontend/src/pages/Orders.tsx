import OrdersTable from "../components/OrdersTable";
import { useEffect, useState } from "react";
import type { Order } from "../types/orders.ts";

function OrdersPage() {
  const [{ isLoading, orders, error }, setFetchingState] = useState<{
    isLoading: boolean;
    error: string;
    orders: Order[];
  }>({
    isLoading: false,
    error: "",
    orders: [],
  });

  // usually I use something like react-query lib, but here it is enough
  useEffect(() => {
    setFetchingState((prev) => ({
      ...prev,
      isLoading: true,
    }));
    fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/orders`)
      .then((res) => res.json())
      .then((data) => {
        setFetchingState((prev) => ({
          ...prev,
          orders: data,
          isLoading: false,
        }));
      })
      .catch(() =>
        setFetchingState((prev) => ({
          ...prev,
          error: "Error while fetching orders",
          isLoading: false,
        })),
      );
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!orders.length) return <div>No orders</div>;

  return (
    <div>
      <OrdersTable orders={orders} />
    </div>
  );
}

export default OrdersPage;

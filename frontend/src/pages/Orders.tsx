import OrdersTable from "../components/OrdersTable";
import type { Order } from "../types/orders.ts";
import useFetch from "../hooks/useFetch.tsx";

function OrdersPage() {
  const { isLoading, data, error } = useFetch<Order[]>("/orders");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data?.length) return <div>No orders</div>;

  return (
    <div>
      <OrdersTable orders={data} />
    </div>
  );
}

export default OrdersPage;

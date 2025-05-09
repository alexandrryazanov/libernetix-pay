import PaymentForm from "../components/PaymentForm";
import { useParams } from "react-router";

const OrderPage = () => {
  const { orderId } = useParams();

  if (!orderId) return <div>Order is not specified</div>;

  return (
    <div>
      <PaymentForm orderId={orderId} />
    </div>
  );
};

export default OrderPage;

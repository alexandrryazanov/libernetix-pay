import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import OrdersPage from "./pages/Orders.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import OrderPage from "./pages/Order.tsx";
import SuccessPage from "./pages/Success.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderPage />} />
        <Route path="/orders/:orderId/success" element={<SuccessPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </StrictMode>,
);

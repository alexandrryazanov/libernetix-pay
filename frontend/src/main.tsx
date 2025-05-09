import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import OrdersPage from "./pages/Orders.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import OrderPage from "./pages/Order.tsx";
import SuccessPage from "./pages/Success.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrdersPage />} />
        <Route path="/order/:orderId" element={<OrderPage />} />
        <Route path="/order/:orderId/success" element={<SuccessPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

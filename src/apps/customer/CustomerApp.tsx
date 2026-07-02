import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CustomerPage } from "../../ackodrive/pages/CustomerPage";
import { CustomerLandingPage } from "./CustomerLandingPage";
import { CustomerCarsPage } from "./CustomerCarsPage";

export function CustomerApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerLandingPage />} />
        <Route path="/cars" element={<CustomerCarsPage />} />
        <Route path="/app" element={<CustomerPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

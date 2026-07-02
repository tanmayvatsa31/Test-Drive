import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DriverPage } from "../../ackodrive/pages/DriverPage";
import { DriverLoginPage } from "./DriverLoginPage";

export function DriverApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DriverLoginPage />} />
        <Route path="/app" element={<DriverPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./ackodrive/pages/HomePage";
import { TataPage } from "./ackodrive/pages/TataPage";
import { LoginPage } from "./ackodrive/pages/LoginPage";
import { CustomerPage } from "./ackodrive/pages/CustomerPage";
import { DealerPage } from "./ackodrive/pages/DealerPage";
import { DriverPage } from "./ackodrive/pages/DriverPage";
import { MasterPage } from "./ackodrive/pages/MasterPage";
import { TestDrivePortalPage } from "./ackodrive/pages/TestDrivePortalPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tata" element={<TataPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/dealer" element={<DealerPage />} />
        <Route path="/driver" element={<DriverPage />} />
        <Route path="/portal" element={<TestDrivePortalPage />} />
        <Route path="/master" element={<MasterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

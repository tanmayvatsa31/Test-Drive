import { AppRouter } from "../../ackodrive/AppRouter";
import { Navigate, Route, Routes } from "react-router-dom";
import { DealerPage } from "../../ackodrive/pages/DealerPage";
import { MasterPage } from "../../ackodrive/pages/MasterPage";
import { OemPage } from "../../ackodrive/pages/OemPage";
import { AdminLoginPage } from "./AdminLoginPage";
import { AdminConsolePage } from "./AdminConsolePage";
import { PresenterPage } from "./PresenterPage";
import { AdminGate } from "./AdminGate";
import { OemLoginPage } from "./OemLoginPage";
import { RoleEmailLoginPage } from "./RoleEmailLoginPage";

export function AdminApp() {
  return (
    <AppRouter>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          path="/login/dealer"
          element={
            <RoleEmailLoginPage
              role="dealer"
              redirectTo="/dealer"
              title="Dealer portal"
              subtitle="Sign in with your @acko.com or @acko.tech email"
            />
          }
        />
        <Route path="/login/oem" element={<OemLoginPage />} />
        <Route path="/dealer" element={<DealerPage />} />
        <Route path="/oem" element={<OemPage />} />
        <Route path="/master" element={<MasterPage />} />
        <Route element={<AdminGate />}>
          <Route path="/" element={<AdminConsolePage />} />
          <Route path="/presenter" element={<PresenterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppRouter>
  );
}

import { Navigate, Outlet } from "react-router-dom";
import { getPortalGateUser } from "../../ackodrive/portalGate";

export function AdminGate() {
  if (!getPortalGateUser()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../index.css";
import { AppErrorBoundary } from "../../ackodrive/components/AppErrorBoundary";
import { applyEmbedDocumentClass, isEmbedMode } from "../../ackodrive/embedMode";
import { MobileDeviceShell } from "../../components/MobileDeviceShell";
import { CustomerApp } from "./CustomerApp";

applyEmbedDocumentClass();

const app = (
  <StrictMode>
    <AppErrorBoundary>
      <CustomerApp />
    </AppErrorBoundary>
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  isEmbedMode() ? app : <MobileDeviceShell>{app}</MobileDeviceShell>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../index.css";
import { applyEmbedDocumentClass, isEmbedMode } from "../../ackodrive/embedMode";
import { MobileDeviceShell } from "../../components/MobileDeviceShell";
import { DriverApp } from "./DriverApp";

applyEmbedDocumentClass();

const app = (
  <StrictMode>
    <DriverApp />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(
  isEmbedMode() ? app : <MobileDeviceShell>{app}</MobileDeviceShell>,
);

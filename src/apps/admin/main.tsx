import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../index.css";
import { applyEmbedDocumentClass } from "../../ackodrive/embedMode";
import { AdminApp } from "./AdminApp";

applyEmbedDocumentClass();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);

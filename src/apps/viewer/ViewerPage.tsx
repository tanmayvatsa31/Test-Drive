import { DeviceFrame } from "../../components/DeviceFrame";
import { APP_URLS } from "../../ackodrive/appUrls";
import { embedAppUrl } from "../../ackodrive/embedMode";

const PANELS = [
  {
    id: "customer",
    label: "Customer",
    src: embedAppUrl(APP_URLS.customer, "/"),
  },
  {
    id: "driver",
    label: "Driver",
    src: embedAppUrl(APP_URLS.driver, "/"),
  },
  {
    id: "admin",
    label: "Superadmin",
    src: embedAppUrl(APP_URLS.admin, "/login"),
  },
] as const;

function ViewerPanel({ label, src }: { label: string; src: string }) {
  return (
    <div className="demo-viewer-column">
      <p className="demo-viewer-label">{label}</p>
      <DeviceFrame>
        <iframe
          className="demo-viewer-iframe"
          src={src}
          title={`${label} app`}
          loading="eager"
        />
      </DeviceFrame>
    </div>
  );
}

export function ViewerPage() {
  return (
    <div className="demo-viewer">
      <header className="demo-viewer-header">
        <h1 className="demo-viewer-title">ACKO Drive Test drive demo</h1>
      </header>

      <div className="demo-viewer-stage">
        {PANELS.map((panel) => (
          <ViewerPanel key={panel.id} label={panel.label} src={panel.src} />
        ))}
      </div>
    </div>
  );
}

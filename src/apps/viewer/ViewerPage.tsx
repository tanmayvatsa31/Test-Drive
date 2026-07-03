import { useLayoutEffect, useMemo, useRef } from "react";
import { DeviceFrame } from "../../components/DeviceFrame";
import { getAppUrls } from "../../ackodrive/appUrls";
import { embedAppUrl } from "../../ackodrive/embedMode";
import { isGitHubPagesDeploy } from "../../ackodrive/AppRouter";

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
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const adminLoginPath = isGitHubPagesDeploy() ? "#/login" : "/login";

  const panels = useMemo(() => {
    const urls = getAppUrls();
    return [
      { id: "customer", label: "Customer", src: embedAppUrl(urls.customer) },
      { id: "driver", label: "Driver", src: embedAppUrl(urls.driver) },
      { id: "admin", label: "Superadmin", src: embedAppUrl(urls.admin, adminLoginPath) },
    ] as const;
  }, [adminLoginPath]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const inner = innerRef.current;
    if (!stage || !inner) return;

    const fitStage = () => {
      inner.style.transform = "none";
      const availableW = stage.clientWidth;
      const availableH = stage.clientHeight;
      const naturalW = inner.offsetWidth;
      const naturalH = inner.offsetHeight;
      if (!availableW || !availableH || !naturalW || !naturalH) return;

      const scale = Math.min(1, availableW / naturalW, availableH / naturalH);
      inner.style.transform = `scale(${scale})`;
    };

    fitStage();
    const observer = new ResizeObserver(fitStage);
    observer.observe(stage);
    window.addEventListener("resize", fitStage);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitStage);
    };
  }, [panels]);

  return (
    <div className="demo-viewer">
      <header className="demo-viewer-header">
        <h1 className="demo-viewer-title">ACKO Drive Test drive demo</h1>
      </header>

      <div className="demo-viewer-stage" ref={stageRef}>
        <div className="demo-viewer-stage-inner" ref={innerRef}>
          {panels.map((panel) => (
            <ViewerPanel key={panel.id} label={panel.label} src={panel.src} />
          ))}
        </div>
      </div>
    </div>
  );
}

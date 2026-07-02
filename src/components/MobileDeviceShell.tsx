import type { ReactNode } from "react";
import { DeviceFrame } from "./DeviceFrame";

/** Centers the app in an iPhone 16 mockup on a white canvas. */
export function MobileDeviceShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-canvas app-canvas--device">
      <DeviceFrame>{children}</DeviceFrame>
    </div>
  );
}

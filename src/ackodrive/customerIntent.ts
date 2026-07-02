export type CustomerIntent = "testride" | "purchase";

export type SelectedCar = {
  brandId: string;
  modelId: string;
  variant?: string;
};

const INTENT_KEY = "ackodrive_customer_intent";
const CAR_KEY = "ackodrive_selected_car";

export function setCustomerIntent(intent: CustomerIntent): void {
  sessionStorage.setItem(INTENT_KEY, intent);
}

export function getCustomerIntent(): CustomerIntent | null {
  const value = sessionStorage.getItem(INTENT_KEY);
  if (value === "testride" || value === "purchase") return value;
  return null;
}

export function clearCustomerIntent(): void {
  sessionStorage.removeItem(INTENT_KEY);
}

export function setSelectedCar(car: SelectedCar): void {
  sessionStorage.setItem(CAR_KEY, JSON.stringify(car));
}

export function getSelectedCar(): SelectedCar | null {
  const raw = sessionStorage.getItem(CAR_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SelectedCar;
    if (parsed.brandId && parsed.modelId) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearSelectedCar(): void {
  sessionStorage.removeItem(CAR_KEY);
}

export function clearCustomerSessionPrefs(): void {
  clearCustomerIntent();
  clearSelectedCar();
}

export function intentLoginSubtitle(intent: CustomerIntent): string {
  return intent === "purchase"
    ? "Login now to buy your new car"
    : "Login now to schedule your test drive";
}

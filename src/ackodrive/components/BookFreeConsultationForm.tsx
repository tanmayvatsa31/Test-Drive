import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND_MODELS, CAR_BRANDS } from "../constants";
import { findBrowseCar } from "../carsBrowseCatalog";
import { insertLead, findOpenLeadForCustomer } from "../hooks/useLeads";
import { useDemoState } from "../hooks/useDemoState";
import { startCustomerJourney } from "../workflowActions";
import { getSelectedCar, setCustomerIntent, clearSelectedCar } from "../customerIntent";
import { SelectedCarReadonlyCard } from "./SelectedCarReadonlyCard";
import { PrimaryButton } from "./ui";

type ResolvedCarSelection = {
  brandId: string;
  modelId: string;
  variant: string;
  brandName: string;
  modelName: string;
  price: string;
};

function resolveSelectedCarDetails(): ResolvedCarSelection | null {
  const preselected = getSelectedCar();
  if (!preselected) return null;

  const selectedBrand = CAR_BRANDS.find((b) => b.id === preselected.brandId);
  const selectedModel = BRAND_MODELS.find((m) => m.id === preselected.modelId);
  if (!selectedBrand || !selectedModel) return null;

  const variant =
    preselected.variant && selectedModel.variants.includes(preselected.variant)
      ? preselected.variant
      : (selectedModel.variants[0] ?? "");

  return {
    brandId: preselected.brandId,
    modelId: preselected.modelId,
    variant,
    brandName: selectedBrand.name,
    modelName: selectedModel.name,
    price: selectedModel.price,
  };
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-3 block first:mt-0">
      <span className="ad-overline">{label}</span>
      {children}
    </label>
  );
}

export function BookFreeConsultationForm({
  defaultName = "",
  defaultPhone = "",
}: {
  defaultName?: string;
  defaultPhone?: string;
}) {
  const navigate = useNavigate();
  const { state, setState } = useDemoState();
  // Cars → /app is always the doorstep test-drive path (slot selection after submit).
  const intent = "testride" as const;
  const carSelection = useMemo(() => resolveSelectedCarDetails(), []);
  const browseCar = useMemo(
    () => (carSelection ? findBrowseCar(carSelection.modelId) : undefined),
    [carSelection],
  );
  const initialPhone = defaultPhone.replace(/\D/g, "").slice(-10);
  const [name, setName] = useState(defaultName === "User" ? "" : defaultName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!carSelection) {
      navigate("/cars", { replace: true });
    }
  }, [carSelection, navigate]);

  if (!carSelection || !browseCar) {
    return <div className="ad-caption py-8 text-center">Redirecting to car listings…</div>;
  }

  return (
    <form
      className="ad-form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim() || !/^\d{10}$/.test(phone) || !address.trim() || !/^\d{6}$/.test(pincode)) {
          setError("Please fill all required fields correctly.");
          return;
        }
        if (address.trim().length < 15) {
          setError("Please enter your complete address (house no., street, area, landmark).");
          return;
        }
        setSubmitting(true);
        setCustomerIntent(intent);

        let lead = await findOpenLeadForCustomer(phone.trim(), carSelection.modelId);
        if (!lead) {
          const { data: inserted, error: insertError } = await insertLead({
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            pincode: pincode.trim(),
            model_id: carSelection.modelId,
            model_name: `${carSelection.brandName} ${carSelection.modelName} · ${carSelection.variant}`,
            source: "customer_app",
            status: "new",
          });
          if (insertError || !inserted) {
            setSubmitting(false);
            setError("Could not submit. Please try again.");
            return;
          }
          lead = inserted;
        }

        if (!lead) {
          setSubmitting(false);
          setError("Could not submit. Please try again.");
          return;
        }

        clearSelectedCar();
        await startCustomerJourney(setState, { ...lead, variant: carSelection.variant }, intent, state);
        setSubmitting(false);
      }}
    >
      <SelectedCarReadonlyCard car={browseCar} variant={carSelection.variant} />

      <section className="ad-card ad-form-details-card !mb-0">
        <div className="ad-label text-sm font-semibold">Your details</div>
        <p className="ad-caption mt-1">We will use this to schedule your doorstep visit and keep you updated.</p>

        <FormField label="Your name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            className="field-input mt-1"
            placeholder="Aarav Mehta"
          />
        </FormField>

        <FormField label="Mobile number">
          <div className="mt-1 flex">
            <span className="rounded-l-lg border border-r-0 border-[var(--ad-border-default)] bg-[var(--ad-surface-light)] px-3 py-2 text-sm text-[var(--ad-text-tertiary)]">
              +91
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              inputMode="numeric"
              pattern="\d{10}"
              className="field-input mt-0 rounded-l-none"
              placeholder="10-digit mobile"
            />
          </div>
        </FormField>

        <FormField label="Full address">
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            minLength={15}
            maxLength={300}
            rows={4}
            className="field-input mt-1 min-h-[6.5rem] resize-y"
            placeholder={"House / flat no., building name\nStreet, area, landmark\nCity"}
          />
          <p className="ad-caption mt-1">Include house or flat number, street, area, landmark, and city.</p>
        </FormField>

        <FormField label="Pincode">
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            inputMode="numeric"
            pattern="\d{6}"
            className="field-input mt-1"
            placeholder="560034"
          />
        </FormField>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <PrimaryButton className="mt-4" disabled={submitting}>
          {submitting ? "Submitting…" : "Book a test drive →"}
        </PrimaryButton>

        <p className="ad-caption mt-2">🔒 Your number is masked before reaching dealers and drivers.</p>
      </section>
    </form>
  );
}

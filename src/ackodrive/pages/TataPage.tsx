import { useState } from "react";
import { Link } from "react-router-dom";
import { MODELS } from "../constants";
import { insertLead } from "../hooks/useLeads";

export function TataPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [modelId, setModelId] = useState<string>(MODELS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const model = MODELS.find((m) => m.id === modelId)!;

  if (done) {
    return (
      <div className="ad-page-white">
        <TataHeader />
        <main className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <div className="text-5xl">✅</div>
          <h1 className="ad-display mt-3 text-2xl">Thanks, {name.split(" ")[0]}!</h1>
          <p className="ad-body mt-2 text-sm">
            A Tata expert (Shivi from Acko) will call you shortly about the <span className="font-semibold text-[var(--ad-text-primary)]">{model.name}</span>.
          </p>
          <Link to="/" className="ad-btn-primary mt-6 inline-block !w-auto px-6">
            Back to demo launcher
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="ad-page-white">
      <TataHeader />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 md:grid-cols-[1.1fr_1fr]">
        <section>
          <div className="ad-overline">Tata Motors</div>
          <h1 className="ad-display mt-2 text-2xl leading-tight sm:text-4xl">
            Find your next Tata.
            <br />
            <span className="text-[var(--ad-text-secondary)]">Test drive at your doorstep.</span>
          </h1>
          <p className="ad-body mt-3 max-w-md text-sm">
            Share your contact and a Tata expert will get in touch — powered by Acko&apos;s secure masked-calling pipeline.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODELS.slice(0, 3).map((m) => (
              <div key={m.id} className="ad-card-flat !mb-0 !p-3">
                <div className="text-2xl">{m.emoji}</div>
                <div className="ad-label mt-1 text-xs">{m.name}</div>
                <div className="ad-caption">{m.price}</div>
              </div>
            ))}
          </div>
        </section>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pincode)) return;
            setSubmitting(true);
            await insertLead({
              name: name.trim(),
              phone: phone.trim(),
              address: address.trim() || null,
              pincode: pincode.trim(),
              model_id: model.id,
              model_name: model.name,
            });
            setSubmitting(false);
            setDone(true);
          }}
          className="ad-card !mb-0 self-start shadow-[var(--ad-shadow-elevated)]"
        >
          <div className="ad-label text-sm font-semibold">Book a free consultation</div>
          <div className="ad-caption mt-1">Goes straight to the Tata OEM control room.</div>
          <Field label="Your name">
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="field-input" placeholder="Aarav Mehta" />
          </Field>
          <Field label="Mobile number">
            <div className="mt-1 flex">
              <span className="rounded-l-lg border border-r-0 border-[var(--ad-border-default)] bg-[var(--ad-surface-light)] px-3 py-2 text-sm text-[var(--ad-text-tertiary)]">+91</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
                inputMode="numeric"
                pattern="\d{10}"
                className="field-input rounded-l-none"
                placeholder="10-digit mobile"
              />
            </div>
          </Field>
          <Field label="Address (optional)">
            <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={120} className="field-input" />
          </Field>
          <Field label="Pincode">
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              pattern="\d{6}"
              className="field-input"
              placeholder="560034"
            />
          </Field>
          <Field label="Interested model">
            <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="field-input">
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.price}
                </option>
              ))}
            </select>
          </Field>
          <button type="submit" disabled={submitting} className="ad-btn-primary mt-4">
            {submitting ? "Submitting…" : "Request a call back →"}
          </button>
          <div className="ad-caption mt-2">🔒 Your number is masked before reaching dealers and drivers.</div>
        </form>
      </main>
    </div>
  );
}

function TataHeader() {
  return (
    <header className="ad-header-light">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="ad-logo min-w-0">
          <span className="ad-logo-mark shrink-0 text-[10px]">T</span>
          <span className="truncate text-xs sm:text-sm">TATA MOTORS</span>
        </div>
        <Link to="/" className="ad-btn-ghost">
          Demo launcher
        </Link>
      </div>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-3 block">
      <span className="ad-overline">{label}</span>
      {children}
    </label>
  );
}

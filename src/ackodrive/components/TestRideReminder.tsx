import { Badge, Card } from "./ui";

export function TestRideReminder({
  slotDate,
  slotLabel,
  slotTime,
  audience,
  customerName,
}: {
  slotDate?: string;
  slotLabel?: string;
  slotTime?: string;
  audience: "customer" | "dealer" | "driver";
  customerName?: string;
}) {
  if (!slotDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slot = new Date(slotDate);
  slot.setHours(0, 0, 0, 0);
  const days = Math.round((slot.getTime() - today.getTime()) / 86_400_000);
  if (days < 0 || days > 3) return null;

  const label = days === 0 ? "TODAY" : days === 1 ? "TOMORROW" : `in ${days} days`;
  const isToday = days === 0;

  const messages = {
    customer: isToday
      ? `Your Tata test ride is today at ${slotTime}. Driver will arrive shortly — keep an eye on this number for the OTP.`
      : `Reminder: your Tata test ride is scheduled for ${slotLabel} · ${slotTime}. We'll send the driver's OTP on the day.`,
    dealer: isToday
      ? `Test ride for ${customerName ?? "customer"} is TODAY (${slotTime}). Confirm driver is dispatched.`
      : `Upcoming test ride for ${customerName ?? "customer"} on ${slotLabel} · ${slotTime}. Confirm driver & vehicle readiness.`,
    driver: isToday
      ? `Your assignment for ${customerName ?? "customer"} is TODAY at ${slotTime}. Start the trip on time.`
      : `Upcoming assignment: ${customerName ?? "customer"} on ${slotLabel} · ${slotTime}. Plan your route in advance.`,
  };

  return (
    <Card className={isToday ? "ad-card-warning !border-2" : "ad-card-warning"}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{isToday ? "🔔" : "⏰"}</span>
        <Badge tone={isToday ? "live" : "warn"}>WhatsApp reminder · {label}</Badge>
      </div>
      <div className="ad-body mt-2 text-xs">{messages[audience]}</div>
      <div className="ad-caption mt-1">Sent via WhatsApp Business (simulated in this demo).</div>
    </Card>
  );
}

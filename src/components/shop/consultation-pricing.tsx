import { Wifi, Building2, Home } from "lucide-react";
import type { ConsultationTopic } from "@/lib/consultation-topics";
import type { ModeId } from "@/lib/mode-visibility";

const CHIP_STYLES = {
  online: {
    Icon: Wifi,
    label: "Online",
  },
  offline: {
    Icon: Building2,
    label: "Offline",
  },
  homeService: {
    Icon: Home,
    label: "Home Visit",
  },
} as const;

/**
 * Three pricing options for a consultation topic, filtered by the
 * admin "Service Mode Settings" (visible modes only).
 */
export function ConsultationPricing({
  topic,
  availableModes,
}: {
  topic: Pick<ConsultationTopic, "fee" | "homeFee">;
  availableModes: ModeId[];
}) {
  const price = (id: ModeId) =>
    id === "homeService" ? topic.homeFee : topic.fee;

  return (
    <div className="grid grid-cols-3 gap-2">
      {availableModes.map((id) => {
        const { Icon, label } = CHIP_STYLES[id];
        return (
          <div
            key={id}
            className="flex flex-col items-center gap-1 rounded-xl border border-premium-gold/40 bg-golden/10 px-2 py-2.5 text-center"
          >
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-golden">
              <Icon className="h-3 w-3" />
              {label}
            </span>
            <span className="text-sm font-bold text-[var(--jaiguru-page-text)]">
              {price(id)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
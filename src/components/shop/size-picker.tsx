"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { PaymentButton } from "@/components/shop/payment-button";
import {
  certificateTierForPrice,
  CERTIFICATE_TIER_LABEL,
  CERTIFICATE_TIER_BADGE_CLASS,
} from "@/lib/products/certificate";
import { cn } from "@/lib/utils";

function formatPrice(value: number): string {
  const [int, dec] = value.toFixed(2).split(".");
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return `₹${grouped}${dec === "00" ? "" : "." + dec}`;
}

export interface SizeOptionData {
  label: string;
  price: number;
}

interface GeoConfig {
  enabled: boolean;
  baseCountry: string;
  markup: number;
  currencies: Record<string, { rate: number; symbol: string; locale: string }>;
  disclosure: string;
}

export interface SizePickerProps {
  options: SizeOptionData[];
  baseName: string;
  upiId: string;
  whatsappNumber: string;
  whatsappMessage: string;
  razorpayKeyId?: string | null;
  pageUrl: string;
  geo: GeoConfig | null;
  viewerCountry: string;
}

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  UK: "GBP",
  EU: "EUR",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  CY: "EUR",
  MT: "EUR",
  HR: "EUR",
};

function geoLabel(price: number, geo: GeoConfig | null, country: string): string | null {
  if (!geo || !geo.enabled) return null;
  if (country === geo.baseCountry) return null;
  const code = COUNTRY_CURRENCY[country];
  if (!code) return null;
  const cfg = geo.currencies[code];
  if (!cfg) return null;
  const amount = Math.max(0.99, Math.ceil(price * (1 + geo.markup) * cfg.rate) - 0.01);
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SizePicker({
  options,
  baseName,
  upiId,
  whatsappNumber,
  whatsappMessage,
  razorpayKeyId,
  pageUrl,
  geo,
  viewerCountry,
}: SizePickerProps) {
  const [selected, setSelected] = useState(0);
  const option = options[selected];
  const tier = certificateTierForPrice(option.price);
  const converted = geoLabel(option.price, geo, viewerCountry);
  const priceLabel = converted ?? formatPrice(option.price);
  const itemName = `${baseName} – ${option.label}`;
  const message = useMemo(
    () =>
      whatsappMessage ||
      `Hello JAIGURU ASTROREMEDY, I would like to order: ${itemName} (${priceLabel}). Please confirm availability and shipping.`,
    [whatsappMessage, itemName, priceLabel]
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Size
          </span>
          <span className="text-[10px] text-slate-500">
            {options.length} sizes available
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              onClick={() => setSelected(i)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                i === selected
                  ? "border-[#FACC15] bg-gradient-to-r from-[#FACC15] to-[#F97316] text-slate-900 shadow-[0_6px_18px_rgba(250,204,21,0.35)]"
                  : "border-premium-gold/40 bg-white/5 text-slate-200 hover:border-[#D4AF37]/70 hover:bg-white/10"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-premium-gold/30 bg-white/[0.04] p-4">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Price for {option.label}
          </p>
          <p className="font-display text-3xl font-bold text-[#FACC15]">{priceLabel}</p>
          {converted ? (
            <p className="text-[10px] text-slate-500">
              ₹{formatPrice(option.price)} · {geo?.disclosure}
            </p>
          ) : null}
        </div>
        {tier ? (
          <span className={CERTIFICATE_TIER_BADGE_CLASS[tier]}>
            <Check className="h-3.5 w-3.5" />
            {CERTIFICATE_TIER_LABEL[tier]}
          </span>
        ) : null}
      </div>

      <PaymentButton
        label="Order on WhatsApp"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-8 py-4 text-base font-bold text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:bg-[#1EBE5B]"
        itemName={itemName}
        priceLabel={priceLabel}
        price={option.price}
        upiId={upiId}
        whatsappNumber={whatsappNumber}
        whatsappMessage={message}
        razorpayKeyId={razorpayKeyId}
        pageUrl={pageUrl}
      />
    </div>
  );
}
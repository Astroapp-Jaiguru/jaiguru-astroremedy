import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Delivery slip settings (SiteSetting "delivery-slip").
 * Controls the tax block printed on delivery slips:
 * - showTax: whether the slip lists GSTIN + tax rate + computed total
 * - gstin: the business GSTIN text printed when showTax is on
 * - taxRate: percentage used to compute GST on the order amount
 * No tax information is printed when showTax is off.
 */

export interface SlipSettings {
  showTax: boolean;
  gstin: string;
  taxRate: number;
}

export const DEFAULT_SLIP_SETTINGS: SlipSettings = {
  showTax: false,
  gstin: "",
  taxRate: 0,
};

export async function getSlipSettings(): Promise<SlipSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "delivery-slip" },
    });
    if (!row?.value) return DEFAULT_SLIP_SETTINGS;
    const raw = row.value as Record<string, unknown>;
    const parsed =
      typeof raw.taxRate === "number" && Number.isFinite(raw.taxRate) && raw.taxRate > 0
        ? raw.taxRate
        : 0;
    return {
      showTax: raw.showTax === true,
      gstin: typeof raw.gstin === "string" ? raw.gstin.trim() : "",
      taxRate: parsed,
    };
  } catch (e) {
    console.error("[slip-settings] getSlipSettings failed:", e);
    return DEFAULT_SLIP_SETTINGS;
  }
}
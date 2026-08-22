import type { MarketplaceProvider } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { shippingProvider } from "./adapters";
import type { ShipmentRequest } from "./provider";

export async function chooseShippingProvider(request: ShipmentRequest, override?: MarketplaceProvider) {
  const settings = await prisma.shippingSettings.findFirst({ orderBy: { createdAt: "asc" } });
  const preferred = override ?? (settings?.metroUsesDelhivery && isMetro(request.pincode) ? "DELHIVERY" : settings?.delhiveryValuePaise && request.valuePaise >= settings.delhiveryValuePaise ? "DELHIVERY" : settings?.delhiveryWeightGrams && request.weightGrams >= settings.delhiveryWeightGrams ? "DELHIVERY" : settings?.defaultProvider ?? "NIMBUSPOST");
  const candidates: MarketplaceProvider[] = settings?.fallbackEnabled === false ? [preferred] : [preferred, preferred === "NIMBUSPOST" ? "DELHIVERY" : "NIMBUSPOST"];
  for (const candidate of candidates) {
    try {
      const provider = shippingProvider(candidate);
      if (await provider.isServiceable(request.pincode)) return { provider: candidate, adapter: provider, quote: await provider.quote(request) };
    } catch {
      // A failed provider is eligible for configured fallback.
    }
  }
  throw new Error("Shipping is not available for this destination.");
}

function isMetro(pincode: string) {
  return ["110", "400", "560", "600", "700", "500", "411", "380"].some((prefix) => pincode.startsWith(prefix));
}

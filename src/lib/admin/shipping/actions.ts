"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function saveShippingSettingsAction(formData: FormData) {
  await requireAdmin();
  const provider = formData.get("defaultProvider") === "DELHIVERY" ? "DELHIVERY" : "NIMBUSPOST";
  const number = (key: string) => { const value = Number(formData.get(key)); return Number.isSafeInteger(value) && value > 0 ? value : null; };
  await prisma.shippingSettings.upsert({
    where: { id: "singleton" },
    update: { defaultProvider: provider, fallbackEnabled: formData.get("fallbackEnabled") === "on", metroUsesDelhivery: formData.get("metroUsesDelhivery") === "on", delhiveryValuePaise: number("delhiveryValuePaise"), delhiveryWeightGrams: number("delhiveryWeightGrams") },
    create: { id: "singleton", defaultProvider: provider, fallbackEnabled: formData.get("fallbackEnabled") === "on", metroUsesDelhivery: formData.get("metroUsesDelhivery") === "on", delhiveryValuePaise: number("delhiveryValuePaise"), delhiveryWeightGrams: number("delhiveryWeightGrams") },
  });
  revalidatePath("/admin/shipping-settings");
}

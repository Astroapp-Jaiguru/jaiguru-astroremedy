import type { MarketplaceProvider, ShipmentStatus } from "@/generated/prisma/client";
import { assertShippingRequest, type ShippingProvider, type ShipmentRequest, type ShippingQuote, type ShipmentResult, type TrackingResult } from "./provider";

abstract class HttpProvider implements ShippingProvider {
  abstract readonly name: MarketplaceProvider;
  protected abstract readonly baseUrl: string;
  protected abstract readonly credentials: Record<string, string>;

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...this.credentials, ...(init.headers ?? {}) },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`${this.name} request failed (${response.status})`);
    return response.json() as Promise<T>;
  }

  async isServiceable(pincode: string): Promise<boolean> {
    const result = await this.call<{ serviceable?: boolean }>(`/serviceability?pincode=${encodeURIComponent(pincode)}`);
    return result.serviceable === true;
  }

  async quote(request: ShipmentRequest): Promise<ShippingQuote> {
    assertShippingRequest(request);
    const result = await this.call<{ costPaise?: number; cost?: number; etaDays?: number }>("/quote", { method: "POST", body: JSON.stringify(request) });
    const costPaise = result.costPaise ?? Math.round((result.cost ?? 0) * 100);
    if (!Number.isSafeInteger(costPaise) || costPaise < 0) throw new Error("Provider returned an invalid quote.");
    return { costPaise, etaDays: Math.max(1, Math.trunc(result.etaDays ?? 7)) };
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResult> {
    assertShippingRequest(request);
    return this.call<ShipmentResult>("/shipments", { method: "POST", body: JSON.stringify(request) });
  }

  async generateLabel(shipmentId: string): Promise<{ labelUrl: string }> {
    return this.call<{ labelUrl: string }>(`/shipments/${encodeURIComponent(shipmentId)}/label`, { method: "POST" });
  }

  async schedulePickup(shipmentId: string): Promise<void> {
    await this.call(`/shipments/${encodeURIComponent(shipmentId)}/pickup`, { method: "POST" });
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    await this.call(`/shipments/${encodeURIComponent(shipmentId)}`, { method: "DELETE" });
  }

  async trackShipment(trackingId: string): Promise<TrackingResult> {
    return this.call<TrackingResult>(`/tracking/${encodeURIComponent(trackingId)}`);
  }

  normalizeWebhook(payload: unknown): { eventKey: string; status: ShipmentStatus; trackingId?: string } {
    const data = (payload ?? {}) as Record<string, unknown>;
    const rawStatus = String(data.status ?? data.current_status ?? "PENDING").toUpperCase().replaceAll(" ", "_");
    const allowed: ShipmentStatus[] = ["PENDING", "CREATED", "PICKUP_SCHEDULED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED"];
    return { eventKey: String(data.event_id ?? data.id ?? crypto.randomUUID()), status: allowed.includes(rawStatus as ShipmentStatus) ? rawStatus as ShipmentStatus : "PENDING", trackingId: String(data.awb ?? data.awb_number ?? data.tracking_id ?? "") || undefined };
  }
}

export class NimbusPostProvider extends HttpProvider {
  readonly name = "NIMBUSPOST" as const;
  protected readonly baseUrl = process.env.NIMBUS_API_URL ?? "https://api.nimbuspost.com/api";
  protected readonly credentials = { "x-api-key": process.env.NIMBUS_API_KEY ?? "", "x-api-secret": process.env.NIMBUS_API_SECRET ?? "" };
}

export class DelhiveryProvider extends HttpProvider {
  readonly name = "DELHIVERY" as const;
  protected readonly baseUrl = process.env.DELHIVERY_API_URL ?? "https://track.delhivery.com";
  protected readonly credentials = { "x-api-key": process.env.DELHIVERY_API_KEY ?? "", "x-api-secret": process.env.DELHIVERY_API_SECRET ?? "" };
}

export function shippingProvider(provider: MarketplaceProvider): ShippingProvider {
  return provider === "DELHIVERY" ? new DelhiveryProvider() : new NimbusPostProvider();
}

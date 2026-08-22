import type { MarketplaceProvider, ShipmentStatus } from "@/generated/prisma/client";

export type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type ShipmentRequest = ShippingAddress & {
  orderId: string;
  valuePaise: number;
  weightGrams: number;
  items: Array<{ name: string; quantity: number; sku?: string | null }>;
};

export type ShippingQuote = { costPaise: number; etaDays: number };
export type ShipmentResult = { providerShipmentId: string; awbNumber?: string; trackingUrl?: string };
export type TrackingResult = { status: ShipmentStatus; raw: unknown };

export interface ShippingProvider {
  readonly name: MarketplaceProvider;
  isServiceable(pincode: string): Promise<boolean>;
  quote(request: ShipmentRequest): Promise<ShippingQuote>;
  createShipment(request: ShipmentRequest): Promise<ShipmentResult>;
  generateLabel(shipmentId: string): Promise<{ labelUrl: string }>;
  schedulePickup(shipmentId: string): Promise<void>;
  cancelShipment(shipmentId: string): Promise<void>;
  trackShipment(trackingId: string): Promise<TrackingResult>;
  normalizeWebhook(payload: unknown): { eventKey: string; status: ShipmentStatus; trackingId?: string };
}

export function normalizePincode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function assertShippingRequest(request: ShipmentRequest): void {
  if (!/^\d{6}$/.test(normalizePincode(request.pincode))) throw new Error("A valid six-digit pincode is required.");
  if (!Number.isSafeInteger(request.valuePaise) || request.valuePaise < 0) throw new Error("Invalid shipment value.");
  if (!Number.isSafeInteger(request.weightGrams) || request.weightGrams <= 0) throw new Error("Invalid parcel weight.");
}

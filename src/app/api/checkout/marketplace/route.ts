import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { getPaymentSettings } from "@/lib/payments/settings";
import { chooseShippingProvider } from "@/lib/shipping/selection";

function paise(value: unknown) {
  const amount = typeof value === "number" ? value : Number(String(value ?? ""));
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Invalid quantity.");
  return amount;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const items = Array.isArray(body.items) ? body.items as Array<Record<string, unknown>> : [];
    if (!items.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    const ids = items.map((item) => String(item.productId ?? "")).filter(Boolean);
    const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true, approvalStatus: "APPROVED" } });
    if (products.length !== ids.length || products.some((product) => !product.vendorId)) return NextResponse.json({ error: "Marketplace products could not be validated." }, { status: 400 });
    const quantities = new Map(items.map((item) => [String(item.productId), paise(item.quantity)]));
    const subtotalPaise = products.reduce((total, product) => total + Math.round(Number(product.discountPrice ?? product.price) * 100) * (quantities.get(product.id) ?? 0), 0);
    const address = { name: String(body.customerName ?? "").trim(), phone: String(body.phone ?? "").trim(), address: String(body.deliveryAddress ?? "").trim(), city: String(body.city ?? "").trim(), state: String(body.state ?? "").trim(), pincode: String(body.pincode ?? "").replace(/\D/g, "").slice(0, 6) };
    if (!address.name || !address.phone || !address.address || !address.city || !address.state || !/^\d{6}$/.test(address.pincode)) return NextResponse.json({ error: "Complete delivery details are required." }, { status: 400 });
    const weightGrams = products.reduce((total, product) => total + Math.max(100, Number.parseInt(product.weight ?? "500", 10) || 500) * (quantities.get(product.id) ?? 0), 0);
    const shipping = await chooseShippingProvider({ orderId: "pending", ...address, valuePaise: subtotalPaise, weightGrams, items: products.map((product) => ({ name: product.name, quantity: quantities.get(product.id) ?? 0, sku: product.sku })) });
    const idempotencyKey = String(body.idempotencyKey ?? crypto.randomUUID());
    const existingOrder = await prisma.marketplaceOrder.findUnique({ where: { idempotencyKey }, select: { id: true, paymentMethod: true, razorpayOrderId: true, totalPaise: true } });
    if (existingOrder) return NextResponse.json({ orderId: existingOrder.id, paymentMethod: existingOrder.paymentMethod, razorpayOrderId: existingOrder.razorpayOrderId, amountPaise: existingOrder.totalPaise });
    const settings = await getPaymentSettings();
    const useRazorpay = settings.enableMarketplaceRazorpay;
    const order = await prisma.$transaction(async (tx) => {
      for (const product of products) {
        const quantity = quantities.get(product.id) ?? 0;
        const updated = await tx.product.updateMany({ where: { id: product.id, quantity: { gte: quantity } }, data: { quantity: { decrement: quantity } } });
        if (updated.count !== 1) throw new Error(`${product.name} is out of stock.`);
      }
      const vendorGroups = new Map<string, typeof products>();
      products.forEach((product) => { const group = vendorGroups.get(product.vendorId!) ?? []; group.push(product); vendorGroups.set(product.vendorId!, group); });
      return tx.marketplaceOrder.create({ data: { idempotencyKey, customerName: address.name, phone: address.phone, deliveryAddress: address.address, city: address.city, state: address.state, pincode: address.pincode, email: typeof body.email === "string" ? body.email.trim() : null, subtotalPaise, shippingPaise: shipping.quote.costPaise, totalPaise: subtotalPaise + shipping.quote.costPaise, paymentMethod: useRazorpay ? "RAZORPAY" : "WHATSAPP", vendorOrders: { create: [...vendorGroups.entries()].map(([vendorId, group]) => { const subtotal = group.reduce((sum, product) => sum + Math.round(Number(product.discountPrice ?? product.price) * 100) * (quantities.get(product.id) ?? 0), 0); const commission = Math.round(subtotal * 10 / 100); return { vendorId, subtotalPaise: subtotal, commissionPaise: commission, payoutPaise: subtotal - commission, items: { create: group.map((product) => { const unitPaise = Math.round(Number(product.discountPrice ?? product.price) * 100); const quantity = quantities.get(product.id) ?? 0; return { productId: product.id, productName: product.name, sku: product.sku, unitPaise, quantity, totalPaise: unitPaise * quantity, commissionPaise: Math.round(unitPaise * quantity * 0.1) }; }) } }; }) } } });
    });
    if (!useRazorpay) return NextResponse.json({ orderId: order.id, paymentMethod: "WHATSAPP", shippingProvider: shipping.provider });
    const keyId = process.env.MARKETPLACE_RAZORPAY_KEY_ID;
    const secret = process.env.MARKETPLACE_RAZORPAY_SECRET_KEY;
    if (!keyId || !secret) return NextResponse.json({ error: "Marketplace Razorpay is enabled but credentials are not configured." }, { status: 503 });
    const razorpay = new Razorpay({ key_id: keyId, key_secret: secret });
    const razorpayOrder = await razorpay.orders.create({ amount: order.totalPaise, currency: "INR", receipt: order.id.slice(0, 40), notes: { marketplaceOrderId: order.id } });
    await prisma.marketplaceOrder.update({ where: { id: order.id }, data: { razorpayOrderId: razorpayOrder.id } });
    return NextResponse.json({ orderId: order.id, paymentMethod: "RAZORPAY", razorpayKeyId: keyId, razorpayOrderId: razorpayOrder.id, amountPaise: order.totalPaise, shippingProvider: shipping.provider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create marketplace checkout." }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { requireBuyer, requireSupplier, createTender, listOpenTenders, getBuyerTenders, getSupplierBids, submitBid } from "@/lib/tenders/service";

export async function GET(request: Request) {
  const mode = new URL(request.url).searchParams.get("mode");
  if (mode === "supplier") { const user = await requireSupplier(); return NextResponse.json({ tenders: await listOpenTenders(), bids: await getSupplierBids(user.id) }); }
  const user = await requireBuyer(); return NextResponse.json(await getBuyerTenders(user.id));
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === "bid") { const user = await requireSupplier(); return NextResponse.json(await submitBid(String(body.tenderId), user.id, body)); }
  const user = await requireBuyer();
  return NextResponse.json(await createTender({ title: String(body.title), description: String(body.description), category: String(body.category), deliveryLocation: String(body.deliveryLocation), closingAt: new Date(String(body.closingAt)), buyerId: user.id }));
}

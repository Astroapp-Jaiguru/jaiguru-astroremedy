import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type RGB,
} from "pdf-lib";
import { ORDER_STATUS_LABELS, ORDER_TYPE_LABELS } from "@/lib/orders/status";

/**
 * Delivery slip PDF builder (pure â€” no server-only imports, unit testable).
 * Renders an A4 print-ready slip: brand header (DB logo), order meta,
 * customer + delivery address, item line, optional GST block, totals and a
 * thank-you footer. Only WinAnsi-safe text is drawn (standard fonts).
 */

export interface DeliverySlipPdfInput {
  order: {
    id: string;
    customerName: string;
    phone: string;
    whatsappNumber: string | null;
    itemName: string;
    itemType: string;
    amount: number | null;
    amountLabel: string | null;
    status: string;
    source: string;
    createdAt: Date;
    deliveryAddress: string | null;
  };
  siteName: string;
  tagline: string;
  logoBytes?: Uint8Array;
  logoMime?: string;
  settings: {
    showTax: boolean;
    gstin: string;
    taxRate: number;
  };
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK: RGB = rgb(0.13, 0.16, 0.22);
const MUTED: RGB = rgb(0.42, 0.48, 0.56);
const ACCENT: RGB = rgb(0.976, 0.451, 0.086);
const LIGHT: RGB = rgb(0.965, 0.973, 0.984);
const BORDER: RGB = rgb(0.885, 0.904, 0.937);

function winAnsiSafe(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[^\x00-\xff]/g, "?")
    .replace(/\u20b9/g, "Rs.") // rupee glyph not in WinAnsi
    .trim();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = winAnsiSafe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(attempt, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded)}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export async function buildDeliverySlipPdf(
  input: DeliverySlipPdfInput
): Promise<Uint8Array> {
  const { order, settings } = input;
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  // --- Brand header -------------------------------------------------------
  let logoW = 0;
  if (input.logoBytes && input.logoBytes.length > 0) {
    try {
      const mime = (input.logoMime ?? "").toLowerCase();
      const isPng = mime === "image/png";
      if (isPng || mime === "image/jpeg" || mime === "image/jpg") {
        const image = isPng
          ? await doc.embedPng(input.logoBytes)
          : await doc.embedJpg(input.logoBytes);
        let logoH = 46;
        let logoW = (image.width / image.height) * logoH;
        if (logoW > 150) {
          logoW = 150;
          logoH = (image.height / image.width) * logoW;
        }
        page.drawImage(image, {
          x: MARGIN,
          y: y - logoH,
          width: logoW,
          height: logoH,
        });
        logoW += 12;
      }
    } catch {
      logoW = 0;
    }
  }

  const nameX = MARGIN + logoW;
  page.drawText(winAnsiSafe(input.siteName), {
    x: nameX,
    y: y - 16,
    size: 20,
    font: bold,
    color: INK,
  });
  if (input.tagline) {
    page.drawText(winAnsiSafe(input.tagline).slice(0, 80), {
      x: nameX,
      y: y - 30,
      size: 8.5,
      font: regular,
      color: MUTED,
    });
  }

  const ref = `ORD-${order.id.slice(-6).toUpperCase()}`;
  const slipTitle = "DELIVERY SLIP";
  const titleW = bold.widthOfTextAtSize(slipTitle, 22);
  page.drawText(slipTitle, {
    x: PAGE_W - MARGIN - titleW,
    y: y - 16,
    size: 22,
    font: bold,
    color: ACCENT,
  });
  const refText = `Order Ref: ${ref}`;
  const refW = regular.widthOfTextAtSize(refText, 9.5);
  page.drawText(refText, {
    x: PAGE_W - MARGIN - refW,
    y: y - 31,
    size: 9.5,
    font: regular,
    color: MUTED,
  });

  y -= 56;
  page.drawRectangle({
    x: MARGIN,
    y: y - 2,
    width: CONTENT_W,
    height: 2,
    color: ACCENT,
  });

  // --- Meta row -----------------------------------------------------------
  y -= 34;
  const meta: Array<[string, string]> = [
    ["Order Date", formatDate(order.createdAt)],
    ["Order Status", ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status],
    ["Source", order.source ? winAnsiSafe(order.source) : "â€”"],
  ];
  const colW = CONTENT_W / 3;
  meta.forEach(([label, value], i) => {
    const x = MARGIN + i * colW;
    page.drawText(label.toUpperCase(), {
      x,
      y,
      size: 7.5,
      font: bold,
      color: MUTED,
    });
    page.drawText(winAnsiSafe(value), {
      x,
      y: y - 14,
      size: 10,
      font: regular,
      color: INK,
    });
  });

  // --- Customer / delivery ------------------------------------------------
  y -= 52;
  page.drawText("DELIVER TO", { x: MARGIN, y, size: 9, font: bold, color: ACCENT });
  y -= 18;

  const nameLine = order.customerName && order.customerName !== "-"
    ? winAnsiSafe(order.customerName)
    : "â€”";
  page.drawText(nameLine, { x: MARGIN, y, size: 12, font: bold, color: INK });
  y -= 17;

  const contactBits = [winAnsiSafe(order.phone) || "â€”"];
  if (order.whatsappNumber) {
    contactBits.push(`WhatsApp: ${winAnsiSafe(order.whatsappNumber)}`);
  }
  page.drawText(contactBits.join(" Â· "), {
    x: MARGIN,
    y,
    size: 9.5,
    font: regular,
    color: MUTED,
  });
  y -= 15;

  const address = order.deliveryAddress ? winAnsiSafe(order.deliveryAddress) : "Address on request";
  const addressLines = wrapText(address, regular, 9.5, CONTENT_W - 90).slice(0, 4);
  page.drawText(addressLines[0] ?? "", { x: MARGIN, y, size: 9.5, font: regular, color: INK });
  for (let i = 1; i < addressLines.length; i++) {
    y -= 13;
    page.drawText(addressLines[i], { x: MARGIN, y, size: 9.5, font: regular, color: INK });
  }

  // --- Item table ----------------------------------------------------------
  y -= 40;
  const rowH = 30;
  const qtyW = 60;
  const amountW = 110;
  const nameW = CONTENT_W - qtyW - amountW;

  const colXs = [MARGIN, MARGIN + nameW, MARGIN + nameW + qtyW];

  page.drawRectangle({
    x: MARGIN,
    y: y - rowH + 6,
    width: CONTENT_W,
    height: rowH,
    color: LIGHT,
  });
  page.drawText("ITEM", { x: colXs[0] + 10, y: y - 8, size: 7.5, font: bold, color: MUTED });
  page.drawText("QTY", { x: colXs[1] + 10, y: y - 8, size: 7.5, font: bold, color: MUTED });
  page.drawText("AMOUNT", { x: colXs[2] + 10, y: y - 8, size: 7.5, font: bold, color: MUTED });

  y -= rowH + 8;
  const itemTypeLabel =
    ORDER_TYPE_LABELS[order.itemType as "SERVICE" | "PRODUCT"] ?? order.itemType;
  const itemLines = wrapText(winAnsiSafe(order.itemName), regular, 11, nameW - 20).slice(0, 3);
  page.drawText(itemLines[0] ?? winAnsiSafe(order.itemName), {
    x: colXs[0] + 10,
    y,
    size: 11,
    font: bold,
    color: INK,
  });
  if (itemLines[1]) page.drawText(itemLines[1], { x: colXs[0] + 10, y: y - 13, size: 10, font: regular, color: INK });
  page.drawText(itemTypeLabel, { x: colXs[0] + 10, y: y - 26, size: 8, font: regular, color: MUTED });
  page.drawText("1", { x: colXs[1] + 10, y, size: 11, font: regular, color: INK });

  const amountValue =
    order.amount != null && Number.isFinite(order.amount)
      ? formatCurrency(order.amount)
      : order.amountLabel
        ? winAnsiSafe(order.amountLabel)
        : "On Request";
  const amountFont = order.amount != null ? bold : regular;
  page.drawText(amountValue, { x: colXs[2] + 10, y, size: 11, font: amountFont, color: INK });

  y -= 24;
  page.drawRectangle({
    x: MARGIN,
    y: y - 1,
    width: CONTENT_W,
    height: 1,
    color: BORDER,
  });

  // --- Totals / tax block ---------------------------------------------------
  y -= 30;
  const totalsW = 250;
  const totalsX = PAGE_W - MARGIN - totalsW;
  const lineGap = 15;
  const labelSize = 9.5;

  const drawLine = (label: string, value: string, opts?: { boldValue?: boolean; color?: RGB }) => {
    page.drawText(label, { x: totalsX, y, size: labelSize, font: regular, color: MUTED });
    const v = winAnsiSafe(value);
    const vW = (opts?.boldValue ? bold : regular).widthOfTextAtSize(v, labelSize);
    page.drawText(v, {
      x: totalsX + totalsW - vW,
      y,
      size: labelSize,
      font: opts?.boldValue ? bold : regular,
      color: opts?.color ?? INK,
    });
    y -= lineGap;
  };

  const amountKnown = order.amount != null && Number.isFinite(order.amount) && order.amount > 0;
  const base = amountKnown ? order.amount! : 0;
  const tax = amountKnown ? Math.round(base * settings.taxRate) / 100 : 0;
  const total = base + tax;

  if (settings.showTax) {
    drawLine("GSTIN", settings.gstin ? settings.gstin : "â€”", { boldValue: true });
    drawLine("Tax Rate", `${settings.taxRate}%`);
    if (amountKnown) {
      drawLine("Item Total", formatCurrency(base));
      drawLine(`GST (${settings.taxRate}%)`, formatCurrency(tax));
      y -= 4;
      page.drawRectangle({ x: totalsX, y, width: totalsW, height: 1, color: BORDER });
      y -= 14;
      drawLine("Total Price (Rs.)", formatCurrency(total), { boldValue: true, color: ACCENT });
    } else {
      drawLine("Total Price (Rs.)", order.amountLabel ? winAnsiSafe(order.amountLabel) : "On Request", {
        boldValue: true,
        color: ACCENT,
      });
    }
  } else {
    drawLine(
      "Total Price (Rs.)",
      amountKnown ? formatCurrency(total) : order.amountLabel ? winAnsiSafe(order.amountLabel) : "On Request",
      { boldValue: true, color: ACCENT }
    );
  }

  // --- Divider + footer -----------------------------------------------------
  y -= 12;
  page.drawRectangle({ x: MARGIN, y: y - 1, width: CONTENT_W, height: 1, color: BORDER });
  y -= 34;

  const thanks = "Thank you for your purchase!";
  const thanksW = bold.widthOfTextAtSize(thanks, 13);
  page.drawText(thanks, {
    x: (PAGE_W - thanksW) / 2,
    y,
    size: 13,
    font: bold,
    color: ACCENT,
  });
  y -= 18;
  const foot = `Generated automatically by ${winAnsiSafe(input.siteName).slice(0, 60)} Â· ${ref}`;
  const footW = regular.widthOfTextAtSize(foot, 8.5);
  page.drawText(foot, {
    x: (PAGE_W - footW) / 2,
    y,
    size: 8.5,
    font: regular,
    color: MUTED,
  });

  return doc.save();
}
import {
  Inter,
  Poppins,
  Lato,
  Roboto,
  Montserrat,
  Open_Sans,
  Playfair_Display,
  Merriweather,
  Lora,
  Cormorant_Garamond,
  DM_Serif_Display,
} from "next/font/google";

/**
 * Google font instances offered by the Theme Settings CMS (Phase 8).
 * All instances are mounted as CSS variables on <html> so their @font-face
 * rules are always emitted; the active pair is applied at runtime by
 * <ThemeStyles /> overriding --font-sans / --font-heading.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
  weight: ["400", "700"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
  weight: ["400", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant-garamond",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
  display: "swap",
  weight: ["400"],
});

export const BODY_FONT_INSTANCES: Record<string, { style: { fontFamily: string } }> = {
  inter,
  poppins,
  lato,
  roboto,
  montserrat,
  "open-sans": openSans,
  georgia: { style: { fontFamily: "Georgia, 'Times New Roman', serif" } },
  arial: { style: { fontFamily: "Arial, Helvetica, sans-serif" } },
};

export const HEADING_FONT_INSTANCES: Record<string, { style: { fontFamily: string } }> = {
  "playfair-display": playfair,
  merriweather,
  lora,
  "cormorant-garamond": cormorant,
  "dm-serif-display": dmSerif,
  georgia: { style: { fontFamily: "Georgia, 'Times New Roman', serif" } },
  arial: { style: { fontFamily: "Arial, Helvetica, sans-serif" } },
};

export const ALL_FONT_INSTANCES: Record<string, { style: { fontFamily: string } }> = {
  ...BODY_FONT_INSTANCES,
  ...HEADING_FONT_INSTANCES,
};

/** Class names mounted on <html> so every font's @font-face CSS ships. */
export const FONT_VARIABLE_CLASSES = [
  inter.variable,
  poppins.variable,
  lato.variable,
  roboto.variable,
  montserrat.variable,
  openSans.variable,
  playfair.variable,
  merriweather.variable,
  lora.variable,
  cormorant.variable,
  dmSerif.variable,
].join(" ");

export function bodyFontFamily(id: string): string {
  return BODY_FONT_INSTANCES[id]?.style.fontFamily ?? inter.style.fontFamily;
}

export function headingFontFamily(id: string): string {
  return (
    HEADING_FONT_INSTANCES[id]?.style.fontFamily ??
    playfair.style.fontFamily
  );
}

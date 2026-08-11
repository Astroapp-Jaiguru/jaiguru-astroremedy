import { getTypographyOverrides, buildOverrideCss } from "@/lib/typography-overrides";

/**
 * Injects CSS for local per-field typography overrides (Phase "Local
 * Override"). Elements on the public site carry data-typo="<section>-<field>"
 * attributes; this component emits !important rules for each active override
 * so local settings beat the global Typography system. Rendered alongside
 * ThemeStyles in the public layout.
 */
export async function TypographyOverrides() {
  const overrides = await getTypographyOverrides();

  const blocks: string[] = [];

  const rule = (attr: string, css: string) =>
    // Doubled attribute selector: beats element-scoped !important theme
    // rules (e.g. `h1 .text-gold-gradient`) via higher specificity.
    `[data-typo="${attr}"][data-typo="${attr}"] {\n${css}\n}`;

  for (const [section, map] of [
    ["hero", overrides.hero],
    ["branding", overrides.branding],
    ["astrologer", overrides.astrologer],
  ] as const) {
    for (const [field, o] of Object.entries(map)) {
      const css = buildOverrideCss(o);
      if (!css) continue;
      blocks.push(rule(`${section}-${field}`, css));
    }
  }

  for (const [id, entry] of Object.entries(overrides.faq)) {
    if (entry.question) {
      const css = buildOverrideCss(entry.question);
      if (css) blocks.push(rule(`faq-${id}-question`, css));
    }
    if (entry.answer) {
      const css = buildOverrideCss(entry.answer);
      if (css) blocks.push(rule(`faq-${id}-answer`, css));
    }
  }

  if (blocks.length === 0) return null;

  return (
    <style id="local-typography-overrides" dangerouslySetInnerHTML={{ __html: blocks.join("\n") }} />
  );
}

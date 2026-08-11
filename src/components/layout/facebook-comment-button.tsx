import { FacebookIcon } from "@/components/layout/social-icons";

/**
 * Floating "Facebook Comment" engagement button (glassmorphism).
 * Positioned just above the WhatsApp/Call floating stack on desktop and
 * above the sticky bottom bar on mobile. Opens the Facebook post so
 * visitors can join the conversation with a comment.
 */
export function FacebookCommentButton() {
  const href = "https://www.facebook.com/share/p/17nKkpsqmq/";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comment on Facebook"
      className="group fixed bottom-24 right-4 z-40 flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 py-2 pl-2 pr-4 shadow-[0_10px_35px_rgba(24,119,242,0.3)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-golden/60 hover:bg-white/15 md:bottom-40 md:right-6"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-[0_4px_14px_rgba(24,119,242,0.5)] transition group-hover:bg-[#166FE5]">
        <FacebookIcon className="h-5 w-5" />
      </span>
      <span className="text-[13px] font-semibold tracking-wide text-white">
        Comment
      </span>
    </a>
  );
}
"use client";

import { useState, useCallback, useId } from "react";
import { Plus, Share2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Drink } from "@/data/drinks";

function formatDrinkAsText(drink: Drink): string {
  const lines: string[] = [
    `🍸 ${drink.name} — ${drink.city}`,
    "",
    "Ingredients:",
    ...drink.recipe.ingredients.map((ing) => `• ${ing.amount} ${ing.item}`),
    "",
    "Method:",
    ...drink.recipe.instructions.map((step, i) => `${i + 1}. ${step}`),
    "",
    `Glass: ${drink.recipe.glass}`,
  ];
  if (drink.recipe.garnish !== "None") {
    lines.push(`Garnish: ${drink.recipe.garnish}`);
  }
  return lines.join("\n");
}

interface RecipeTileProps {
  drink: Drink;
  accentColor: string;
  accentTextColor: "#000" | "#fff";
  /** Controlled open state, so the page can open the tile when jumping to it. */
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Ref to the header button, so focus can follow a jump. */
  toggleRef?: React.Ref<HTMLButtonElement>;
  /** Fires once the open animation settles (layout has its final height). */
  onOpened?: () => void;
}

export default function RecipeTile({
  drink,
  accentColor,
  accentTextColor,
  isExpanded,
  onExpandedChange,
  toggleRef,
  onOpened,
}: RecipeTileProps) {
  const setIsExpanded = onExpandedChange;
  const [copied, setCopied] = useState(false);
  const contentId = useId();

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(formatDrinkAsText(drink));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); fail silently.
    }
  }, [drink]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = formatDrinkAsText(drink);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${drink.name} — ${drink.city}`, text });
      } catch {
        // User cancelled
      }
    }
  }, [drink]);

  const onAccent = accentTextColor === "#fff";
  const hairline = onAccent ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.16)";
  // Same control language as the header: solid tonal fill, no hairline border.
  const tonal = onAccent
    ? "bg-white/[0.18] hover:bg-white/[0.26] active:bg-white/[0.32]"
    : "bg-black/[0.10] hover:bg-black/[0.16] active:bg-black/[0.22]";
  const pill = `h-9 pl-3 pr-3.5 flex items-center gap-2 rounded-full font-mono text-[11px] font-medium leading-none uppercase tracking-[0.08em] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-current [&>svg]:block ${tonal}`;

  return (
    <motion.div
      className="rounded-[20px] overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: accentColor, color: accentTextColor }}
    >
      {/* Header — a real button (not a role=button wrapper) so the copy/share
          controls below are not nested inside an interactive element. */}
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative w-full block pl-6 md:pl-8 pr-16 md:pr-20 pt-6 md:pt-7 pb-6 md:pb-7 text-left cursor-pointer outline-none"
      >
        <p className="font-mono text-[11px] leading-[16px] uppercase tracking-[0.12em] opacity-75">{drink.tagline}</p>
        <h3 className="mt-3 md:mt-4 text-[clamp(30px,4.6vw,48px)] font-medium leading-[0.95] tracking-[-0.04em]">
          {drink.name}
        </h3>
        {/* Pinned to the corner with equal top/right inset, and vertically centered
            on the label row (label center = padding-top + 8px; disc is 36px). */}
        <motion.span
          aria-hidden="true"
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`absolute top-[14px] right-[14px] md:top-[18px] md:right-[18px] w-9 h-9 rounded-full grid place-items-center transition-colors group-focus-visible:ring-2 group-focus-visible:ring-current ${onAccent ? "bg-white/[0.18] group-hover:bg-white/[0.26]" : "bg-black/[0.10] group-hover:bg-black/[0.16]"}`}
        >
          <Plus size={16} strokeWidth={1.75} absoluteStrokeWidth className="block" />
        </motion.span>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onAnimationComplete={() => { if (isExpanded) onOpened?.(); }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-7 md:pb-8">
              <div className="pt-5 border-t" style={{ borderColor: hairline }}>
                <p className="text-[15px] leading-relaxed max-w-[58ch] opacity-90">{drink.description}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] opacity-75">
                  {drink.type}
                  {!drink.isAlcoholic && " · Non-alcoholic"}
                  {" · "}
                  {drink.recipe.glass}
                </p>
              </div>

              <div className="mt-8 grid gap-8 md:gap-10 md:grid-cols-[5fr_7fr]">
                {/* Ingredients */}
                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-75 mb-2">Ingredients</h4>
                  <ul>
                    {drink.recipe.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex items-baseline justify-between gap-4 py-2.5 border-b last:border-b-0"
                        style={{ borderColor: hairline }}
                      >
                        <span className="text-[15px]">{ing.item}</span>
                        <span className="font-mono text-[12px] whitespace-nowrap opacity-80">{ing.amount}</span>
                      </li>
                    ))}
                  </ul>
                  {drink.recipe.garnish !== "None" && (
                    <p className="mt-4 text-[13px] opacity-80">
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-90 mr-2">Garnish</span>
                      {drink.recipe.garnish}
                    </p>
                  )}
                </div>

                {/* Method */}
                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-75 mb-2">Method</h4>
                  <ol>
                    {drink.recipe.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 py-2.5">
                        <span className="font-mono text-[12px] leading-[1.6] opacity-70 shrink-0">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <p className="text-[15px] leading-relaxed">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Copy / Share */}
              <div className="flex items-center gap-2 mt-8">
                <button onClick={handleCopy} className={pill} aria-label={copied ? "Copied" : "Copy recipe"}>
                  {copied ? <Check aria-hidden="true" size={15} strokeWidth={1.75} absoluteStrokeWidth /> : <Copy aria-hidden="true" size={15} strokeWidth={1.75} absoluteStrokeWidth />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={handleShare} className={pill} aria-label="Share recipe">
                  <Share2 aria-hidden="true" size={15} strokeWidth={1.75} absoluteStrokeWidth />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

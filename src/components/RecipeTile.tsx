"use client";

import { useState, useCallback } from "react";
import { Wine, ChevronDown, Share2, Copy, Check } from "lucide-react";
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
}

export default function RecipeTile({ drink, accentColor, accentTextColor }: RecipeTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(formatDrinkAsText(drink));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <motion.div
      className="rounded-3xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: accentColor, color: accentTextColor }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header — always visible */}
      <div className="flex items-center justify-between pl-4 pr-5 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <Wine size={24} strokeWidth={1.5} className="shrink-0 opacity-75" />
          <div className="min-w-0">
            <p className="text-xs tracking-wide opacity-75">{drink.tagline}</p>
            <h3 className="text-lg font-bold tracking-tight truncate">
              {drink.name}
            </h3>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-60 shrink-0 ml-3"
        >
          <ChevronDown size={20} />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-14 pb-6">
              <p className="text-sm leading-relaxed opacity-75 mb-1">
                {drink.description}
              </p>
              <p className="text-xs opacity-60 mb-5 capitalize">
                {drink.type}
                {!drink.isAlcoholic && " \u00B7 Non-alcoholic"}
              </p>

              {/* Ingredients */}
              <h4 className="text-[10px] font-semibold tracking-widest uppercase opacity-60 mb-3">
                Ingredients
              </h4>
              <div className="mb-5">
                {drink.recipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between py-2 last:border-0"
                    style={{ borderBottomWidth: "1px", borderColor: accentTextColor === "#fff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
                  >
                    <span className="text-sm">{ing.item}</span>
                    <span className="text-xs opacity-70 ml-3 whitespace-nowrap tabular-nums">
                      {ing.amount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Method */}
              <h4 className="text-[10px] font-semibold tracking-widest uppercase opacity-60 mb-3">
                Method
              </h4>
              <div className="mb-4">
                {drink.recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3 mb-2.5">
                    <span className="text-xs font-bold opacity-50 w-4 shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div
                className="flex gap-6 pt-3"
                style={{ borderTopWidth: "1px", borderColor: accentTextColor === "#fff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
              >
                <div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase opacity-60">
                    Glass
                  </span>
                  <p className="text-xs mt-0.5">{drink.recipe.glass}</p>
                </div>
                {drink.recipe.garnish !== "None" && (
                  <div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase opacity-60">
                      Garnish
                    </span>
                    <p className="text-xs mt-0.5">{drink.recipe.garnish}</p>
                  </div>
                )}
              </div>

              {/* Copy / Share */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={handleCopy}
                  className={`h-9 px-4 flex items-center gap-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${accentTextColor === "#fff" ? "bg-white/15 hover:bg-white/25" : "bg-black/10 hover:bg-black/20"}`}
                  aria-label={copied ? "Copied" : "Copy recipe"}
                >
                  {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleShare}
                  className={`h-9 px-4 flex items-center gap-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${accentTextColor === "#fff" ? "bg-white/15 hover:bg-white/25" : "bg-black/10 hover:bg-black/20"}`}
                  aria-label="Share recipe"
                >
                  <Share2 size={16} strokeWidth={1.5} />
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

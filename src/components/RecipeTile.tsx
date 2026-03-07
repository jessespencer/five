"use client";

import { useState } from "react";
import { Wine, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Drink } from "@/data/drinks";

interface RecipeTileProps {
  drink: Drink;
  isTransitioning: boolean;
}

export default function RecipeTile({ drink, isTransitioning }: RecipeTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="bg-[var(--sheet-bg)] rounded-2xl overflow-hidden cursor-pointer transition-colors"
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header — always visible */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Wine size={20} strokeWidth={1.5} className="shrink-0 opacity-60" />
          <div className="min-w-0">
            <p className="text-xs tracking-wide opacity-50">{drink.tagline}</p>
            <h3 className="text-lg font-bold tracking-tight truncate">
              {drink.name}
            </h3>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="opacity-30 shrink-0 ml-3"
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
            <div className="px-5 pb-5">
              <p className="text-sm leading-relaxed opacity-50 mb-1">
                {drink.description}
              </p>
              <p className="text-xs opacity-30 mb-5 capitalize">
                {drink.type}
                {!drink.isAlcoholic && " \u00B7 Non-alcoholic"}
              </p>

              {/* Ingredients */}
              <h4 className="text-[10px] font-semibold tracking-widest uppercase opacity-30 mb-3">
                Ingredients
              </h4>
              <div className="mb-5">
                {drink.recipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between py-2 border-b border-[var(--foreground)]/5 last:border-0"
                  >
                    <span className="text-sm">{ing.item}</span>
                    <span className="text-xs opacity-40 ml-3 whitespace-nowrap tabular-nums">
                      {ing.amount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Method */}
              <h4 className="text-[10px] font-semibold tracking-widest uppercase opacity-30 mb-3">
                Method
              </h4>
              <div className="mb-4">
                {drink.recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3 mb-2.5">
                    <span className="text-xs font-bold opacity-20 w-4 shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="flex gap-6 pt-3 border-t border-[var(--foreground)]/5">
                <div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase opacity-30">
                    Glass
                  </span>
                  <p className="text-xs mt-0.5">{drink.recipe.glass}</p>
                </div>
                {drink.recipe.garnish !== "None" && (
                  <div>
                    <span className="text-[10px] font-semibold tracking-widest uppercase opacity-30">
                      Garnish
                    </span>
                    <p className="text-xs mt-0.5">{drink.recipe.garnish}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

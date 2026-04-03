"use client";

import { useState } from "react";
import { Wine, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Drink } from "@/data/drinks";

interface RecipeTileProps {
  drink: Drink;
  accentColor: string;
  accentTextColor: "#000" | "#fff";
}

export default function RecipeTile({ drink, accentColor, accentTextColor }: RecipeTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            <div className="px-14 pb-14">
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
                    style={{ borderBottomWidth: "1px", borderColor: `${accentTextColor}33` }}
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
                style={{ borderTopWidth: "1px", borderColor: `${accentTextColor}33` }}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

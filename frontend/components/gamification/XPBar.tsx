"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useXP } from "@/store/useGamificationStore";
import { LEVEL_TITLES, LEVEL_COLORS, calculateLevel } from "@/lib/gamification/xp-rules";
import { useLocale } from "next-intl";

interface XPBarProps {
  showLabel?: boolean;
  compact?: boolean;
  animated?: boolean;
}

export const XPBar = ({ showLabel = true, compact = false, animated = true }: XPBarProps) => {
  const locale = useLocale() as "en" | "hi" | "te" | "ta";
  const { xp, level, progress, nextLevelXP } = useXP();
  const [prevXP, setPrevXP] = useState(xp);
  const [leveledUp, setLeveledUp] = useState(false);

  // Detect level up
  useEffect(() => {
    if (xp > prevXP) {
      const newLevel = calculateLevel(xp);
      if (newLevel > level) {
        setLeveledUp(true);
        setTimeout(() => setLeveledUp(false), 3000);
      }
    }
    setPrevXP(xp);
  }, [xp, level, prevXP]);

  const levelTitle = LEVEL_TITLES[level as keyof typeof LEVEL_TITLES]?.[locale] || LEVEL_TITLES[level as keyof typeof LEVEL_TITLES].en;
  const levelColor = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || "#FFD700";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          className="text-xl font-bold px-2 py-1 rounded"
          style={{ backgroundColor: levelColor, color: "#fff" }}
          animate={leveledUp ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          Lvl {level}
        </motion.div>
        <div className="text-sm font-semibold text-gray-700">{xp} XP</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 px-4 py-3 bg-gradient-to-r from-saffron/5 to-green/5 rounded-lg border border-saffron/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <motion.div
            className="flex items-center justify-center w-14 h-14 rounded-full font-bold text-white text-lg shadow-lg"
            style={{ backgroundColor: levelColor }}
            animate={leveledUp ? { scale: [1, 1.15, 1], rotate: 360 } : {}}
            transition={{ duration: 0.6 }}
          >
            {level}
          </motion.div>

          {/* Level Title */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Level {level}</span>
            <span className="text-sm font-bold text-gray-800">{levelTitle}</span>
          </div>
        </div>

        {/* XP Display */}
        <div className="text-right">
          <div className="text-xs text-gray-600 font-semibold">XP Progress</div>
          <motion.div className="text-lg font-bold text-saffron">
            <motion.span
              key={xp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {xp.toLocaleString()}
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold text-gray-600">
          <span>Level Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar Background */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress Bar Fill */}
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${levelColor}cc, ${levelColor}ff)`,
              boxShadow: `0 0 8px ${levelColor}66`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: animated ? 0.6 : 0, ease: "easeOut" }}
          />
        </div>

        {/* XP to Next Level */}
        {showLabel && (
          <div className="text-xs text-gray-600 font-semibold">
            {Math.max(0, nextLevelXP).toLocaleString()} XP to next level
          </div>
        )}
      </div>

      {/* Level Up Animation */}
      {leveledUp && (
        <motion.div
          className="bg-gradient-to-r from-yellow-300 to-yellow-200 text-gray-800 font-bold text-center py-2 rounded-lg"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          🎉 Level Up! You are now Level {level}
        </motion.div>
      )}
    </div>
  );
};

export default XPBar;

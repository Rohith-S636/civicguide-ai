"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  showHistory?: boolean;
}

export const StreakTracker = ({
  currentStreak = 0,
  longestStreak = 0,
  showHistory = true,
}: StreakTrackerProps) => {
  const streakLevel = getStreakLevel(currentStreak);

  return (
    <div className="w-full space-y-3">
      {/* Current Streak */}
      <motion.div
        className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-lg shadow-lg"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl"
            >
              <Flame size={32} />
            </motion.div>
            <div>
              <p className="text-sm opacity-90 font-semibold">Current Streak</p>
              <p className="text-2xl font-bold">{currentStreak} days</p>
              <p className="text-xs opacity-80">{streakLevel}</p>
            </div>
          </div>

          {/* Streak Percentage */}
          <div className="text-right">
            <div className="text-4xl font-bold">
              {currentStreak > 0 ? currentStreak : "—"}
            </div>
            <div className="text-xs opacity-75">days in a row</div>
          </div>
        </div>

        {/* Streak Progress Bar */}
        {currentStreak > 0 && (
          <div className="mt-3 h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentStreak / 30) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
      </motion.div>

      {/* Streak Milestones */}
      {showHistory && (
        <div className="grid grid-cols-3 gap-3">
          {/* 7-Day Milestone */}
          <motion.div
            className={`p-3 rounded-lg text-center font-semibold text-sm ${
              currentStreak >= 7
                ? "bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300"
                : "bg-gray-100 border-2 border-gray-300 opacity-50"
            }`}
            whileHover={currentStreak >= 7 ? { scale: 1.05 } : {}}
          >
            <div className="text-xl mb-1">🔥</div>
            <div>7-Day</div>
            {currentStreak >= 7 && <div className="text-xs text-blue-600">✓ Unlocked</div>}
          </motion.div>

          {/* 14-Day Milestone */}
          <motion.div
            className={`p-3 rounded-lg text-center font-semibold text-sm ${
              currentStreak >= 14
                ? "bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-300"
                : "bg-gray-100 border-2 border-gray-300 opacity-50"
            }`}
            whileHover={currentStreak >= 14 ? { scale: 1.05 } : {}}
          >
            <div className="text-xl mb-1">💪</div>
            <div>14-Day</div>
            {currentStreak >= 14 && <div className="text-xs text-purple-600">✓ Unlocked</div>}
          </motion.div>

          {/* 30-Day Milestone */}
          <motion.div
            className={`p-3 rounded-lg text-center font-semibold text-sm ${
              currentStreak >= 30
                ? "bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300"
                : "bg-gray-100 border-2 border-gray-300 opacity-50"
            }`}
            whileHover={currentStreak >= 30 ? { scale: 1.05 } : {}}
          >
            <div className="text-xl mb-1">👑</div>
            <div>30-Day</div>
            {currentStreak >= 30 && <div className="text-xs text-yellow-600">✓ Unlocked</div>}
          </motion.div>
        </div>
      )}

      {/* Longest Streak */}
      {longestStreak > 0 && longestStreak !== currentStreak && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700">Longest Streak</div>
            <div className="text-lg font-bold text-gray-800">{longestStreak} days</div>
          </div>
        </div>
      )}

      {/* Streak Tips */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs text-gray-700 space-y-1">
        <p className="font-semibold text-blue-800">💡 Keep your streak alive!</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-700">
          <li>Log in daily to maintain your streak</li>
          <li>Earn +10 XP for daily login bonus</li>
          <li>Streaks reset after missing a day</li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to get streak level text
const getStreakLevel = (streak: number): string => {
  if (streak === 0) return "Start your journey";
  if (streak < 7) return "Getting started";
  if (streak < 14) return "On fire! 🔥";
  if (streak < 30) return "Unstoppable! 💪";
  if (streak < 60) return "Legend status! 👑";
  return "Hall of fame! ⭐";
};

export default StreakTracker;

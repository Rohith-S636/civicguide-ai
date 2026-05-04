"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useXP } from "@/store/useGamificationStore";
import { LEVEL_TITLES, LEVEL_COLORS } from "@/lib/gamification/xp-rules";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, Trophy, Loader } from "lucide-react";

export interface LeaderboardUser {
  rank: number;
  username: string;
  xp: number;
  level: number;
  badges_count?: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  users?: LeaderboardUser[];
  isLoading?: boolean;
  currentUserId?: string;
  currentUsername?: string;
  onPaginationChange?: (page: number) => void;
  itemsPerPage?: number;
}

export const Leaderboard = ({
  users = [],
  isLoading = false,
  currentUserId,
  currentUsername,
  onPaginationChange,
  itemsPerPage = 10,
}: LeaderboardProps) => {
  const locale = useLocale() as "en" | "hi" | "te" | "ta";
  const { xp: userXP, level: userLevel } = useXP();
  const [currentPage, setCurrentPage] = useState(1);
  const [userRank, setUserRank] = useState<LeaderboardUser | null>(null);

  // Calculate user's rank
  useEffect(() => {
    if (currentUsername && users.length > 0) {
      const foundUser = users.find((u) => u.username === currentUsername);
      if (foundUser) {
        setUserRank(foundUser);
      }
    }
  }, [currentUsername, users]);

  const handlePrevious = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    onPaginationChange?.(newPage);
  };

  const handleNext = () => {
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const newPage = Math.min(totalPages, currentPage + 1);
    setCurrentPage(newPage);
    onPaginationChange?.(newPage);
  };

  const getTrophyEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin text-saffron" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 px-2">
        <Trophy className="text-saffron" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Global Leaderboard</h2>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-saffron to-green text-white">
              <th className="px-4 py-3 text-left font-bold text-sm">Rank</th>
              <th className="px-4 py-3 text-left font-bold text-sm">Citizen</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Level</th>
              <th className="px-4 py-3 text-right font-bold text-sm">XP</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Badges</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  No leaderboard data available
                </td>
              </tr>
            ) : (
              users.map((user, index) => {
                const isCurrentUser = user.isCurrentUser || user.username === currentUsername;
                const levelColor = LEVEL_COLORS[user.level as keyof typeof LEVEL_COLORS] || "#FFD700";
                const levelTitle =
                  LEVEL_TITLES[user.level as keyof typeof LEVEL_TITLES]?.[locale] ||
                  LEVEL_TITLES[user.level as keyof typeof LEVEL_TITLES].en;

                return (
                  <motion.tr
                    key={`${user.rank}-${user.username}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                      isCurrentUser ? "bg-saffron/10 border-l-4 border-l-saffron" : ""
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-4 py-3 font-bold text-lg">
                      <div className="flex items-center gap-2">
                        {getTrophyEmoji(user.rank)}
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-saffron to-green flex items-center justify-center text-white text-xs font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">
                            {user.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-saffron text-white px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: levelColor }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {user.level}
                        </motion.div>
                        <div className="text-xs text-gray-600 font-semibold">{levelTitle}</div>
                      </div>
                    </td>

                    {/* XP */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-saffron text-lg">{user.xp.toLocaleString()}</span>
                    </td>

                    {/* Badges */}
                    <td className="px-4 py-3 text-center">
                      <motion.div
                        className="inline-flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full font-bold text-sm text-yellow-800"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span>🏆</span>
                        <span>{user.badges_count || 0}</span>
                      </motion.div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Current User's Rank (if not in top 10) */}
      {userRank && userRank.rank > itemsPerPage && (
        <motion.div
          className="border-2 border-saffron rounded-lg p-4 bg-saffron/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getTrophyEmoji(userRank.rank)}</div>
              <div>
                <div className="text-sm font-semibold text-gray-600">Your Rank</div>
                <div className="text-lg font-bold text-gray-800">#{userRank.rank}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-saffron">{userRank.xp.toLocaleString()} XP</div>
              <div className="text-sm text-gray-600">Level {userRank.level}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pagination Controls */}
      {users.length > itemsPerPage && (
        <div className="flex items-center justify-between px-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              Page {currentPage} of {Math.ceil(users.length / itemsPerPage)}
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage >= Math.ceil(users.length / itemsPerPage)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Empty State */}
      {users.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Trophy className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-gray-500 font-semibold">No leaderboard data available yet</p>
          <p className="text-gray-400 text-sm">Start earning XP to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

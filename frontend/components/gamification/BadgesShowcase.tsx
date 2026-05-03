"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBadges } from "@/store/useGamificationStore";
import { BADGES, Badge, getRarityColor, getRarityBgColor } from "@/lib/gamification/badges";
import { X } from "lucide-react";

interface BadgesShowcaseProps {
  compact?: boolean;
  maxDisplay?: number;
  showAllButton?: boolean;
}

export const BadgesShowcase = ({
  compact = false,
  maxDisplay = 6,
  showAllButton = true,
}: BadgesShowcaseProps) => {
  const { badges: userBadges } = useBadges();
  const [showAll, setShowAll] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const userBadgeObjects = userBadges
    .map((badgeId) => BADGES[badgeId])
    .filter((badge) => badge !== undefined);

  const displayedBadges = showAll ? userBadgeObjects : userBadgeObjects.slice(0, maxDisplay);
  const hasMore = userBadgeObjects.length > maxDisplay;

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {userBadgeObjects.slice(0, 3).map((badge) => (
          <motion.div
            key={badge.id}
            className="text-2xl cursor-pointer"
            whileHover={{ scale: 1.2, rotate: 5 }}
            onClick={() => setSelectedBadge(badge)}
            title={badge.name}
          >
            {badge.icon}
          </motion.div>
        ))}
        {userBadgeObjects.length > 3 && (
          <motion.div className="text-sm font-bold text-saffron">
            +{userBadgeObjects.length - 3}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Your Badges ({userBadgeObjects.length})
        </h3>
        {hasMore && showAllButton && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-saffron hover:text-green transition-colors"
          >
            {showAll ? "Show Less" : "Show All"}
          </button>
        )}
      </div>

      {/* Badges Grid */}
      {userBadgeObjects.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-600 font-semibold">No badges yet</p>
          <p className="text-gray-500 text-sm">Earn XP and unlock achievements to get badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {displayedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${getRarityBgColor(
                  badge.rarity
                )}`}
              >
                <div className="text-center">
                  {/* Badge Icon */}
                  <motion.div
                    className="text-5xl mb-2"
                    whileHover={{ scale: 1.15, rotate: 10 }}
                  >
                    {badge.icon}
                  </motion.div>

                  {/* Badge Name */}
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{badge.name}</h4>

                  {/* Badge Description */}
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>

                  {/* Rarity & XP Bonus */}
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={`${getRarityColor(badge.rarity)} capitalize`}>
                      {badge.rarity}
                    </span>
                    <span className="text-green-600">+{badge.xpBonus} XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-xl shadow-xl ${getRarityBgColor(selectedBadge.rarity)}`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full"
              >
                <X size={20} />
              </button>

              {/* Badge Details */}
              <div className="text-center space-y-4">
                {/* Icon */}
                <motion.div
                  className="text-7xl mx-auto"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {selectedBadge.icon}
                </motion.div>

                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-800">{selectedBadge.name}</h2>

                {/* Description */}
                <p className="text-gray-700 font-semibold">{selectedBadge.description}</p>

                {/* Condition */}
                <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold uppercase">How to unlock</p>
                  <p className="text-sm text-gray-800 font-semibold">{selectedBadge.condition}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Rarity */}
                  <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase">Rarity</p>
                    <p className={`text-sm font-bold capitalize ${getRarityColor(selectedBadge.rarity)}`}>
                      {selectedBadge.rarity}
                    </p>
                  </div>

                  {/* XP Bonus */}
                  <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase">XP Bonus</p>
                    <p className="text-sm font-bold text-green-600">+{selectedBadge.xpBonus}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-full mt-4 bg-gradient-to-r from-saffron to-green text-white font-bold py-2 rounded-lg hover:shadow-lg transition-shadow"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgesShowcase;

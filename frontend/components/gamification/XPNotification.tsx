"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXPNotification, useBadges } from "@/store/useGamificationStore";
import { BADGES } from "@/lib/gamification/badges";
import { toast } from "sonner";

interface XPNotificationProps {
  onBadgeUnlocked?: (badgeId: string) => void;
}

export const XPNotificationToast = ({ onBadgeUnlocked }: XPNotificationProps) => {
  const { show, xp, reason, dismiss } = useXPNotification();
  const { badges } = useBadges();
  const [displayedBadges, setDisplayedBadges] = React.useState<Set<string>>(new Set());

  // Toast notifications for XP gains
  useEffect(() => {
    if (show && xp > 0) {
      // Determine emoji based on reason
      let emoji = "⭐";
      if (reason.includes("quiz")) emoji = "🎯";
      else if (reason.includes("question")) emoji = "🎤";
      else if (reason.includes("simulation")) emoji = "📊";
      else if (reason.includes("blog")) emoji = "📖";
      else if (reason.includes("flashcard")) emoji = "📚";
      else if (reason.includes("login")) emoji = "🌟";

      toast.success(`+${xp} XP ${emoji}`, {
        description: reason,
        duration: 2500,
      });

      dismiss();
    }
    return undefined;
  }, [show, xp, reason, dismiss]);

  // Toast notifications for badge unlocks
  useEffect(() => {
    badges.forEach((badgeId) => {
      if (!displayedBadges.has(badgeId)) {
        const badge = BADGES[badgeId];
        if (badge) {
          toast.success(`🏆 Badge Unlocked!`, {
            description: `${badge.icon} ${badge.name}: ${badge.description}`,
            duration: 3000,
          });

          displayedBadges.add(badgeId);
          setDisplayedBadges(new Set(displayedBadges));

          if (onBadgeUnlocked) {
            onBadgeUnlocked(badgeId);
          }
        }
      }
    });
    return undefined;
  }, [badges, displayedBadges, onBadgeUnlocked]);

  return null; // Sonner handles rendering
};

// Alternative: Standalone notification component (no Sonner dependency)
interface StandaloneXPNotificationProps {
  onBadgeUnlocked?: (badgeId: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export const StandaloneXPNotification = ({
  onBadgeUnlocked,
  position = "top-right",
}: StandaloneXPNotificationProps) => {
  const { show, xp, reason, dismiss } = useXPNotification();
  const { badges: userBadges } = useBadges();
  const [displayedBadges, setDisplayedBadges] = React.useState<Set<string>>(new Set());
  const [notifications, setNotifications] = React.useState<
    Array<{ id: string; type: "xp" | "badge"; xp?: number; reason?: string; badgeId?: string }>
  >([]);

  // Add XP notification
  useEffect(() => {
    if (show && xp > 0) {
      const id = `xp-${Date.now()}`;
      setNotifications((prev) => [
        ...prev,
        { id, type: "xp", xp, reason },
      ]);

      const timer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        dismiss();
      }, 2500);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, xp, reason, dismiss]);

  // Add badge notifications
  useEffect(() => {
    userBadges.forEach((badgeId) => {
      if (!displayedBadges.has(badgeId)) {
        const badge = BADGES[badgeId];
        if (badge) {
          const id = `badge-${badgeId}-${Date.now()}`;
          setNotifications((prev) => [
            ...prev,
            { id, type: "badge", badgeId },
          ]);

          displayedBadges.add(badgeId);
          setDisplayedBadges(new Set(displayedBadges));

          const timer = setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          }, 3000);

          if (onBadgeUnlocked) {
            onBadgeUnlocked(badgeId);
          }
          return () => clearTimeout(timer);
        }
      }
    });
    return undefined;
  }, [userBadges, displayedBadges, onBadgeUnlocked]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 pointer-events-none`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto"
          >
            {notification.type === "xp" ? (
              <XPNotificationCard xp={notification.xp!} reason={notification.reason!} />
            ) : (
              <BadgeNotificationCard badgeId={notification.badgeId!} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

interface XPNotificationCardProps {
  xp: number;
  reason: string;
}

const XPNotificationCard = ({ xp, reason }: XPNotificationCardProps) => {
  // Determine emoji based on reason
  let emoji = "⭐";
  if (reason.includes("quiz")) emoji = "🎯";
  else if (reason.includes("question")) emoji = "🎤";
  else if (reason.includes("simulation")) emoji = "📊";
  else if (reason.includes("blog")) emoji = "📖";
  else if (reason.includes("flashcard")) emoji = "📚";
  else if (reason.includes("login")) emoji = "🌟";

  return (
    <motion.div
      className="bg-gradient-to-r from-saffron to-green text-white px-4 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-xl">{emoji}</span>
      <span>+{xp} XP</span>
      <span className="text-sm opacity-90">{reason}</span>
    </motion.div>
  );
};

interface BadgeNotificationCardProps {
  badgeId: string;
}

const BadgeNotificationCard = ({ badgeId }: BadgeNotificationCardProps) => {
  const badge = BADGES[badgeId];

  if (!badge) return null;

  return (
    <motion.div
      className={`${badge.color} px-4 py-3 rounded-lg shadow-lg border-2 border-yellow-400`}
      whileHover={{ scale: 1.05 }}
    >
      <div className="font-bold text-gray-800 text-center">
        <div className="text-2xl">{badge.icon}</div>
        <div className="text-sm">🏆 Badge Unlocked!</div>
        <div className="text-xs font-semibold mt-1">{badge.name}</div>
        <div className="text-xs opacity-75">{badge.description}</div>
      </div>
    </motion.div>
  );
};

export default XPNotificationToast;

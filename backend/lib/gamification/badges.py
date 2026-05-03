# ============================================================================
# BADGE DEFINITIONS - BACKEND
# ============================================================================

from typing import Dict, List
from enum import Enum


class BadgeRarity(str, Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"


class Badge:
    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        icon: str,
        rarity: BadgeRarity,
        condition: str,
        xp_bonus: int,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.icon = icon
        self.rarity = rarity
        self.condition = condition
        self.xp_bonus = xp_bonus

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "rarity": self.rarity,
            "condition": self.condition,
            "xp_bonus": self.xp_bonus,
        }


# All badges (20 total)
BADGES: Dict[str, Badge] = {
    "first_vote": Badge(
        id="first_vote",
        name="First Voice",
        description="Ask your first question",
        icon="🎤",
        rarity=BadgeRarity.COMMON,
        condition="Ask first question in chat",
        xp_bonus=20,
    ),
    "quiz_master": Badge(
        id="quiz_master",
        name="Quiz Master",
        description="Score 100% on any quiz",
        icon="🎯",
        rarity=BadgeRarity.UNCOMMON,
        condition="Perfect score on quiz",
        xp_bonus=30,
    ),
    "polyglot": Badge(
        id="polyglot",
        name="Polyglot",
        description="Use 3 different languages",
        icon="🌍",
        rarity=BadgeRarity.UNCOMMON,
        condition="Switch to 3 languages",
        xp_bonus=25,
    ),
    "simulation_star": Badge(
        id="simulation_star",
        name="Simulation Star",
        description="Complete polling simulation",
        icon="⭐",
        rarity=BadgeRarity.UNCOMMON,
        condition="Finish polling day simulation",
        xp_bonus=50,
    ),
    "constitution_guru": Badge(
        id="constitution_guru",
        name="Constitution Guru",
        description="Complete constitution quiz perfectly",
        icon="📜",
        rarity=BadgeRarity.RARE,
        condition="100% on constitution quiz",
        xp_bonus=40,
    ),
    "news_hawk": Badge(
        id="news_hawk",
        name="News Hawk",
        description="Read 5 news articles",
        icon="🦅",
        rarity=BadgeRarity.COMMON,
        condition="Read 5 ECI news items",
        xp_bonus=15,
    ),
    "form_expert": Badge(
        id="form_expert",
        name="Form Expert",
        description="View 5 different election forms",
        icon="📋",
        rarity=BadgeRarity.COMMON,
        condition="Access 5 different forms",
        xp_bonus=15,
    ),
    "flashcard_enthusiast": Badge(
        id="flashcard_enthusiast",
        name="Flashcard Enthusiast",
        description="Complete 10 flashcard sets",
        icon="📚",
        rarity=BadgeRarity.UNCOMMON,
        condition="Complete 10 flashcard sessions",
        xp_bonus=20,
    ),
    "blog_reader": Badge(
        id="blog_reader",
        name="Blog Reader",
        description="Read all 10 blog articles",
        icon="📖",
        rarity=BadgeRarity.RARE,
        condition="Read all educational blogs",
        xp_bonus=35,
    ),
    "streak_7": Badge(
        id="streak_7",
        name="On Fire",
        description="7-day login streak",
        icon="🔥",
        rarity=BadgeRarity.UNCOMMON,
        condition="Login 7 days straight",
        xp_bonus=25,
    ),
    "streak_30": Badge(
        id="streak_30",
        name="Unstoppable",
        description="30-day login streak",
        icon="💪",
        rarity=BadgeRarity.RARE,
        condition="Login 30 days straight",
        xp_bonus=100,
    ),
    "daily_voter": Badge(
        id="daily_voter",
        name="Daily Voter",
        description="Login for 100 days",
        icon="📅",
        rarity=BadgeRarity.EPIC,
        condition="Login 100 times",
        xp_bonus=150,
    ),
    "social_voter": Badge(
        id="social_voter",
        name="Social Voter",
        description="Share a result with others",
        icon="🤝",
        rarity=BadgeRarity.UNCOMMON,
        condition="Share quiz/simulation result",
        xp_bonus=20,
    ),
    "influencer": Badge(
        id="influencer",
        name="Influencer",
        description="Share 5 times",
        icon="📢",
        rarity=BadgeRarity.RARE,
        condition="Share 5 results",
        xp_bonus=50,
    ),
    "early_bird": Badge(
        id="early_bird",
        name="Early Bird",
        description="Login before 8 AM",
        icon="🌅",
        rarity=BadgeRarity.COMMON,
        condition="Login before 8:00 AM",
        xp_bonus=10,
    ),
    "night_owl": Badge(
        id="night_owl",
        name="Night Owl",
        description="Login after 10 PM",
        icon="🦉",
        rarity=BadgeRarity.COMMON,
        condition="Login after 10:00 PM",
        xp_bonus=10,
    ),
    "knowledge_seeker": Badge(
        id="knowledge_seeker",
        name="Knowledge Seeker",
        description="Earn 1000 XP",
        icon="🧠",
        rarity=BadgeRarity.RARE,
        condition="Accumulate 1000 XP",
        xp_bonus=50,
    ),
    "democracy_champion": Badge(
        id="democracy_champion",
        name="Democracy Champion",
        description="Reach Level 8",
        icon="🏆",
        rarity=BadgeRarity.EPIC,
        condition="Achieve Level 8",
        xp_bonus=200,
    ),
    "civic_legend": Badge(
        id="civic_legend",
        name="Civic Legend",
        description="Reach Level 10",
        icon="👑",
        rarity=BadgeRarity.LEGENDARY,
        condition="Achieve maximum Level 10",
        xp_bonus=500,
    ),
    "perfect_student": Badge(
        id="perfect_student",
        name="Perfect Student",
        description="Score 100% on 5 quizzes",
        icon="💯",
        rarity=BadgeRarity.EPIC,
        condition="Perfect score on 5 quizzes",
        xp_bonus=75,
    ),
}


def get_badge_by_id(badge_id: str) -> Badge | None:
    """Get badge by ID."""
    return BADGES.get(badge_id)


def get_all_badges() -> Dict[str, Badge]:
    """Get all badges."""
    return BADGES


def get_badges_by_rarity(rarity: BadgeRarity) -> List[Badge]:
    """Get badges filtered by rarity."""
    return [b for b in BADGES.values() if b.rarity == rarity]

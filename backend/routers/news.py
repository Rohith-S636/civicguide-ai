from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
from functools import lru_cache
import asyncio

# Import Tavily for news
try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

# Import Claude for summarization
from backend.utils.claude import anthropic_chat

router = APIRouter()

# Cache for news (simple dict-based with timestamp)
NEWS_CACHE: Dict[str, Any] = {
    "data": [],
    "timestamp": None,
    "ttl_seconds": 3600  # 1 hour cache
}

# ============================================================================
# UPCOMING ELECTIONS DATA - 2025 & 2026
# ============================================================================

UPCOMING_ELECTIONS: List[Dict[str, Any]] = [
    {
        "id": "bihar_2025",
        "state": "Bihar",
        "election_type": "Assembly Election",
        "region": "State Assembly (243 seats)",
        "notification_date": "2025-01-10",
        "last_date_nomination": "2025-01-24",
        "last_date_withdrawal": "2025-01-31",
        "poll_date": "2025-02-05",
        "phase_count": 1,
        "phases": [
            {"phase": 1, "date": "2025-02-05", "constituencies": "All 243"}
        ],
        "result_date": "2025-02-08",
        "total_voters": 7100000,
        "registration_deadline": "2025-01-20",
        "booth_count": 10150,
        "vvpat_count": 9680,
        "election_commission_notification": "https://eci.gov.in/bihar-2025"
    },
    {
        "id": "westbengal_local_2025",
        "state": "West Bengal",
        "election_type": "Local Body Election",
        "region": "Municipal Corporations & Municipalities",
        "notification_date": "2025-02-15",
        "last_date_nomination": "2025-03-01",
        "last_date_withdrawal": "2025-03-08",
        "poll_date": "2025-03-16",
        "phase_count": 1,
        "phases": [
            {"phase": 1, "date": "2025-03-16", "constituencies": "All local bodies"}
        ],
        "result_date": "2025-03-19",
        "total_voters": 6500000,
        "registration_deadline": "2025-02-28",
        "booth_count": 9200,
        "vvpat_count": 8800,
        "election_commission_notification": "https://eci.gov.in/westbengal-local-2025"
    },
    {
        "id": "delhi_mcd_2025",
        "state": "Delhi",
        "election_type": "Municipal Corporation (MCD) Election",
        "region": "Delhi Municipal Corporation (250 wards)",
        "notification_date": "2025-03-01",
        "last_date_nomination": "2025-03-15",
        "last_date_withdrawal": "2025-03-22",
        "poll_date": "2025-04-05",
        "phase_count": 1,
        "phases": [
            {"phase": 1, "date": "2025-04-05", "constituencies": "All 250 wards"}
        ],
        "result_date": "2025-04-08",
        "total_voters": 4800000,
        "registration_deadline": "2025-03-10",
        "booth_count": 5200,
        "vvpat_count": 4950,
        "election_commission_notification": "https://eci.gov.in/delhi-mcd-2025"
    },
    {
        "id": "bihar_bypolls_2025",
        "state": "Bihar",
        "election_type": "By-poll Election",
        "region": "Various constituencies",
        "notification_date": "2025-05-10",
        "last_date_nomination": "2025-05-24",
        "last_date_withdrawal": "2025-05-31",
        "poll_date": "2025-06-14",
        "phase_count": 1,
        "phases": [
            {"phase": 1, "date": "2025-06-14", "constituencies": "3 vacant seats"}
        ],
        "result_date": "2025-06-17",
        "total_voters": 850000,
        "registration_deadline": "2025-05-20",
        "booth_count": 520,
        "vvpat_count": 495,
        "election_commission_notification": "https://eci.gov.in/bihar-bypolls-2025"
    }
]

# ============================================================================
# BLOG ARTICLES (Hardcoded)
# ============================================================================

BLOG_ARTICLES: List[Dict[str, Any]] = [
    {
        "id": "blog_001",
        "title": "Why Your Vote Matters: The Power of Every Single Vote",
        "author": "Priya Sharma",
        "date": "2025-01-20",
        "read_time": "5 min",
        "category": "Civic Participation",
        "tags": ["voting", "democracy", "rights"],
        "content": """
        Democracy thrives on participation, and every vote counts more than you might think. In a world where policies affect millions of lives, casting your vote is not just a right—it's a responsibility that shapes the future of our nation.

        Consider this: Throughout Indian history, many elections have been decided by razor-thin margins. A single vote can swing a constituency, and constituencies collectively determine governments. When you choose not to vote, you're essentially letting others make decisions that will directly impact your life, your family, and your community.

        Your vote represents your voice in governance. It's the most direct way to communicate your values and priorities to elected representatives. Whether it's education, healthcare, infrastructure, or environmental protection, your ballot choice influences which policies get implemented and which leaders take office.

        Beyond the individual level, voting strengthens democracy itself. High voter participation legitimizes electoral processes and government mandates. When more people vote, election results are more representative of the people's true preferences, not just those of a vocal minority.

        Historically, marginalized communities have fought hard for voting rights. Many people suffered, sacrificed, and even died to secure universal adult suffrage. By voting, you honor their legacy and ensure that democracy continues to function as intended.

        Don't underestimate your power. Your vote is your voice. Use it wisely, responsibly, and with the knowledge that you're contributing to the democratic process that guides our nation.
        """,
        "featured_image": "https://example.com/vote-matters.jpg"
    },
    {
        "id": "blog_002",
        "title": "A Brief History of the Election Commission of India",
        "author": "Rajesh Kumar",
        "date": "2025-01-18",
        "read_time": "7 min",
        "category": "Election History",
        "tags": ["ECI", "history", "independence"],
        "content": """
        The Election Commission of India (ECI) stands as one of the world's most sophisticated electoral bodies, tasked with conducting free and fair elections for over 1.4 billion citizens. Its journey from independence to the present reflects India's commitment to democratic values.

        Established on January 25, 1950, the ECI was born at the very inception of independent India's Constitution. Dr. Rajendra Prasad, the nation's first President, appointed Sukumar Sen as the first Chief Election Commissioner, setting the stage for what would become the world's largest democratic exercise.

        In the early years, the ECI faced unprecedented challenges. Post-independence India had high illiteracy rates, a vast and diverse population, and limited resources. Yet, the First General Election (1951-1952) was a monumental success, establishing a precedent that Indian democracy would prioritize universal adult suffrage despite economic constraints.

        The ECI evolved continuously. The introduction of electronic voting machines (EVMs) in the 1990s revolutionized elections by reducing time and increasing accuracy. The VVPAT (Voter Verifiable Paper Audit Trail) system added another layer of transparency in 2013, making EVMs one of the most auditable voting systems globally.

        Today, the ECI manages elections with unprecedented scale and sophistication. Its role extends beyond merely conducting elections. It educates citizens about voting rights and responsibilities through comprehensive programs.
        """,
        "featured_image": "https://example.com/eci-history.jpg"
    },
    {
        "id": "blog_003",
        "title": "How Electronic Voting Machines (EVMs) Work: A Technical Guide",
        "author": "Dr. Arun Singh",
        "date": "2025-01-15",
        "read_time": "8 min",
        "category": "Election Technology",
        "tags": ["EVM", "technology", "voting"],
        "content": """
        Electronic Voting Machines (EVMs) have transformed Indian elections, making voting faster, more accurate, and more secure. But how exactly do these machines work?

        An EVM consists of two main units: the Ballot Unit and the Control Unit. The Ballot Unit is what voters interact with—a panel displaying candidate names with corresponding buttons. The Control Unit, operated by polling officials, regulates the voting process and is secured with tamper-evident seals and locks.

        When an election officer switches on the EVM using a unique key, it gets initialized for that polling station. Voters then enter one by one. A voter presses the button next to their chosen candidate on the Ballot Unit. This action registers one vote for that candidate in the machine's memory. The system prevents overvoting—a voter cannot register more votes than the number of candidates available.

        The genius of EVMs lies in their security architecture. Each vote is encrypted and stored in isolated machine memory. The machines cannot be connected to the internet, making hacking virtually impossible. The firmware is standardized and verified by the ECI and certified by official testing centers.

        To ensure transparency, the ECI mandated the Voter Verifiable Paper Audit Trail (VVPAT) system in 2013. With VVPAT, each vote prints a paper slip that matches the electronic record. Voters can see this slip without removing it from the machine, verifying their vote was recorded correctly.

        Understanding how EVMs work helps voters trust the electoral process and participate with confidence in Indian democracy.
        """,
        "featured_image": "https://example.com/evm-technology.jpg"
    },
    {
        "id": "blog_004",
        "title": "Women Voters in India: Breaking Barriers and Shaping Democracy",
        "author": "Anjali Verma",
        "date": "2025-01-12",
        "read_time": "6 min",
        "category": "Social Issues",
        "tags": ["women", "voting", "equality"],
        "content": """
        Women's participation in Indian elections has grown exponentially since independence. Today, women form a significant portion of the electorate, but their journey to equal voting rights was neither simple nor straightforward.

        In independent India, women received voting rights immediately, a progressive step for a newly formed nation in 1950. However, social barriers often prevented women from exercising this right. In many communities, patriarchal norms restricted women's mobility and autonomy, making it difficult for them to access polling stations.

        Over decades, sustained efforts by women's rights organizations and civic bodies have transformed this landscape. Today, in many states, women's voter turnout matches or exceeds men's. This shift reflects changing social attitudes, increased female literacy, and proactive measures by the Election Commission.

        The ECI has taken numerous steps to encourage women's participation. Separate queues for women in polling stations have reduced harassment. In some areas, all-women polling stations have been established, staffed entirely by women officials and security personnel, creating safe spaces for voting.

        Women don't just vote; they increasingly contest elections. The number of female candidates has grown significantly across General Elections, State Elections, and Local Body Elections. Reserved seats in local government bodies have ensured that women have significant representation at the grassroots level.

        The story of women voters in India is a testament to democratic progress. As more women participate, democracy becomes richer and more representative of all communities.
        """,
        "featured_image": "https://example.com/women-voters.jpg"
    },
    {
        "id": "blog_005",
        "title": "Youth Participation in Elections: Why Young Voters Matter",
        "author": "Karan Patel",
        "date": "2025-01-10",
        "read_time": "6 min",
        "category": "Civic Participation",
        "tags": ["youth", "voters", "democracy"],
        "content": """
        Young voters represent the future of Indian democracy, yet their participation in elections has historically been lower than other age groups. Understanding why youth engagement matters is crucial for a vibrant democracy.

        Young voters (18-35 years) constitute a significant portion of India's electorate. Their decisions today will shape policies that affect their lives for decades. From education to employment, climate change to social freedoms, elections determine how young people's futures unfold.

        However, youth voter turnout has traditionally been lower than that of middle-aged and older voters. Reasons include a sense of disengagement from politics, lack of awareness about candidates' positions, and logistical challenges related to studying or working away from their voting constituencies.

        The narrative is changing. Recent elections have seen increased youth participation, driven by social media activism, civic awareness campaigns, and young people's recognition that their votes can create change. The #VoteForChange movements have made voting a visible civic responsibility.

        The ECI has recognized the importance of youth engagement through targeted awareness campaigns. Celebrity endorsements, social media campaigns, and campus programs have made elections more relevant to youth. Youth voters are proving to be different from their predecessors, basing voting decisions on specific policies rather than party loyalty.

        The future of Indian democracy depends on young voters. When youth participate, democracy adapts to address their concerns. That's why youth participation matters—not just for young people, but for everyone.
        """,
        "featured_image": "https://example.com/youth-voters.jpg"
    },
    {
        "id": "blog_006",
        "title": "Understanding the Model Code of Conduct: Fair Play in Elections",
        "author": "Dr. Suresh Malhotra",
        "date": "2025-01-08",
        "read_time": "7 min",
        "category": "Election Rules",
        "tags": ["MCC", "fair-play", "rules"],
        "content": """
        Every election in India is governed by the Model Code of Conduct (MCC), a set of guidelines that ensures free and fair elections. Understanding the MCC is essential for voters who want to recognize when political actors are playing by the rules.

        The Model Code of Conduct was first formulated in 1960 and has evolved significantly over the decades. It's not a legal code with criminal penalties but rather an agreement that all political parties voluntarily accept to follow. In practice, the Election Commission has significant powers to enforce compliance.

        The MCC covers multiple aspects of election conduct. First, it prohibits the misuse of government machinery during elections. Ministers and officials cannot use their positions to campaign or influence voters. Government resources cannot be used for partisan purposes. This levels the playing field between ruling parties and opposition.

        Second, the MCC restricts campaign activities. Parties cannot hold rallies in sensitive areas and must respect cultural sensitivities. There are restrictions on using caste, community, or religion to divide voters. Provocative speeches that could inflame tensions are forbidden.

        Third, the MCC regulates campaign finance. Parties must declare funding sources and adhere to spending limits to prevent wealthy parties from gaining unfair advantages. Fourth, the MCC ensures fair media coverage, mandating equal airtime and fair print media coverage.

        Fifth, the MCC protects polling booths. No campaigning is permitted within 100 meters of a polling station on polling day. This ensures voters can vote without external pressure or coercion.

        Despite challenges, the Model Code of Conduct remains crucial for maintaining electoral integrity. It sets expectations for ethical political behavior and provides mechanisms to address violations.
        """,
        "featured_image": "https://example.com/mcc-explained.jpg"
    },
    {
        "id": "blog_007",
        "title": "NOTA Explained: What Happens When You Choose 'None of the Above'",
        "author": "Priya Deshmukh",
        "date": "2025-01-05",
        "read_time": "5 min",
        "category": "Election Rules",
        "tags": ["NOTA", "voting-rights"],
        "content": """
        In 1950, Indian voters had limited choices at the ballot box. You could either vote for a candidate or not vote at all. Today, thanks to a Supreme Court ruling, voters have a third option: NOTA (None of the Above).

        NOTA was introduced in Indian elections in 2013, following a Supreme Court judgment recognizing that voters should have the freedom to express their rejection of all candidates. NOTA provided this mechanism, allowing voters to register their dissatisfaction formally.

        When voters choose NOTA, they are making a statement: "I am exercising my right to vote, but I reject all candidates presented before me." This is different from not voting. A person who doesn't vote simply doesn't go to the polling station. A person who votes NOTA goes to the booth and deliberately selects "None of the Above."

        On the EVM, NOTA typically appears as a separate option. Voters who wish to press NOTA do so just like they would press a candidate's button. Their vote is recorded as NOTA, and the machine tallies it separately.

        Currently, NOTA votes are counted and displayed but don't directly affect the election result. The candidate with the most votes wins, regardless of NOTA votes. However, a high NOTA vote count signals voter dissatisfaction, influencing how parties approach future elections and candidate selection.

        NOTA has become increasingly significant, with some constituencies seeing NOTA vote counts exceeding 1-2% of total votes. There have been calls to make NOTA more consequential, though India doesn't currently have rules where NOTA winning triggers fresh elections.

        For voters evaluating their options, NOTA represents an important choice. If you've assessed all candidates and genuinely believe none deserve your vote, NOTA allows you to register that opinion while participating in democracy.
        """,
        "featured_image": "https://example.com/nota-explained.jpg"
    },
    {
        "id": "blog_008",
        "title": "How to Register as a Voter: A Step-by-Step Guide for New Voters",
        "author": "Neha Gupta",
        "date": "2025-01-02",
        "read_time": "5 min",
        "category": "How-To Guide",
        "tags": ["registration", "first-time-voter"],
        "content": """
        Turning 18 is exciting. You can legally drive, work independently, and vote. If you're a new voter wondering how to register, this guide walks you through the process step by step.

        Voter registration in India is relatively straightforward. The Election Commission aims to make it accessible to all eligible citizens aged 18 and above.

        Step 1: Determine your eligibility. You must be an Indian citizen, at least 18 years old, and not disqualified from voting.

        Step 2: Identify your constituency. Visit the ECI website to find which constituency covers your area and who your Booth Level Officer (BLO) is.

        Step 3: Collect Form 6. Download it from NVSP.IN or collect from your BLO. This is the application for voter registration.

        Step 4: Gather documents. You'll need to prove age, citizenship, and residence. Acceptable documents include Aadhaar, school certificate, birth certificate, passport, utility bills, or bank statements.

        Step 5: Fill the form accurately. Ensure all details match your supporting documents, especially spelling and date of birth.

        Step 6: Paste photographs. If submitting offline, paste two passport-size photos. Online submission requires scanned photos.

        Step 7: Submit the form. You can submit online via NVSP.IN or offline to your BLO. Online submission is faster and convenient.

        Step 8: Wait for verification. The BLO will verify your documents within days.

        Step 9: Check the draft roll. The draft electoral roll is published for 21 days, allowing anyone to raise objections.

        Step 10: Get added to the final roll. After the objection period, your name is added to the final electoral roll.

        Congratulations on becoming a registered voter! Your participation in democracy begins with this registration process.
        """,
        "featured_image": "https://example.com/voter-registration.jpg"
    },
    {
        "id": "blog_009",
        "title": "Election Observers: Ensuring Fair Elections Through Neutral Oversight",
        "author": "Dr. Vikram Singh",
        "date": "2024-12-28",
        "read_time": "6 min",
        "category": "Election Integrity",
        "tags": ["observers", "transparency", "fairness"],
        "content": """
        Have you ever wondered who ensures that elections are conducted fairly? Enter election observers—neutral officials who monitor polling booths to guarantee that elections are free and fair.

        Election observers are appointed by the Election Commission to oversee various aspects of elections. They come from different backgrounds: retired officials, civil society members, academics. The key requirement is that they are neutral and have no political affiliations.

        Observers are posted at polling booths on election day to ensure voting procedures are followed correctly. They monitor that only eligible voters vote, that each voter votes only once, that ballot secrecy is maintained, and that no coercion or intimidation occurs.

        Beyond polling day, observers are also posted at counting centers. They verify that votes are counted accurately, that counting processes are transparent, and that results are properly recorded.

        There are different categories of observers. General Observers monitor overall processes. Sector Officers oversee larger areas. Expenditure Observers track candidate spending. Video Officers document the process for accountability.

        Observer reports are crucial for the Election Commission. If an observer reports irregularities, the commission can investigate and take action. Systematic issues can influence election administration for future elections.

        International observers sometimes monitor General Elections, adding credibility to the process. Their findings influence international perception of Indian elections.

        Modern technology has enhanced observer effectiveness. EVM machines with VVPAT systems allow observers to verify votes through both electronic and paper records. CCTV cameras provide additional documentation.

        The observer system represents an important mechanism in India's commitment to fair elections. Through trained, neutral observers, the Election Commission provides assurance that elections are conducted according to rules and voters' will is accurately reflected in results.
        """,
        "featured_image": "https://example.com/election-observers.jpg"
    },
    {
        "id": "blog_010",
        "title": "Accessible Voting: Ensuring Every Citizen Can Vote Regardless of Disability",
        "author": "Dr. Anjali Kumar",
        "date": "2024-12-25",
        "read_time": "5 min",
        "category": "Social Issues",
        "tags": ["accessibility", "disability", "inclusive-voting"],
        "content": """
        Every citizen has the right to vote, regardless of their physical or mental capabilities. Yet for persons with disabilities, voting has historically presented barriers. India's Election Commission has made significant strides in removing these barriers.

        The first step in accessible voting is ensuring that persons with disabilities can register as voters. Many disabilities don't prevent someone from forming independent judgment about candidates; they may just require accommodations during voting. The ECI has simplified registration, reducing documentation requirements.

        On polling day, accessibility features are essential. Polling booths are increasingly wheelchair-accessible with ramps and accessible entrances. For visually impaired voters, audio information about candidates is provided. EVMs can be operated with audio guidance, allowing blind voters to vote independently.

        For voters with mobility issues, the ECI allows postal ballots. Voters who cannot access polling booths can apply to vote from home. Election officials deliver ballot papers to the voter's residence.

        Hearing-impaired voters have benefited from sign language interpreters and visual information during elections. Polling station staff receive training on accommodations for voters with various disabilities.

        Overcoming challenges requires sustained effort. The Election Commission continues to roll out accessibility guidelines. NGOs build awareness among disabled voters. Polling station design is improving.

        As accessibility improves, more voters with disabilities will exercise their democratic rights, enriching India's democracy with diverse perspectives. Your participation in democracy is not just legally protected; it's essential for democracy to work fairly for everyone.
        """,
        "featured_image": "https://example.com/accessible-voting.jpg"
    }
]

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def fetch_and_summarize_eci_news() -> List[Dict[str, Any]]:
    """
    Fetch ECI news from Tavily API and summarize using Claude.
    Results are cached for 1 hour.
    """
    # Check cache
    current_time = datetime.now()
    if (NEWS_CACHE["timestamp"] and 
        (current_time - NEWS_CACHE["timestamp"]).total_seconds() < NEWS_CACHE["ttl_seconds"]):
        return NEWS_CACHE["data"]
    
    news_items = []
    
    # Fallback to mock news if Tavily not available
    if not TavilyClient or not os.getenv("TAVILY_API_KEY"):
        # Return mock news with categorization
        news_items = [
            {
                "id": "news_001",
                "title": "Election Commission Announces 2025 Electoral Schedule",
                "source": "Press Release",
                "date": (datetime.now() - timedelta(days=1)).isoformat(),
                "category": "Schedule",
                "summary": "The Election Commission of India has announced the electoral schedule for 2025, including dates for multiple state elections.",
                "url": "https://eci.gov.in/news",
                "impact": "high"
            },
            {
                "id": "news_002",
                "title": "New ECI Guidelines for Digital Campaign Finance Tracking",
                "source": "Press Release",
                "date": (datetime.now() - timedelta(days=2)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission has issued new guidelines requiring political parties to declare digital campaign expenditures.",
                "url": "https://eci.gov.in/news",
                "impact": "medium"
            },
            {
                "id": "news_003",
                "title": "ECI Launches SVEEP Initiative for Youth Voter Registration",
                "source": "News",
                "date": (datetime.now() - timedelta(days=3)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission's SVEEP program launches a targeted campaign to increase youth voter registration.",
                "url": "https://eci.gov.in/news",
                "impact": "medium"
            },
            {
                "id": "news_004",
                "title": "VVPAT Verification Rate Increased to 5% of Booths",
                "source": "Press Release",
                "date": (datetime.now() - timedelta(days=4)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission has increased the mandatory VVPAT verification rate from 1% to 5% of polling booths.",
                "url": "https://eci.gov.in/news",
                "impact": "high"
            },
            {
                "id": "news_005",
                "title": "Election Observer Recruitment Begins for 2025 Elections",
                "source": "News",
                "date": (datetime.now() - timedelta(days=5)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission begins recruitment of neutral election observers for the 2025 electoral cycle.",
                "url": "https://eci.gov.in/news",
                "impact": "low"
            },
            {
                "id": "news_006",
                "title": "Bihar Election Notification Released",
                "source": "Press Release",
                "date": (datetime.now() - timedelta(days=6)).isoformat(),
                "category": "Announcement",
                "summary": "The official notification for Bihar Assembly elections has been released with important dates.",
                "url": "https://eci.gov.in/news",
                "impact": "high"
            },
            {
                "id": "news_007",
                "title": "Women Polling Officers Recruitment at Record High",
                "source": "News",
                "date": (datetime.now() - timedelta(days=7)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission reports record recruitment of women polling officers for 2025 elections.",
                "url": "https://eci.gov.in/news",
                "impact": "medium"
            },
            {
                "id": "news_008",
                "title": "New Accessibility Features Introduced at Polling Stations",
                "source": "Press Release",
                "date": (datetime.now() - timedelta(days=8)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission introduces enhanced accessibility features for voters with disabilities.",
                "url": "https://eci.gov.in/news",
                "impact": "high"
            },
            {
                "id": "news_009",
                "title": "West Bengal Municipal Election Schedule Confirmed",
                "source": "News",
                "date": (datetime.now() - timedelta(days=9)).isoformat(),
                "category": "Schedule",
                "summary": "The Election Commission has confirmed the schedule for West Bengal municipal elections.",
                "url": "https://eci.gov.in/news",
                "impact": "medium"
            },
            {
                "id": "news_010",
                "title": "ECI Issues Model Code of Conduct for 2025 Elections",
                "source": "Press Release",
                "date": (datetime.now() - timedelta(days=10)).isoformat(),
                "category": "Announcement",
                "summary": "The Election Commission has issued the Model Code of Conduct for the 2025 electoral cycle.",
                "url": "https://eci.gov.in/news",
                "impact": "high"
            }
        ]
    else:
        try:
            # Try to fetch using Tavily
            client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
            
            search_queries = [
                "Election Commission India announcement 2025",
                "ECI press release election schedule",
                "Indian election news 2025"
            ]
            
            fetched_articles = []
            for query in search_queries:
                response = client.search(query, max_results=3, include_answer=True)
                if "results" in response:
                    for article in response["results"]:
                        # Summarize using Claude
                        try:
                            summary = await anthropic_chat(
                                message=f"Summarize this election news in 2-3 sentences: {article.get('content', article.get('title', ''))}",
                                history=[],
                                language="en"
                            )
                        except:
                            summary = article.get("content", "")[:150]
                        
                        # Categorize
                        title_lower = article.get("title", "").lower()
                        if any(word in title_lower for word in ["schedule", "date", "polling", "notification"]):
                            category = "Schedule"
                        elif any(word in title_lower for word in ["announce", "release", "guideline", "appointment"]):
                            category = "Announcement"
                        elif any(word in title_lower for word in ["result", "count"]):
                            category = "Result"
                        elif any(word in title_lower for word in ["officer", "appointment", "recruitment"]):
                            category = "Appointment"
                        elif any(word in title_lower for word in ["training", "workshop"]):
                            category = "Training"
                        else:
                            category = "News"
                        
                        fetched_articles.append({
                            "id": f"news_{len(fetched_articles)+1}",
                            "title": article.get("title", ""),
                            "source": article.get("source", "ECI News"),
                            "date": datetime.now().isoformat(),
                            "category": category,
                            "summary": summary,
                            "url": article.get("url", "https://eci.gov.in"),
                            "impact": "high" if category in ["Schedule", "Announcement"] else "medium"
                        })
            
            news_items = fetched_articles[:10]  # Return top 10
        except Exception as e:
            # Fallback to mock news
            news_items = []
    
    # Update cache
    NEWS_CACHE["data"] = news_items
    NEWS_CACHE["timestamp"] = datetime.now()
    
    return news_items


def generate_notifications() -> List[Dict[str, Any]]:
    """
    Generate dynamic countdown notifications for upcoming elections.
    """
    notifications = []
    current_date = datetime.now()
    
    for election in UPCOMING_ELECTIONS:
        poll_date = datetime.strptime(election["poll_date"], "%Y-%m-%d")
        days_until = (poll_date - current_date).days
        
        if days_until >= 0:
            # Calculate priority based on days remaining
            if days_until <= 7:
                priority = "high"
            elif days_until <= 30:
                priority = "medium"
            else:
                priority = "low"
            
            # Generate notification
            reg_deadline = election.get("registration_deadline", election["last_date_nomination"])
            reg_date_obj = datetime.strptime(reg_deadline, "%Y-%m-%d")
            days_to_register = (reg_date_obj - current_date).days
            
            notification = {
                "id": f"notif_{election['id']}",
                "election_id": election["id"],
                "state": election["state"],
                "election_type": election["election_type"],
                "title": f"{election['state']} {election['election_type']} in {days_until} days" if days_until > 0 else f"{election['state']} {election['election_type']} today!",
                "message": f"Elections in {election['state']} on {poll_date.strftime('%B %d, %Y')}. Register to vote by {reg_date_obj.strftime('%B %d')}.",
                "priority": priority,
                "days_until_election": days_until,
                "registration_deadline": reg_deadline,
                "days_to_register": max(0, days_to_register),
                "action": "Register Now" if days_to_register > 0 else "Check Your Registration",
                "action_url": "https://nvsp.in"
            }
            notifications.append(notification)
    
    # Sort by priority and days until
    priority_order = {"high": 0, "medium": 1, "low": 2}
    notifications.sort(
        key=lambda x: (priority_order[x["priority"]], x["days_until_election"])
    )
    
    return notifications


# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[Dict[str, Any]])
async def get_latest_news(limit: int = Query(10, ge=1, le=50)) -> List[Dict[str, Any]]:
    """
    Get latest ECI news items. Results cached for 1 hour.
    """
    try:
        news = await fetch_and_summarize_eci_news()
        return news[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")


@router.get("/announcements", response_model=List[Dict[str, Any]])
async def get_announcements(limit: int = Query(10, ge=1, le=50)) -> List[Dict[str, Any]]:
    """
    Get official ECI announcements only.
    """
    try:
        news = await fetch_and_summarize_eci_news()
        announcements = [n for n in news if n["category"] in ["Announcement", "Schedule"]]
        return announcements[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching announcements: {str(e)}")


@router.get("/by-category/{category}", response_model=List[Dict[str, Any]])
async def get_news_by_category(
    category: str = Query(..., description="News category"),
    limit: int = Query(10, ge=1, le=50)
) -> List[Dict[str, Any]]:
    """
    Get news by category (Announcement, Schedule, Result, Appointment, Training).
    """
    valid_categories = ["Announcement", "Schedule", "Result", "Appointment", "Training"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Valid: {', '.join(valid_categories)}"
        )
    
    try:
        news = await fetch_and_summarize_eci_news()
        filtered = [n for n in news if n["category"] == category]
        return filtered[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")


@router.get("/notifications", response_model=List[Dict[str, Any]])
async def get_notifications(priority: Optional[str] = Query(None)) -> List[Dict[str, Any]]:
    """
    Get election countdown notifications with priority levels (high/medium/low).
    """
    try:
        notifications = generate_notifications()
        
        if priority:
            valid_priorities = ["high", "medium", "low"]
            if priority.lower() not in valid_priorities:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid priority. Valid: {', '.join(valid_priorities)}"
                )
            notifications = [n for n in notifications if n["priority"] == priority.lower()]
        
        return notifications
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating notifications: {str(e)}")


@router.get("/elections/upcoming", response_model=Dict[str, Any])
async def get_upcoming_elections(
    state: Optional[str] = Query(None, description="Filter by state")
) -> Dict[str, Any]:
    """
    Get upcoming elections with countdown and details.
    """
    try:
        elections = UPCOMING_ELECTIONS.copy()
        
        if state:
            elections = [e for e in elections if e["state"].lower() == state.lower()]
            if not elections:
                raise HTTPException(status_code=404, detail=f"No elections found for {state}")
        
        # Add countdown information
        for election in elections:
            poll_date = datetime.strptime(election["poll_date"], "%Y-%m-%d")
            current_date = datetime.now()
            days_until = (poll_date - current_date).days
            
            election["countdown"] = {
                "days_until_poll": days_until,
                "status": "Completed" if days_until < 0 else "Upcoming" if days_until > 0 else "Today",
                "poll_date_formatted": poll_date.strftime("%B %d, %Y"),
                "notification_date_formatted": datetime.strptime(election["notification_date"], "%Y-%m-%d").strftime("%B %d, %Y"),
                "result_date_formatted": datetime.strptime(election["result_date"], "%Y-%m-%d").strftime("%B %d, %Y")
            }
        
        return {
            "total_elections": len(elections),
            "elections": elections
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching elections: {str(e)}")


@router.get("/blogs", response_model=Dict[str, Any])
async def get_blogs(
    category: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50)
) -> Dict[str, Any]:
    """
    Get educational blog articles about elections and voting.
    """
    blogs = BLOG_ARTICLES.copy()
    
    if category:
        blogs = [b for b in blogs if b["category"].lower() == category.lower()]
    
    return {
        "total_blogs": len(blogs),
        "blogs": blogs[:limit]
    }


@router.get("/blogs/{blog_id}", response_model=Dict[str, Any])
async def get_blog_detail(blog_id: str) -> Dict[str, Any]:
    """
    Get full blog article by ID.
    """
    blog = next((b for b in BLOG_ARTICLES if b["id"] == blog_id), None)
    if not blog:
        raise HTTPException(status_code=404, detail=f"Blog {blog_id} not found")
    
    return blog


@router.get("/blog-categories", response_model=Dict[str, Any])
async def get_blog_categories() -> Dict[str, Any]:
    """
    Get all available blog categories with article counts.
    """
    categories = {}
    for blog in BLOG_ARTICLES:
        category = blog["category"]
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    return {
        "total_categories": len(categories),
        "categories": categories
    }


@router.get("/elections/{election_id}", response_model=Dict[str, Any])
async def get_election_details(election_id: str) -> Dict[str, Any]:
    """
    Get complete details of a specific election.
    """
    election = next((e for e in UPCOMING_ELECTIONS if e["id"] == election_id), None)
    if not election:
        raise HTTPException(status_code=404, detail=f"Election {election_id} not found")
    
    # Add countdown
    poll_date = datetime.strptime(election["poll_date"], "%Y-%m-%d")
    current_date = datetime.now()
    days_until = (poll_date - current_date).days
    
    election["countdown"] = {
        "days_until_poll": days_until,
        "status": "Completed" if days_until < 0 else "Upcoming" if days_until > 0 else "Today",
        "poll_date_formatted": poll_date.strftime("%B %d, %Y")
    }
    
    return election


@router.get("/news-summary", response_model=Dict[str, Any])
async def get_news_summary() -> Dict[str, Any]:
    """
    Get summary of all news categories and notification status.
    """
    try:
        news = await fetch_and_summarize_eci_news()
        notifications = generate_notifications()
        
        # Count by category
        category_counts = {}
        for item in news:
            category = item["category"]
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Count notifications by priority
        priority_counts = {}
        for notif in notifications:
            priority = notif["priority"]
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
        
        return {
            "last_updated": NEWS_CACHE["timestamp"].isoformat() if NEWS_CACHE["timestamp"] else "Never",
            "total_news_items": len(news),
            "news_by_category": category_counts,
            "total_notifications": len(notifications),
            "notifications_by_priority": priority_counts,
            "total_upcoming_elections": len(UPCOMING_ELECTIONS),
            "total_blog_articles": len(BLOG_ARTICLES)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

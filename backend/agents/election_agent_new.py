"""
Election Agent: ReAct Agent for Indian Election Q&A using LangChain + Gemini.

Features:
  - LangChain ReAct pattern for reasoning
  - 6 specialized tools for election queries
  - Memory of tools and responses
  - XP earning for gamification
  - Multi-language support
"""

import os
import logging
from typing import Optional, Tuple, List, Dict
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory

from backend.utils.gemini import get_credit_status

logger = logging.getLogger(__name__)

# ============================================================================
# ELECTION KNOWLEDGE BASE
# ============================================================================

ELECTION_KB = {
    "voter_registration": {
        "question": "How do I register as a voter?",
        "answer": "You can register as a voter by submitting Form 6 to your local Electoral Registration Officer.",
        "form": "Form 6",
        "url": "https://eci.gov.in/voter-registration",
    },
    "form_6": {
        "name": "Application for Inclusion of Name in Electoral Roll",
        "used_for": "New voter registration",
        "eligibility": "Indian citizen, 18+ years old",
        "url": "https://eci.gov.in/forms/form-6",
    },
    "form_7": {
        "name": "Application for Deletion of Entry from Electoral Roll",
        "used_for": "Removing voter name (migration, etc.)",
        "url": "https://eci.gov.in/forms/form-7",
    },
    "form_8": {
        "name": "Application for Correction of Entries in Electoral Roll",
        "used_for": "Correcting voter details",
        "url": "https://eci.gov.in/forms/form-8",
    },
    "evm": {
        "name": "Electronic Voting Machine",
        "security": "Verified by VVPAT",
        "link": "https://eci.gov.in/evm-vvpat",
    },
    "vvpat": {
        "name": "Voter Verified Paper Audit Trail",
        "purpose": "Verify your vote was recorded correctly",
        "link": "https://eci.gov.in/vvpat",
    },
}

UPCOMING_ELECTIONS = [
    {
        "name": "Maharashtra Assembly",
        "state": "Maharashtra",
        "phases": 2,
        "start_date": "2026-10-12",
        "end_date": "2026-10-20",
        "seats": 288,
    },
    {
        "name": "Jharkhand Assembly",
        "state": "Jharkhand",
        "phases": 1,
        "start_date": "2026-11-05",
        "end_date": "2026-11-05",
        "seats": 81,
    },
    {
        "name": "Haryana Assembly",
        "state": "Haryana",
        "phases": 1,
        "start_date": "2026-09-20",
        "end_date": "2026-09-20",
        "seats": 90,
    },
]

# ============================================================================
# AGENT TOOLS
# ============================================================================

def get_election_info(query: str) -> str:
    """Search local knowledge base for election information."""
    query_lower = query.lower()
    
    for key, value in ELECTION_KB.items():
        if key in query_lower or query_lower in str(value).lower():
            return json.dumps(value, indent=2)
    
    return json.dumps({"error": "Information not found in knowledge base", "query": query})


def get_form_info(form_name: str) -> str:
    """Get detailed information about specific election forms."""
    form_key = form_name.lower().replace("form ", "form_")
    
    if form_key in ELECTION_KB:
        return json.dumps(ELECTION_KB[form_key], indent=2)
    
    return json.dumps({
        "error": f"Form {form_name} not found",
        "available_forms": ["Form 6", "Form 6A", "Form 6B", "Form 7", "Form 8", "Form 8A"]
    })


def get_election_timeline(state: str = "India") -> str:
    """Get upcoming election dates by state."""
    if state.lower() == "india" or state == "":
        return json.dumps({
            "upcoming_elections": UPCOMING_ELECTIONS,
            "note": "Use state parameter for specific state elections"
        }, indent=2)
    
    # Search by state
    for election in UPCOMING_ELECTIONS:
        if state.lower() in election["state"].lower():
            return json.dumps(election, indent=2)
    
    return json.dumps({
        "error": f"No upcoming elections found for {state}",
        "available_states": [e["state"] for e in UPCOMING_ELECTIONS]
    })


def search_eci_news(query: str) -> str:
    """Search ECI official news and announcements."""
    # In production, use Tavily API
    return json.dumps({
        "source": "ECI Official",
        "query": query,
        "results": [
            {
                "title": "Voter Registration Camp",
                "description": "Special voter registration camps organized across states",
                "url": "https://eci.gov.in/news",
            }
        ]
    })


def get_voter_registration_steps(state: str = "General") -> str:
    """Provide step-by-step voter registration guide."""
    steps = [
        "Step 1: Check eligibility (Indian citizen, 18+)",
        "Step 2: Download Form 6 from https://eci.gov.in",
        "Step 3: Fill form with your details (name, address, ID)",
        "Step 4: Submit to local Electoral Registration Officer",
        "Step 5: Verification (can take 5-10 days)",
        "Step 6: Voter ID card will be issued",
    ]
    return json.dumps({
        "state": state,
        "steps": steps,
        "helpline": "1950",
        "website": "https://voters.eci.gov.in"
    })


def translate_civic_text(text_and_lang: str) -> str:
    """Translate civic education text to another language."""
    # Format: "hi: What is Form 6?"
    parts = text_and_lang.split(":", 1)
    if len(parts) != 2:
        return json.dumps({"error": "Use format: 'language: text'"})
    
    target_lang, text = parts
    
    translations = {
        "hi": "Form 6 एक चुनाव फॉर्म है।",
        "te": "ఫారమ్ 6 ఒక ఎన్నికల ఫారమ్.",
        "ta": "படிவம் 6 ஒரு தேர்தல் படிவம் ஆகும்.",
        "kn": "ಫಾರ್ಮ್ 6 ಒಂದು ಚುನಾವಣೆ ಫಾರ್ಮ್ ಆಗಿದೆ.",
    }
    
    return json.dumps({
        "original": text,
        "language": target_lang,
        "translation": translations.get(target_lang.lower(), "Translation not available")
    })


# ============================================================================
# LANGCHAIN AGENT SETUP
# ============================================================================

def create_tools() -> List[Tool]:
    """Create tools for the ReAct agent."""
    return [
        Tool(
            name="get_election_info",
            func=get_election_info,
            description="Search election information database. Use for: voter registration, ECI structure, EVM/VVPAT, forms",
        ),
        Tool(
            name="get_form_info",
            func=get_form_info,
            description="Get details about specific election forms (6, 7, 8, etc). Input: form name like 'Form 6'",
        ),
        Tool(
            name="get_election_timeline",
            func=get_election_timeline,
            description="Get upcoming election dates and schedule. Input: state name or 'India'",
        ),
        Tool(
            name="search_eci_news",
            func=search_eci_news,
            description="Search ECI official news and announcements. Input: search query",
        ),
        Tool(
            name="get_voter_registration_steps",
            func=get_voter_registration_steps,
            description="Get step-by-step voter registration guide. Input: state (optional)",
        ),
        Tool(
            name="translate_civic_text",
            func=translate_civic_text,
            description="Translate civic text. Format: 'language: text' e.g. 'hi: What is Form 6?'",
        ),
    ]


def get_election_agent(model_name: str = "gemini-1.5-flash"):
    """Create ReAct agent for election Q&A."""
    
    # Initialize Gemini LLM
    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.2,
        convert_system_message_to_human=True,  # Required for Gemini
    )

    # Create tools
    tools = create_tools()

    # ReAct prompt template
    react_template = """Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}"""

    prompt = PromptTemplate(
        input_variables=["input", "agent_scratchpad", "tools", "tool_names"],
        template=react_template,
    )

    # Create agent
    agent = create_react_agent(llm, tools, prompt)

    # Create executor
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,
        max_iterations=5,
        handle_parsing_errors=True,
    )

    return agent_executor


# ============================================================================
# PUBLIC API
# ============================================================================

async def run_election_agent(
    message: str,
    language: str = "en",
    model: str = "gemini-1.5-flash",
) -> Dict[str, any]:
    """
    Run the election agent for a user query.
    
    Args:
        message: User's question
        language: Response language (en, hi, te, ta, kn)
        model: Model to use (flash or pro)
    
    Returns:
        {
            "reply": "AI response",
            "xp_earned": 5-10,
            "references": ["url1", "url2"],
            "tool_usage": [{"tool": "name", "action": "..."}],
        }
    """
    try:
        # Get credit status
        credit_status = get_credit_status()
        if credit_status.get("is_over_limit"):
            return {
                "reply": f"❌ {credit_status['status_message']}",
                "xp_earned": 0,
                "references": [],
            }

        # Add language instruction
        query = message
        if language != "en":
            lang_names = {
                "hi": "Hindi",
                "te": "Telugu",
                "ta": "Tamil",
                "kn": "Kannada",
            }
            query = f"[Respond in {lang_names.get(language, language)}]\n{message}"

        # Create and run agent
        logger.info(f"🤖 Running election agent: {message[:100]}")
        agent = get_election_agent(model_name=model)
        
        result = await asyncio.get_event_loop().run_in_executor(
            None,
            agent.invoke,
            {"input": query}
        )

        reply = result.get("output", "Unable to generate response")

        # Extract references
        references = [
            "https://eci.gov.in",
            "https://voters.eci.gov.in",
            "https://www.eci.gov.in/helpline",
            "tel:1950",
        ]

        # Calculate XP (5-10 based on response quality)
        xp = min(5 + len(reply) // 100, 10)

        logger.info(f"✅ Agent response generated ({len(reply)} chars, {xp} XP)")

        return {
            "reply": reply,
            "xp_earned": xp,
            "references": references,
            "credit_status": credit_status,
        }

    except Exception as e:
        logger.error(f"❌ Agent error: {e}")
        return {
            "reply": f"I encountered an error: {str(e)}. Please try a simpler question.",
            "xp_earned": 0,
            "references": ["https://eci.gov.in"],
        }


# Import asyncio for thread executor
import asyncio

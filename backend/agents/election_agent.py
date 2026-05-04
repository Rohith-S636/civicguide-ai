import re
import asyncio
from typing import List, Dict, Any, Optional, Tuple

from backend.utils.gemini import gemini_chat, get_credit_status
from backend.utils.supabase import upsert_user_progress

# System prompt
SYSTEM_PROMPT = (
    "You are CivicGuide, an expert AI assistant for Indian elections. You help Indian citizens understand:\n"
    "- Voter registration (Form 6, 6A, 6B, 7, 8, 8A)\n"
    "- Election processes and timelines\n"
    "- EVM and VVPAT functioning\n"
    "- Model Code of Conduct\n"
    "- Constitutional provisions (Articles 324-329)\n"
    "- State-specific election rules\n"
    "- Polling day procedures\n\n"
    "Always respond in the user's chosen language. Be accurate, cite ECI sources when possible.\n"
    "Never provide opinions on political parties or candidates. Be neutral and factual.\n"
    "When unsure, direct users to https://eci.gov.in or 1950 helpline.\n"
)


def detect_language(text: str) -> str:
    """Very small heuristic language detection for en/hi/te/ta."""
    if re.search(r"[\u0900-\u097F]", text):
        return 'hi'
    if re.search(r"[\u0C00-\u0C7F]", text):
        return 'te'
    if re.search(r"[\u0B80-\u0BFF]", text):
        return 'ta'
    return 'en'


# Hardcoded knowledge base: 50+ Q&A entries covering requested topics
KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {"q": "What is Form 6?", "a": "Form 6 is the application for inclusion of name in the electoral roll.", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 6A?", "a": "Form 6A is for inclusion of names of overseas electors (service voters).", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 6B?", "a": "Form 6B is a variation used in certain states for special cases.", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 7?", "a": "Form 7 is for deletion of names from the electoral roll.", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 8?", "a": "Form 8 is an objection to an entry in the electoral roll.", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 8A?", "a": "Form 8A relates to transposition within electoral rolls during delimitation or changes.", "refs": ["https://eci.gov.in"]},
    {"q": "How to apply for voter ID (EPIC)?", "a": "Apply using Form 6 online on the ECI portal or at your BLO with ID and residence proof.", "refs": ["https://eci.gov.in"]},
    {"q": "Documents accepted for voter registration", "a": "EPIC, Passport, Driving Licence, Service ID, Bank/Post Office passbook with photograph, PAN, Smart Card under NPR, MNREGA Job Card, Health Insurance Smart Card, Pension document with photograph, Income Tax card, other govt photo IDs.", "refs": ["https://eci.gov.in"]},
    {"q": "What is the minimum voting age?", "a": "The minimum voting age in India is 18 years (Article 326).", "refs": ["https://eci.gov.in", "https://legislature.gov.in"]},
    {"q": "What is an EVM?", "a": "EVM stands for Electronic Voting Machine — a machine used to record votes electronically.", "refs": ["https://eci.gov.in"]},
    {"q": "What is VVPAT?", "a": "Voter Verified Paper Audit Trail — a printed slip that allows the voter to verify their vote; used for audits.", "refs": ["https://eci.gov.in"]},
    {"q": "How is VVPAT used in counting?", "a": "VVPAT slips are matched with EVM vote counts during audits or random verification as per ECI rules.", "refs": ["https://eci.gov.in"]},
    {"q": "How secure are EVMs?", "a": "EVMs are isolated devices designed with physical and procedural safeguards; ECI publishes security protocols.", "refs": ["https://eci.gov.in"]},
    {"q": "What is the Model Code of Conduct?", "a": "Non-statutory guidelines enforced by ECI to ensure free and fair elections covering behaviour of parties and candidates.", "refs": ["https://eci.gov.in"]},
    {"q": "Which constitutional article establishes ECI?", "a": "Article 324 establishes the Election Commission of India with superintendence, direction and control of elections.", "refs": ["https://eci.gov.in"]},
    {"q": "What is postal ballot?", "a": "Postal ballots allow certain categories (service voters, NRIs in some cases, others) to vote via post following prescribed procedure.", "refs": ["https://eci.gov.in"]},
    {"q": "How can NRIs vote?", "a": "NRIs may be able to vote via proxy or postal ballot depending on prevailing rules; check ECI guidance.", "refs": ["https://eci.gov.in"]},
    {"q": "What are polling day procedures?", "a": "Arrive with valid ID, find your serial number, show ID to polling officer, get ink mark after voting, slip issued where applicable.", "refs": ["https://eci.gov.in"]},
    {"q": "What happens during verification at booth?", "a": "Officer verifies name on roll, checks ID, authenticates signature/thumb, applies indelible ink, issues ballot or allows EVM use.", "refs": ["https://eci.gov.in"]},
    {"q": "Origin of indelible ink?", "a": "Indelible ink was adopted internationally to prevent double voting; ECI uses a standard formulation and application method.", "refs": ["https://eci.gov.in"]},
    {"q": "How to check polling booth?", "a": "Use ECI's voter helpline and electoral search portal online or contact BLO for booth details.", "refs": ["https://electoralsearch.eci.gov.in"]},
    {"q": "What is a BLO?", "a": "Booth Level Officer – responsible for maintaining voter rolls and assisting voters at local level.", "refs": ["https://eci.gov.in"]},
    {"q": "How are EVMs stored and secured?", "a": "EVMs are sealed and stored under multi-party custody with logging; ECI procedures describe chain-of-custody.", "refs": ["https://eci.gov.in"]},
    {"q": "Can I take photos inside polling station?", "a": "Photography inside polling station may be restricted; follow instructions of polling officers and local rules.", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 7 used for?", "a": "Form 7 is used for deletion of entries from the electoral roll where necessary.", "refs": ["https://eci.gov.in"]},
    {"q": "What is Form 8 used for?", "a": "Form 8 is used to object to an entry in the electoral roll.", "refs": ["https://eci.gov.in"]},
    {"q": "How to apply online for voter registration?", "a": "Visit ECI's National Voter Service Portal (NVSP) to submit Form 6 online with scanned documents.", "refs": ["https://www.nvsp.in"]},
    {"q": "What is EPIC?", "a": "Elector's Photo Identity Card – commonly called Voter ID card issued by ECI/state bodies.", "refs": ["https://eci.gov.in"]},
    {"q": "What is the voter helpline?", "a": "Call 1950 or check ECI website for helpline services for voters' queries.", "refs": ["https://eci.gov.in"]},
    {"q": "How to update address in voter list?", "a": "Submit Form 6 with new address details or apply for transposition via Form 6A/form variations as applicable.", "refs": ["https://eci.gov.in"]},
    {"q": "What is transposition in electoral roll?", "a": "Moving your registration record from one constituency to another when you change residence.", "refs": ["https://eci.gov.in"]},
    {"q": "Can I vote if my name is missing?", "a": "If your name is missing, you can approach the BLO or the RO with proof; in some cases, provisional arrangements may be possible.", "refs": ["https://eci.gov.in"]},
    {"q": "How are recounts handled?", "a": "Recounts follow legal and procedural guidelines; candidates may request recounts under specified conditions.", "refs": ["https://eci.gov.in"]},
    {"q": "What is EVM mock poll?", "a": "A mock poll is conducted before voting begins to demonstrate that EVMs are working and empty of votes.", "refs": ["https://eci.gov.in"]},
    {"q": "How long do elections take to declare results?", "a": "Results depend on the election (assembly/LS), counting schedules, and ECI announcements; timelines vary.", "refs": ["https://eci.gov.in"]},
    {"q": "What is NOTA?", "a": "None of the Above — option that voters can select to indicate disapproval of candidates.", "refs": ["https://eci.gov.in"]},
    {"q": "How to vote with disability?", "a": "ECI provides facilities for differently abled voters including ramps, assistive devices, and assistance as per rules.", "refs": ["https://eci.gov.in"]},
    {"q": "What are prohibited activities near polling stations?", "a": "Campaigning, displaying symbols, or influencing voters within a certain radius of polling stations is prohibited.", "refs": ["https://eci.gov.in"]},
    {"q": "How to lodge a complaint against electoral malpractice?", "a": "Contact ECI or the local RO and use official complaint mechanisms; preserve evidence where possible.", "refs": ["https://eci.gov.in"]},
    {"q": "What documents are needed for postal ballot?", "a": "Specific documents and forms are prescribed for postal ballots; check ECI guidance for categories eligible.", "refs": ["https://eci.gov.in"]},
    {"q": "Can service voters vote?", "a": "Service voters (armed forces, etc.) have special provisions such as postal ballots or proxy arrangements.", "refs": ["https://eci.gov.in"]},
    {"q": "How are polling agents appointed?", "a": "Political parties/candidates may appoint polling agents to observe the process as per ECI rules.", "refs": ["https://eci.gov.in"]},
    {"q": "What is the role of Returning Officer?", "a": "The RO is responsible for conduct of election in a constituency including counting and result declaration.", "refs": ["https://eci.gov.in"]},
    {"q": "What is proxy voting?", "a": "Proxy voting allows a designated person to vote on behalf of an eligible voter in specific circumstances.", "refs": ["https://eci.gov.in"]},
    {"q": "How to check VVPAT audit results?", "a": "ECI publishes audit and verification procedures and outcomes; check ECI releases for specific constituencies.", "refs": ["https://eci.gov.in"]},
    {"q": "What is delimitation?", "a": "Redrawing of constituency boundaries to reflect population changes; managed by Delimitation Commission and impacts electoral rolls.", "refs": ["https://eci.gov.in"]},
    {"q": "What is advance voting?", "a": "Advance voting may be provided to specific categories like service voters; check ECI for eligibility and procedures.", "refs": ["https://eci.gov.in"]},
    {"q": "How to register after turning 18?", "a": "Submit Form 6 with proof of age and residence to be added to the electoral roll before the cut-off date for elections.", "refs": ["https://eci.gov.in"]},
    {"q": "Who issues voter ID?", "a": "State election machinery under ECI issues EPIC cards through the NVSP and local offices.", "refs": ["https://eci.gov.in"]},
    {"q": "What happens if EVM malfunctions?", "a": "Polling staff follow contingency procedures including replacement or use of manual paper ballots where allowed; report incidents to RO.", "refs": ["https://eci.gov.in"]},
    {"q": "How to become a BLO?", "a": "BLO is typically a government appointee tasked with maintaining the voter list at the booth level.", "refs": ["https://eci.gov.in"]},
]


class ElectionAgent:
    def __init__(self, model: str = 'gemini-1.5-flash'):
        self.model = model

    async def get_election_info(self, query: str) -> List[Dict[str, Any]]:
        # Simple keyword search in knowledge base
        q = query.lower()
        hits = []
        for item in KNOWLEDGE_BASE:
            if q in item['q'].lower() or q in item['a'].lower() or any(q in (ref or '').lower() for ref in item.get('refs', [])):
                hits.append(item)
        # also fuzzy: include items where any token matches
        if not hits:
            tokens = q.split()
            for item in KNOWLEDGE_BASE:
                for tok in tokens:
                    if tok and (tok in item['q'].lower() or tok in item['a'].lower()):
                        hits.append(item)
                        break
        return hits[:8]

    async def get_form_info(self, form_name: str) -> Dict[str, Any]:
        # search KB for forms
        for item in KNOWLEDGE_BASE:
            if form_name.lower() in item['q'].lower() or form_name.lower() in (item.get('a') or '').lower():
                return item
        # fallback
        return {"q": form_name, "a": "Form details not found in KB. Check https://eci.gov.in", "refs": ["https://eci.gov.in"]}

    async def get_election_timeline(self, state: str) -> Dict[str, Any]:
        # Mock timeline per state
        return {
            "state": state,
            "phases": 2,
            "nominations_close": "2026-09-01",
            "polling_start": "2026-10-10",
            "result_date": "2026-10-25",
            "source": "https://eci.gov.in",
        }

    async def translate_text(self, text: str, target_lang: str) -> str:
        # Use Claude to translate (simple prompt)
        prompt = f"Translate the following text to {target_lang} fluently and accurately:\n\n{text}"
        out = await anthropic_chat(prompt, [], 'en')
        return out

    async def search_eci_news(self, query: str) -> List[Dict[str, Any]]:
        try:
            from tavily import Client as TavilyClient
            client = TavilyClient()
            results = client.search(query, limit=5)
            out = []
            for r in results:
                out.append({
                    'title': r.get('title'),
                    'summary': r.get('summary'),
                    'url': r.get('url'),
                    'date': r.get('date'),
                    'source': r.get('source'),
                })
            return out
        except Exception:
            # fallback: return ECI link and mock
            return [{
                'title': 'ECI schedule released',
                'summary': 'Mock ECI schedule release - check ECI website',
                'url': 'https://eci.gov.in',
                'date': '2026-07-01',
                'source': 'ECI',
            }]

    async def get_voter_registration_steps(self, state: str) -> List[str]:
        return [
            'Collect required documents (ID, residence proof)',
            'Fill Form 6 online at NVSP or obtain from BLO',
            'Submit form to BLO or upload documents online',
            'Verification by BLO',
            'Name added to electoral roll before the cut-off date',
        ]

    async def answer(self, question: str, session_id: Optional[str] = None, language: Optional[str] = None, history: Optional[List[dict]] = None) -> Tuple[str, int, List[str]]:
        # Detect language
        lang = language or detect_language(question)

        # Gather context: search KB
        kb_hits = await self.get_election_info(question)
        kb_text = "\n\n".join([f"Q: {h['q']}\nA: {h['a']}\nRefs: {','.join(h.get('refs',[]))}" for h in kb_hits])

        # Call tools heuristically based on question content
        refs = set()
        tool_outputs = []
        if re.search(r"form\s*\d|form\s*6|form 8", question, re.I):
            form = await self.get_form_info('Form 6')
            tool_outputs.append(f"Form info:\n{form.get('q')} - {form.get('a')}")
            refs.update(form.get('refs', []))

        if re.search(r"timeline|schedule|when|date", question, re.I):
            timeline = await self.get_election_timeline('generic')
            tool_outputs.append(f"Timeline:\n{timeline}")
            refs.add(timeline.get('source'))

        # Provide news context
        news = await self.search_eci_news(question)
        if news:
            tool_outputs.append(f"News hits: {len(news)} items. Top: {news[0].get('title')}")
            refs.update([n.get('url') or '' for n in news])

        # Build prompt
        prompt_parts = [SYSTEM_PROMPT]
        prompt_parts.append(f"User language: {lang}")
        prompt_parts.append("Relevant facts from ECI knowledge base:")
        prompt_parts.append(kb_text or "No direct KB matches found.")
        if tool_outputs:
            prompt_parts.append("Tool outputs:")
            prompt_parts.extend(tool_outputs)
        prompt_parts.append(f"User question:\n{question}\n\nPlease answer concisely, include official references and suggested next steps. Format:\n- Main answer\n- Official references (list)\n- Suggested next steps (bullet list)\n- XP award (5 or 10).")

        prompt = "\n\n".join(prompt_parts)

        # Call Gemini API via helper
        reply, credit_status = await gemini_chat(prompt, history or [], lang)

        # Check if we're over limit
        if credit_status.get("is_over_limit"):
            xp = 0  # No XP if API is over limit
        else:
            # Determine XP: longer or complex questions get 10
            xp = 10 if len(question) > 200 or (len(kb_hits) > 2) else 5

        # Save to Supabase if session_id provided (store last chat snippet and xp)
        if session_id:
            payload = {"last_chat": {"question": question, "reply": reply}, "xp": xp}
            try:
                await upsert_user_progress(session_id, payload)
            except Exception:
                # dont fail on DB errors
                pass

        # Collect references
        ref_list = list(refs) if refs else ['https://eci.gov.in']

        return reply, xp, ref_list


__all__ = ['ElectionAgent']

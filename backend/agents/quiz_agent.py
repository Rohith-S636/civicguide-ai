import json
import re
from typing import List, Dict, Any, Optional, Tuple
from backend.utils.gemini import gemini_chat

# Topic descriptions for Claude prompts
TOPIC_DESCRIPTIONS = {
    "general_election": "Basic election concepts, voting age, election frequency, voter registration basics",
    "constitution": "Indian Constitution Articles 324-329, fundamental rights, election-related provisions",
    "voting_process": "Voter registration (Forms 6,7,8), polling booth procedures, EVM/VVPAT, vote counting",
    "current_affairs": "Recent ECI announcements, current election schedules, recent electoral developments",
    "state_elections": "State-specific election rules, state assembly elections, regional election procedures",
    "eci_history": "History of Election Commission of India, evolution of election processes, VVPAT introduction",
}

DIFFICULTY_DESCRIPTIONS = {
    "beginner": "Very simple factual questions, 4th-grade reading level, direct answers",
    "student": "Class 10-12 level, some reasoning, multiple concepts, moderate complexity",
    "exam": "UPSC/competitive exam level, analytical, comparative, requires deep understanding",
}

# Static fallback quiz bank: 50 questions covering all topics and difficulties
FALLBACK_QUIZ_BANK: List[Dict[str, Any]] = [
    # General Election - Beginner
    {"id": "q1", "question": "What is the minimum age to vote in India?", "options": ["A. 16 years", "B. 18 years", "C. 21 years", "D. 25 years"], "correct_index": 1, "explanation": "The minimum voting age in India is 18 years as per Article 326 of the Constitution.", "category": "general_election", "difficulty": "beginner", "article_reference": "Article 326"},
    {"id": "q2", "question": "How often are Lok Sabha elections held in India?", "options": ["A. Every 2 years", "B. Every 4 years", "C. Every 5 years", "D. Every 7 years"], "correct_index": 2, "explanation": "Lok Sabha elections are held every 5 years unless dissolved earlier.", "category": "general_election", "difficulty": "beginner", "article_reference": None},
    {"id": "q3", "question": "What does EVM stand for?", "options": ["A. Electronic Voting Monitor", "B. Electronic Voting Machine", "C. Electronic Vote Management", "D. Electrical Voting Mechanism"], "correct_index": 1, "explanation": "EVM stands for Electronic Voting Machine, used to record and count votes.", "category": "general_election", "difficulty": "beginner", "article_reference": None},
    {"id": "q4", "question": "What is the total number of seats in the Lok Sabha?", "options": ["A. 500", "B. 543", "C. 545", "D. 552"], "correct_index": 1, "explanation": "The Lok Sabha has 543 elected seats plus 2 nominated seats.", "category": "general_election", "difficulty": "beginner", "article_reference": None},
    {"id": "q5", "question": "Which body conducts elections in India?", "options": ["A. Election Ministry", "B. Election Commission of India", "C. Prime Minister's Office", "D. Election Parliament"], "correct_index": 1, "explanation": "The Election Commission of India (ECI) is the constitutional body responsible for conducting elections.", "category": "general_election", "difficulty": "beginner", "article_reference": "Article 324"},
    {"id": "q6", "question": "What is the significance of the 18th Amendment in Indian elections?", "options": ["A. Reduced voting age to 18", "B. Abolished election commission", "C. Changed parliamentary structure", "D. Modified voting procedure"], "correct_index": 0, "explanation": "The 18th Amendment reduced the voting age from 21 to 18 years in 1989.", "category": "general_election", "difficulty": "student", "article_reference": None},
    {"id": "q7", "question": "How many states does India have for election purposes?", "options": ["A. 26 states", "B. 28 states", "C. 30 states", "D. 32 states"], "correct_index": 1, "explanation": "India has 28 states and 8 union territories for election administration (as of 2023).", "category": "general_election", "difficulty": "student", "article_reference": None},
    {"id": "q8", "question": "What is the purpose of delimitation in elections?", "options": ["A. Limit campaign expenses", "B. Redraw constituency boundaries", "C. Count voter registration", "D. Schedule election dates"], "correct_index": 1, "explanation": "Delimitation is the process of redrawing constituency boundaries based on population changes.", "category": "general_election", "difficulty": "student", "article_reference": None},
    {"id": "q9", "question": "What role does VVPAT play in elections?", "options": ["A. Counts votes automatically", "B. Verifies voter eligibility", "C. Provides printed slip for voter verification", "D. Monitors poll workers"], "correct_index": 2, "explanation": "VVPAT (Voter Verified Paper Audit Trail) prints a slip so voters can verify their vote was recorded correctly.", "category": "general_election", "difficulty": "student", "article_reference": None},
    {"id": "q10", "question": "What is NOTA in elections?", "options": ["A. A political party", "B. None of the Above option", "C. A voting technique", "D. An election rule"], "correct_index": 1, "explanation": "NOTA (None of the Above) allows voters to express disapproval of all candidates.", "category": "general_election", "difficulty": "student", "article_reference": None},
    # Constitution - Beginner
    {"id": "q11", "question": "Which article establishes the Election Commission of India?", "options": ["A. Article 320", "B. Article 324", "C. Article 328", "D. Article 332"], "correct_index": 1, "explanation": "Article 324 establishes the Election Commission and grants it superintendence of elections.", "category": "constitution", "difficulty": "beginner", "article_reference": "Article 324"},
    {"id": "q12", "question": "Which article provides for adult franchise in India?", "options": ["A. Article 320", "B. Article 324", "C. Article 326", "D. Article 330"], "correct_index": 2, "explanation": "Article 326 provides for universal adult suffrage - right to vote for all citizens 18+.", "category": "constitution", "difficulty": "beginner", "article_reference": "Article 326"},
    {"id": "q13", "question": "What is guaranteed by Article 325 of the Constitution?", "options": ["A. Right to vote", "B. No disqualification on grounds of religion", "C. Equal voting rights", "D. Free and fair elections"], "correct_index": 1, "explanation": "Article 325 prohibits disqualification from voting on grounds of religion, caste, sex, etc.", "category": "constitution", "difficulty": "beginner", "article_reference": "Article 325"},
    {"id": "q14", "question": "What is Part III of the Indian Constitution related to?", "options": ["A. Elections", "B. Fundamental Rights", "C. Directive Principles", "D. Election Commission"], "correct_index": 1, "explanation": "Part III deals with Fundamental Rights including the right to vote and democratic participation.", "category": "constitution", "difficulty": "beginner", "article_reference": None},
    {"id": "q15", "question": "Which article deals with elections to Rajya Sabha?", "options": ["A. Article 326", "B. Article 328", "C. Article 329", "D. Article 330"], "correct_index": 1, "explanation": "Article 328 provides for the elections to the Rajya Sabha.", "category": "constitution", "difficulty": "beginner", "article_reference": "Article 328"},
    # Constitution - Student
    {"id": "q16", "question": "What is the parity of voting power ensured by Articles 325 and 326?", "options": ["A. One person, one vote", "B. All parties equal votes", "C. Regional representation", "D. Proportional voting"], "correct_index": 0, "explanation": "Together, these articles ensure 'one person, one vote' - equal voting power for all citizens.", "category": "constitution", "difficulty": "student", "article_reference": "Articles 325-326"},
    {"id": "q17", "question": "Under which article can the ECI issue regulations for elections?", "options": ["A. Article 322", "B. Article 324", "C. Article 326", "D. Article 329"], "correct_index": 1, "explanation": "Article 324 empowers the ECI to make regulations for the conduct of elections.", "category": "constitution", "difficulty": "student", "article_reference": "Article 324"},
    {"id": "q18", "question": "What is the significance of Article 327 in the Constitution?", "options": ["A. Defines voting rights", "B. Parliament may regulate electoral matters", "C. Election Commission powers", "D. Delimitation process"], "correct_index": 1, "explanation": "Article 327 allows Parliament to make laws relating to elections to Parliament and state legislatures.", "category": "constitution", "difficulty": "student", "article_reference": "Article 327"},
    {"id": "q19", "question": "How does Article 329 restrict judicial review?", "options": ["A. No courts involved", "B. Courts cannot question election validity", "C. Only ECI can interpret", "D. States have final authority"], "correct_index": 1, "explanation": "Article 329 prevents courts from questioning the validity of electoral matters except as provided by law.", "category": "constitution", "difficulty": "student", "article_reference": "Article 329"},
    {"id": "q20", "question": "What fundamental right ensures democratic participation in elections?", "options": ["A. Right to freedom", "B. Right to equality", "C. Right to constitutional remedies", "D. Right to life"], "correct_index": 1, "explanation": "The right to equality (Article 14) ensures no disqualification in voting based on discrimination.", "category": "constitution", "difficulty": "student", "article_reference": None},
    # Voting Process - Beginner
    {"id": "q21", "question": "What is Form 6?", "options": ["A. Deletion from voter list", "B. Objection to voter entry", "C. Application for voter registration", "D. Vote counting form"], "correct_index": 2, "explanation": "Form 6 is the application for inclusion of a name in the electoral roll.", "category": "voting_process", "difficulty": "beginner", "article_reference": None},
    {"id": "q22", "question": "What is Form 8 used for?", "options": ["A. Register to vote", "B. Object to an entry in electoral roll", "C. Request postal ballot", "D. Appeal election result"], "correct_index": 1, "explanation": "Form 8 is used to file an objection against an entry in the electoral roll.", "category": "voting_process", "difficulty": "beginner", "article_reference": None},
    {"id": "q23", "question": "What does BLO stand for?", "options": ["A. Booth Level Officer", "B. Basic Listening Officer", "C. Block Level Organization", "D. Board of Local Officers"], "correct_index": 0, "explanation": "BLO (Booth Level Officer) is responsible for maintaining the electoral roll at booth level.", "category": "voting_process", "difficulty": "beginner", "article_reference": None},
    {"id": "q24", "question": "What happens during the mock poll at a polling station?", "options": ["A. Actual voting begins", "B. Demo to show EVM works and is empty", "C. Practice run for voters", "D. Opinion survey"], "correct_index": 1, "explanation": "Mock poll demonstrates that the EVM is functioning correctly and contains no votes before actual polling.", "category": "voting_process", "difficulty": "beginner", "article_reference": None},
    {"id": "q25", "question": "How long does polling typically occur on election day in India?", "options": ["A. 8 hours (7am-3pm)", "B. 10 hours (7am-5pm)", "C. 11 hours (7am-6pm)", "D. 12 hours (7am-7pm)"], "correct_index": 2, "explanation": "Polling typically occurs from 7 AM to 6 PM (11 hours) on election day.", "category": "voting_process", "difficulty": "beginner", "article_reference": None},
    # Voting Process - Student
    {"id": "q26", "question": "What is the difference between postal ballot and proxy voting?", "options": ["A. Both are same", "B. Postal: vote by mail; Proxy: someone votes on your behalf", "C. Postal: at booth; Proxy: at home", "D. No significant difference"], "correct_index": 1, "explanation": "Postal ballot allows voting by mail, while proxy voting allows a designated person to vote on your behalf.", "category": "voting_process", "difficulty": "student", "article_reference": None},
    {"id": "q27", "question": "What categories of voters are eligible for postal ballots?", "options": ["A. Everyone", "B. Only service voters", "C. Service voters, elderly, disabled", "D. Only senior citizens"], "correct_index": 2, "explanation": "Service voters, persons above 65 years, and disabled voters are typically eligible for postal ballots.", "category": "voting_process", "difficulty": "student", "article_reference": None},
    {"id": "q28", "question": "How is indelible ink used in the voting process?", "options": ["A. To mark ballots", "B. Mark voter's finger to prevent double voting", "C. To record votes", "D. For authentication"], "correct_index": 1, "explanation": "Indelible ink is applied to the voter's finger after voting to prevent them from voting again.", "category": "voting_process", "difficulty": "student", "article_reference": None},
    {"id": "q29", "question": "What is the purpose of voter verification via VVPAT in audit?", "options": ["A. Increase voting speed", "B. Verify EVM votes match VVPAT slips", "C. Reduce polling stations", "D. Collect voter data"], "correct_index": 1, "explanation": "VVPAT audit verifies that EVM vote counts match printed VVPAT slips, ensuring accuracy.", "category": "voting_process", "difficulty": "student", "article_reference": None},
    {"id": "q30", "question": "What is the role of polling agents in elections?", "options": ["A. Recruit voters", "B. Observe and report the voting process", "C. Count votes", "D. Campaign for parties"], "correct_index": 1, "explanation": "Polling agents represent parties/candidates to observe the voting process and report irregularities.", "category": "voting_process", "difficulty": "student", "article_reference": None},
    # Current Affairs - Beginner
    {"id": "q31", "question": "When was the VVPAT first introduced in Indian elections?", "options": ["A. 2004", "B. 2009", "C. 2014", "D. 2019"], "correct_index": 2, "explanation": "VVPAT was first used in 2014 Lok Sabha elections in select constituencies.", "category": "current_affairs", "difficulty": "beginner", "article_reference": None},
    {"id": "q32", "question": "What is the ECI helpline number in India?", "options": ["A. 1951", "B. 1950", "C. 1949", "D. 1952"], "correct_index": 1, "explanation": "The voter helpline is 1950 for election-related queries.", "category": "current_affairs", "difficulty": "beginner", "article_reference": None},
    {"id": "q33", "question": "Which year saw the highest voter turnout in Lok Sabha elections?", "options": ["A. 2009", "B. 2014", "C. 2019", "D. 1951"], "correct_index": 2, "explanation": "2019 Lok Sabha elections had the highest voter turnout at ~67%.", "category": "current_affairs", "difficulty": "beginner", "article_reference": None},
    {"id": "q34", "question": "How many phases were there in 2019 Lok Sabha elections?", "options": ["A. 5 phases", "B. 6 phases", "C. 7 phases", "D. 8 phases"], "correct_index": 2, "explanation": "The 2019 Lok Sabha elections were conducted in 7 phases.", "category": "current_affairs", "difficulty": "beginner", "article_reference": None},
    {"id": "q35", "question": "What is the NVSP (National Voter Service Portal)?", "options": ["A. National vehicle service", "B. Platform for online voter registration", "C. News and voting service", "D. Non-voter service program"], "correct_index": 1, "explanation": "NVSP allows citizens to register online and manage voter information digitally.", "category": "current_affairs", "difficulty": "student", "article_reference": None},
    # State Elections - Beginner
    {"id": "q36", "question": "Which state has the largest Lok Sabha representation?", "options": ["A. Rajasthan", "B. Maharashtra", "C. Uttar Pradesh", "D. West Bengal"], "correct_index": 2, "explanation": "Uttar Pradesh has 80 Lok Sabha seats, the highest in India.", "category": "state_elections", "difficulty": "beginner", "article_reference": None},
    {"id": "q37", "question": "How many assembly seats does a typical Indian state have?", "options": ["A. 100-150", "B. 200-300", "C. 400-500", "D. Varies by state"], "correct_index": 3, "explanation": "Assembly seats vary from state to state; some have 60 seats, others have 400+.", "category": "state_elections", "difficulty": "beginner", "article_reference": None},
    {"id": "q38", "question": "What is a concurrent election?", "options": ["A. Election at same time", "B. Simultaneous national and state elections", "C. Parallel voting systems", "D. Consecutive elections"], "correct_index": 1, "explanation": "Concurrent elections means holding Lok Sabha and state assembly elections simultaneously.", "category": "state_elections", "difficulty": "beginner", "article_reference": None},
    {"id": "q39", "question": "What is a bye-election?", "options": ["A. Election for farewell", "B. Election to fill vacancy", "C. Secondary election", "D. Supplementary voting"], "correct_index": 1, "explanation": "Bye-election is held to fill a vacancy in a seat vacated during the term.", "category": "state_elections", "difficulty": "beginner", "article_reference": None},
    {"id": "q40", "question": "What was the significance of the first state elections after independence?", "options": ["A. Testing democracy", "B. Proving viability of adult suffrage", "C. Electoral process development", "D. All of above"], "correct_index": 3, "explanation": "First state elections proved that universal adult suffrage could work on large scale.", "category": "state_elections", "difficulty": "student", "article_reference": None},
    # ECI History
    {"id": "q41", "question": "When was the Election Commission of India established?", "options": ["A. 1947", "B. 1950", "C. 1951", "D. 1952"], "correct_index": 0, "explanation": "ECI was established on January 25, 1950, just days after the Constitution came into effect.", "category": "eci_history", "difficulty": "beginner", "article_reference": None},
    {"id": "q42", "question": "Who was the first Chief Election Commissioner of India?", "options": ["A. Sukumar Sen", "B. Vijay Chandra", "C. T.K. Rao", "D. R.K. Bhat"], "correct_index": 0, "explanation": "Sukumar Sen was the first Chief Election Commissioner of India.", "category": "eci_history", "difficulty": "student", "article_reference": None},
    {"id": "q43", "question": "When were electronic voting machines first used in India?", "options": ["A. 1989", "B. 1998", "C. 2004", "D. 2009"], "correct_index": 2, "explanation": "EVMs were first used in general elections in 2004, replacing paper ballots completely.", "category": "eci_history", "difficulty": "student", "article_reference": None},
    {"id": "q44", "question": "How has the ECI evolved since independence?", "options": ["A. No changes", "B. Only administrative", "C. Introduction of tech, expanded scope, new processes", "D. Reduced powers"], "correct_index": 2, "explanation": "ECI has evolved significantly with technological innovations (EVMs, VVPAT), expanded mandate, and enhanced processes.", "category": "eci_history", "difficulty": "student", "article_reference": None},
    {"id": "q45", "question": "What was the first major electoral reform in independent India?", "options": ["A. Introduction of EVMs", "B. Adoption of adult suffrage", "C. Creation of constituencies", "D. Implementation of VVPAT"], "correct_index": 1, "explanation": "Universal adult suffrage was the first and most significant reform, giving all citizens 18+ the right to vote.", "category": "eci_history", "difficulty": "student", "article_reference": None},
    # Additional questions to reach 50
    {"id": "q46", "question": "What is the Chief Election Commissioner's tenure?", "options": ["A. 3 years", "B. 5 years", "C. 6 years", "D. Until age 65"], "correct_index": 2, "explanation": "The Chief Election Commissioner serves for a fixed term of 6 years or until age 65.", "category": "eci_history", "difficulty": "beginner", "article_reference": None},
    {"id": "q47", "question": "What does Model Code of Conduct regulate?", "options": ["A. Voting procedure", "B. Electoral models", "C. Campaign practices", "D. Booth setup"], "correct_index": 2, "explanation": "Model Code of Conduct lays down rules for political parties and candidates during elections.", "category": "general_election", "difficulty": "student", "article_reference": None},
    {"id": "q48", "question": "How many commissioners are there in ECI?", "options": ["A. 1 - CEC only", "B. 2 - CEC + 1", "C. 3 - CEC + 2", "D. 4 - CEC + 3"], "correct_index": 2, "explanation": "ECI has 3 members including the Chief Election Commissioner and 2 Election Commissioners.", "category": "eci_history", "difficulty": "student", "article_reference": None},
    {"id": "q49", "question": "What is the role of Returning Officer in elections?", "options": ["A. Campaign manager", "B. Conduct election in constituency", "C. Count votes only", "D. Deploy security"], "correct_index": 1, "explanation": "Returning Officer is responsible for overall conduct of elections in a constituency.", "category": "voting_process", "difficulty": "student", "article_reference": None},
    {"id": "q50", "question": "Which Indian election was called the 'Largest Democratic Exercise'?", "options": ["A. 1951 elections", "B. 1977 elections", "C. 2019 elections", "D. 2024 elections"], "correct_index": 2, "explanation": "2019 Lok Sabha elections with 900+ million voters is called the largest democratic exercise globally.", "category": "current_affairs", "difficulty": "beginner", "article_reference": None},
]


class QuizAgent:
    def __init__(self, model: str = 'gemini-1.5-flash'):
        self.model = model

    async def generate_questions(
        self,
        topic: str,
        difficulty: str = 'beginner',
        language: str = 'en',
        count: int = 10,
    ) -> Dict[str, Any]:
        """Generate quiz questions using Claude, with fallback to static bank."""
        try:
            # Try to generate via Claude
            questions = await self._generate_via_gemini(topic, difficulty, language, count)
        except Exception as e:
            # Fallback to static bank
            print(f"Gemini generation failed: {e}. Using fallback bank.")
            questions = self._get_fallback_questions(topic, difficulty, count)

        # Calculate total XP
        xp_per_question = {"beginner": 5, "student": 10, "exam": 15}
        total_xp = len(questions) * xp_per_question.get(difficulty, 5)

        return {
            "questions": questions,
            "topic": topic,
            "total_xp": total_xp,
        }

    async def _generate_via_gemini(
        self,
        topic: str,
        difficulty: str,
        language: str,
        count: int,
    ) -> List[Dict[str, Any]]:
        """Call Gemini to generate questions."""
        topic_desc = TOPIC_DESCRIPTIONS.get(topic, topic)
        diff_desc = DIFFICULTY_DESCRIPTIONS.get(difficulty, difficulty)

        prompt = f"""Generate exactly {count} multiple-choice quiz questions about Indian elections for the topic: {topic}.

Topic description: {topic_desc}
Difficulty level: {diff_desc}
Language: {language}

Return ONLY a valid JSON array (no markdown, no extra text) with this exact structure for each question:
{{
  "id": "q1",
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_index": 0,
  "explanation": "...",
  "category": "{topic}",
  "difficulty": "{difficulty}",
  "article_reference": "Article 324" (optional, use if applicable)
}}

Ensure:
- All 4 options are distinct
- Correct answer index is 0-3
- Explanation is 1-2 sentences
- Questions are in {language} language
- Questions are specific to Indian election context
- Difficulty matches "{difficulty}" level

Return the JSON array only, no other text."""

        reply, status = await gemini_chat(prompt, [], language)

        # Check if over limit
        if status.get("is_over_limit"):
            raise Exception(f"Gemini API limit exceeded: {status['status_message']}")

        # Extract JSON from reply
        try:
            # Try direct parse
            questions = json.loads(reply)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', reply)
            if json_match:
                questions = json.loads(json_match.group(1))
            else:
                # Try to find JSON array directly
                json_match = re.search(r'\[[\s\S]*\]', reply)
                if json_match:
                    questions = json.loads(json_match.group(0))
                else:
                    raise ValueError("No valid JSON found in Gemini response")

        # Validate structure
        if not isinstance(questions, list):
            raise ValueError("Gemini response is not a list")

        for q in questions:
            if not all(k in q for k in ['question', 'options', 'correct_index']):
                raise ValueError("Question missing required fields")
            if len(q['options']) != 4:
                raise ValueError("Question must have exactly 4 options")

        return questions[:count]

    def _get_fallback_questions(self, topic: str, difficulty: str, count: int) -> List[Dict[str, Any]]:
        """Return questions from static fallback bank filtered by topic and difficulty."""
        filtered = [q for q in FALLBACK_QUIZ_BANK if q['category'] == topic and q['difficulty'] == difficulty]

        # If not enough, add from other difficulties
        if len(filtered) < count:
            all_topic = [q for q in FALLBACK_QUIZ_BANK if q['category'] == topic]
            filtered = all_topic[:count]

        # If still not enough, just return what we have
        return filtered[:count]

    def get_categories(self) -> List[Dict[str, str]]:
        """Return all available quiz categories."""
        return [
            {"id": "general_election", "name": "General Election Concepts", "description": "Basic election concepts and procedures"},
            {"id": "constitution", "name": "Constitution & Articles", "description": "Articles 324-329 and fundamental rights"},
            {"id": "voting_process", "name": "Voting Process", "description": "Registration, polling, and counting procedures"},
            {"id": "current_affairs", "name": "Current Affairs", "description": "Recent ECI announcements and developments"},
            {"id": "state_elections", "name": "State Elections", "description": "State-specific election rules and procedures"},
            {"id": "eci_history", "name": "ECI History", "description": "History of Election Commission of India"},
        ]


__all__ = ['QuizAgent']

from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional

router = APIRouter()

# Comprehensive forms database
FORMS_DATABASE: List[Dict[str, Any]] = [
    {
        "form_id": "6",
        "form_name": "Form 6",
        "title": "Application for Inclusion of Name in Electoral Roll",
        "purpose": "Used to register as a voter when you turn 18 or become eligible to vote. Submit this form to get enrolled in the voter list of your constituency.",
        "who_can_apply": [
            "Indian citizens aged 18 or above",
            "Persons who have attained citizenship",
            "Persons who have resided in the constituency for at least 3 months (if applicable)",
            "Not convicted of electoral offences"
        ],
        "documents_required": [
            "Proof of Citizenship: Passport, Birth Certificate, School/College Certificate, Aadhaar, PAN Card",
            "Proof of Residence: Utility bills, Rental agreement, Municipal corporation records, Bank statements, Insurance policies",
            "Proof of Age: Birth certificate, School certificate, Passport, Aadhaar",
            "Two passport-size photographs (if submitting offline)",
            "Aadhaar card (optional but recommended)"
        ],
        "procedure_steps": [
            "Visit https://nvsp.in or contact your local BLO (Booth Level Officer)",
            "Download Form 6 or collect from BLO office",
            "Fill all details accurately including name, father's name, date of birth, address",
            "Paste two passport-size photographs",
            "Attach scanned copies of supporting documents (for online submission)",
            "Submit online at NVSP or submit to BLO office with original documents",
            "BLO will verify your details within 3-5 days",
            "Your name will appear in draft roll (displayed for 21 days)",
            "After objection period, name is added to final roll"
        ],
        "processing_time": "7-10 days (if all documents are correct)",
        "online_available": True,
        "online_process": "Visit NVSP.IN, fill form online, upload scanned documents, receive confirmation via SMS/email",
        "offline_process": "Collect form from BLO office or download and print. Fill form, attach photos and documents. Submit to BLO with original documents. BLO will return a receipt.",
        "official_url": "https://voters.eci.gov.in",
        "official_video_url": "https://www.youtube.com/watch?v=example_form6",
        "remarks": "Form 6 is the most commonly used form for voter registration. Ensure all details match your official documents.",
        "common_issues": ["Spelling mistakes in name", "Incorrect date of birth", "Old address if recently moved"]
    },
    {
        "form_id": "6A",
        "form_name": "Form 6A",
        "title": "Application for Registration of Overseas Elector",
        "purpose": "For Indian citizens residing abroad who wish to register as voters and participate in elections. This form allows overseas Indians to exercise their democratic right to vote.",
        "who_can_apply": [
            "Indian citizens residing outside India",
            "Persons with Indian citizenship",
            "Persons of Indian origin with valid Indian passport",
            "Those who have not renounced Indian citizenship"
        ],
        "documents_required": [
            "Valid Indian Passport (copy)",
            "Proof of overseas residence: Visa, Employment letter, Rental agreement from foreign country",
            "Proof of Indian residence within past 7 years: Previous addresses, Old passport",
            "Address of voting constituency in India",
            "Two passport-size photographs",
            "Contact details: Email, phone number for communication"
        ],
        "procedure_steps": [
            "Download Form 6A from NVSP.IN or ECI website",
            "Fill all details including overseas address and Indian constituency",
            "Indicate which constituency in India you wish to register",
            "Attach scanned copies of passport and other documents",
            "Submit online at NVSP.IN or by post to Election Commission",
            "ECI will verify your Indian citizenship and documents",
            "Upon approval, you will receive confirmation",
            "Your name will be added to overseas voter list",
            "You can vote via postal ballot or appear in person if visiting India during elections"
        ],
        "processing_time": "15-21 days",
        "online_available": True,
        "online_process": "Register on NVSP, fill Form 6A, upload documents, track application status online",
        "offline_process": "Print form, fill details, attach documents, send by registered post to ECI",
        "official_url": "https://voters.eci.gov.in",
        "official_video_url": "https://www.youtube.com/watch?v=example_form6a",
        "remarks": "Overseas voters typically vote via postal ballot. Ensure passport copy is clear and readable.",
        "voting_options": ["Postal ballot", "Person voting if visiting India during polling"]
    },
    {
        "form_id": "6B",
        "form_name": "Form 6B",
        "title": "Application for Linkage of Aadhaar with EPIC/Voter ID",
        "purpose": "Used to link your Aadhaar number with your Voter ID/EPIC for digital voter records. This ensures better identification and reduces duplicate registrations.",
        "who_can_apply": [
            "Existing voters with EPIC/Voter ID",
            "Persons with valid Aadhaar number",
            "Indian citizens who want to update their voter records"
        ],
        "documents_required": [
            "Valid Voter ID/EPIC (original or copy)",
            "Valid Aadhaar card (original or copy)",
            "Self-attested copies of both documents",
            "Address proof if address in Aadhaar differs from voter roll"
        ],
        "procedure_steps": [
            "Collect Form 6B from your local BLO office",
            "Fill your voter ID and Aadhaar number accurately",
            "Attach self-attested copies of both documents",
            "Self-attest any address corrections needed",
            "Submit form to BLO office with original documents",
            "BLO will verify details from system",
            "Linkage will be completed and you'll receive confirmation",
            "Your updated voter record will reflect Aadhaar linkage"
        ],
        "processing_time": "3-5 days",
        "online_available": False,
        "offline_process": "Submit form to BLO office. They will update records in their system. Confirmation provided immediately.",
        "online_process": "Not yet available online, must be submitted to BLO",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Aadhaar linkage is voluntary but recommended for better voter records. No voter will be deleted due to incomplete Aadhaar linkage.",
        "common_issues": ["Mismatch in name spelling between Aadhaar and voter ID", "Address differences"]
    },
    {
        "form_id": "7",
        "form_name": "Form 7",
        "title": "Application for Deletion of Entry in Electoral Roll",
        "purpose": "Used to request removal of a name from the voter list in cases of death, relocation to another constituency, or loss of eligibility. This prevents ghost voting.",
        "who_can_apply": [
            "Heirs of deceased voter (by submitting death certificate)",
            "Person requesting their own deletion (if moved to another constituency)",
            "Anyone aware of ineligible voter's entry",
            "Local authorities (for duplicate entries)"
        ],
        "documents_required": [
            "Original Form 7 filled and signed",
            "Voter ID/EPIC of person to be deleted",
            "Death certificate (if deceased)",
            "New address proof (if relocated)",
            "Identification proof of person filing the form",
            "Affidavit if filed by family member (for deceased)"
        ],
        "procedure_steps": [
            "Obtain Form 7 from BLO or download from NVSP.IN",
            "Fill form with voter ID and reason for deletion (death/relocation/ineligibility)",
            "Attach supporting documents (death certificate, new address proof, etc.)",
            "Signature/thumb impression required",
            "Submit to BLO office or online at NVSP",
            "BLO will verify information from available records",
            "Form 7 will be processed and deletion approved",
            "Name will be removed from electoral roll",
            "Confirmation will be provided"
        ],
        "processing_time": "7-10 days",
        "online_available": True,
        "online_process": "Submit via NVSP with supporting documents. BLO reviews and processes deletion.",
        "offline_process": "Submit to BLO office with original documents and supporting evidence.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Deletion is permanent. Ensure you have moved to new constituency before requesting deletion from old constituency.",
        "note": "If you move constituencies, register in new one using Form 6 instead of requesting deletion from old one"
    },
    {
        "form_id": "8",
        "form_name": "Form 8",
        "title": "Application for Correction of Entry in Electoral Roll",
        "purpose": "Used to correct errors in voter roll entries such as wrong spelling of name, incorrect date of birth, father's name, or address. Ensures accuracy of voter records.",
        "who_can_apply": [
            "Any registered voter with incorrect entries",
            "Family members on behalf of voter",
            "Election officials who identify discrepancies",
            "Anyone with proof of error in roll"
        ],
        "documents_required": [
            "Original Form 8 (signed and dated)",
            "Voter ID/EPIC",
            "Correct document (passport, birth certificate, etc.) showing correct information",
            "Self-attested copy of correct document",
            "Brief explanation of error"
        ],
        "procedure_steps": [
            "Collect Form 8 from BLO office or download from NVSP.IN",
            "Fill form completely with voter ID number",
            "Clearly state the incorrect entry and correct information",
            "Attach copy of correct document as proof",
            "Sign and date the form",
            "Submit to BLO office or upload on NVSP",
            "BLO will verify with submitted document",
            "Correction will be approved and updated in system",
            "Confirmation of correction will be provided"
        ],
        "processing_time": "3-7 days",
        "online_available": True,
        "online_process": "Submit Form 8 via NVSP with supporting document images. Correction processed after verification.",
        "offline_process": "Submit to BLO with original documents. Get receipt and confirmation.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Common corrections: Spelling of name, date of birth, father's name, address",
        "corrections_allowed": ["Name spelling", "Date of birth", "Father's/Husband's name", "Address details", "Gender"]
    },
    {
        "form_id": "8A",
        "form_name": "Form 8A",
        "title": "Application for Transposition of Entry in Electoral Roll",
        "purpose": "Used when boundaries of constituencies are redrawn or when voter relocates within same district. Transfers voter entry from one roll to another without deletion and re-registration.",
        "who_can_apply": [
            "Voters whose constituency boundaries changed",
            "Voters who relocated to adjacent constituency",
            "Voters transferring between constituencies in same district"
        ],
        "documents_required": [
            "Original Form 8A filled and signed",
            "Voter ID/EPIC from current constituency",
            "Proof of new residence address",
            "Aadhaar card (recommended)",
            "Any identity proof"
        ],
        "procedure_steps": [
            "Collect Form 8A from BLO or download from NVSP.IN",
            "Fill form with current voter ID and details",
            "Mention new constituency/assembly",
            "Provide new residence address with proof",
            "Sign the form",
            "Submit to BLO of old constituency or new constituency",
            "BLO will transfer entry to new roll",
            "Entry removed from old roll, added to new roll",
            "New voter ID will be generated if needed"
        ],
        "processing_time": "5-7 days",
        "online_available": True,
        "online_process": "Submit via NVSP. Transposition processed after address verification.",
        "offline_process": "Submit to BLO with address proof. Transfer completed in system.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Transposition preserves continuous voter status. Preferred over deletion and re-registration.",
        "advantage": "Maintains voter ID continuity. No gap in voter roll. Faster than Form 6/7"
    },
    {
        "form_id": "12",
        "form_name": "Form 12",
        "title": "Application for Postal Ballot - Government Employees",
        "purpose": "Allows government employees to vote via postal ballot when they cannot reach polling station on election day due to official duties.",
        "who_can_apply": [
            "Government employees (Central/State/Local)",
            "Armed forces personnel",
            "Paramilitary personnel",
            "Election duty staff (if on duty)",
            "Healthcare workers on duty"
        ],
        "documents_required": [
            "Application on Form 12",
            "Voter ID/EPIC",
            "Official letter from employer confirming polling day duty",
            "Identity proof",
            "Address proof"
        ],
        "procedure_steps": [
            "Collect Form 12 from BLO or election office",
            "Fill with voter ID and reason (official duty on polling day)",
            "Attach official letter from employer confirming duty",
            "Submit to Election Officer within specified time (usually before election)",
            "Election Officer will verify duty status",
            "Approval letter will be issued",
            "Voter receives ballot paper and envelope",
            "Voter marks choice in secrecy and seals envelope",
            "Envelope submitted back before voting closes"
        ],
        "processing_time": "Within 7 days of application",
        "online_available": False,
        "offline_process": "Submit to Election Officer office. Receive ballot in person or by mail.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Postal ballot must be submitted before counting begins. Cannot vote at regular polling station.",
        "validity": "Valid only if duty is confirmed by employer"
    },
    {
        "form_id": "12A",
        "form_name": "Form 12A",
        "title": "Application for Postal Ballot - Essential Services",
        "purpose": "Allows personnel in essential services (doctors, nurses, police, firefighters) to vote via postal ballot when on duty during elections.",
        "who_can_apply": [
            "Healthcare workers (doctors, nurses, paramedics)",
            "Police and security personnel",
            "Firefighters",
            "Transport workers",
            "Utility service workers",
            "Other essential service employees on election duty"
        ],
        "documents_required": [
            "Application on Form 12A",
            "Voter ID/EPIC",
            "Certificate from employer confirming duty roster",
            "Identity proof",
            "Employment proof"
        ],
        "procedure_steps": [
            "Obtain Form 12A from BLO or Election Officer",
            "Fill form with voter details and duty confirmation",
            "Attach employer's letter confirming duty assignment",
            "Submit to Election Officer before deadline",
            "Election Officer verifies duty status",
            "Upon approval, receive ballot papers",
            "Mark ballot in secrecy and seal",
            "Return sealed ballot to Election Officer before voting closes"
        ],
        "processing_time": "Within 7 days",
        "online_available": False,
        "offline_process": "Submit to Election Officer. Collect ballot and return sealed.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Proof of duty from employer is mandatory. Ballot must be received and returned on same day.",
        "note": "Designed specifically for frontline workers on polling day shifts"
    },
    {
        "form_id": "12D",
        "form_name": "Form 12D",
        "title": "Application for Postal Ballot - Senior Citizens (85+) and Persons with Disabilities",
        "purpose": "Allows senior citizens above 85 years and persons with disabilities to vote via postal ballot due to difficulty in reaching polling station.",
        "who_can_apply": [
            "Indian citizens aged 85 years and above",
            "Persons with physical disabilities preventing polling station visit",
            "Persons with visual impairment",
            "Persons confined to bed due to chronic illness",
            "Caregivers of eligible persons with disabilities"
        ],
        "documents_required": [
            "Application on Form 12D",
            "Voter ID/EPIC",
            "Age proof: Birth certificate, passport, Aadhaar",
            "Medical certificate (for disability cases) - not older than 1 year",
            "Identity proof",
            "Address proof"
        ],
        "procedure_steps": [
            "Collect Form 12D from BLO or Election Officer",
            "Fill with voter ID and supporting documents",
            "Attach age proof or medical certificate as applicable",
            "Medical certificate must be from registered medical practitioner",
            "Submit to Election Officer or BLO",
            "Officer verifies eligibility from documents",
            "Ballot papers sent to home address or collected in person",
            "Voter marks choice in secrecy at home",
            "Ballot returned to Election Officer or collected by official"
        ],
        "processing_time": "Within 3-5 days",
        "online_available": False,
        "offline_process": "Submit form with documents. BLO may visit home to deliver/collect ballot.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Most voter-friendly process. Ballot delivery/collection at home possible.",
        "eligibility": "Postal ballot encouraged for 80+ age group even if not mandatory"
    },
    {
        "form_id": "13",
        "form_name": "Forms 13, 13A, 13B, 13C",
        "title": "Declarations for Postal Ballot",
        "purpose": "Supporting documents for postal ballot applications. Different forms for different categories of voters and various certifications needed.",
        "who_can_apply": [
            "Postal ballot applicants (various categories)",
            "Persons certifying postal ballot eligibility",
            "Postal ballot voting agents"
        ],
        "documents_required": [
            "Form 13: Self-declaration of postal ballot voter",
            "Form 13A: Declaration by employer/officer",
            "Form 13B: Certificate from medical practitioner",
            "Form 13C: Ballot paper account"
        ],
        "procedure_steps": [
            "Use Form 13: Self-declare reasons for postal ballot",
            "Use Form 13A: Employer certifies duty assignment",
            "Use Form 13B: Doctor certifies disability/age-related issues",
            "Use Form 13C: Track ballot paper distribution and submission",
            "Submit with Form 12/12A/12D",
            "Forms must be signed and dated",
            "Notarization required in some cases"
        ],
        "processing_time": "Immediate with main application",
        "online_available": False,
        "offline_process": "Submit with postal ballot application forms",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "Supporting documents essential for postal ballot approval"
    },
    {
        "form_id": "EPIC",
        "form_name": "EPIC Card Application",
        "title": "Elector's Photo Identity Card",
        "purpose": "EPIC (Voter ID) is an official identity card issued by Election Commission. Serves as proof of voter registration and can be used as identity/address proof for various government purposes.",
        "who_can_apply": [
            "All registered voters",
            "Any Indian citizen aged 18+"
        ],
        "documents_required": [
            "Proof of registration: Voter roll extract or acknowledgment",
            "Age proof: Birth certificate, passport, school certificate",
            "Address proof: Utility bills, rental agreement, Aadhaar",
            "Two passport-size colored photographs",
            "Identity proof: Aadhaar, passport, driving license"
        ],
        "procedure_steps": [
            "Register as voter using Form 6",
            "Collect voter roll extract after registration",
            "Visit EPIC issuance center (usually BLO office)",
            "Fill EPIC application form",
            "Submit with voter registration proof and documents",
            "Provide biometric details if required",
            "Photos scanned and details entered",
            "Application processed within 3-5 days",
            "Collect EPIC card from office or home delivery arranged"
        ],
        "processing_time": "5-7 days",
        "online_available": False,
        "offline_process": "Apply at BLO office. Document verification and card issuance at office.",
        "official_url": "https://voters.eci.gov.in",
        "remarks": "EPIC is free and optional but recommended. Accepted as photo ID at banks, airports.",
        "validity": "10 years from date of issuance. Can be renewed."
    }
]

# Common procedures information
COMMON_PROCEDURES: Dict[str, Any] = {
    "voter_registration": {
        "title": "Voter Registration Process",
        "steps": [
            "Collect Form 6 from BLO office or download from NVSP.IN",
            "Fill all personal details accurately (name, father's name, DOB, address)",
            "Paste two passport-size photographs",
            "Gather supporting documents (ID proof, address proof, age proof)",
            "Submit Form 6 online via NVSP or to BLO office",
            "BLO verifies documents and enters in system",
            "Your name appears in draft electoral roll (21-day display)",
            "After objection period, added to final roll",
            "Receive voter ID/EPIC"
        ],
        "documents": ["Proof of citizenship", "Proof of age", "Proof of residence", "2 photos"],
        "time": "7-21 days",
        "links": ["https://nvsp.in", "https://voters.eci.gov.in"]
    },
    "correction_of_entries": {
        "title": "Correcting Voter Roll Entries",
        "steps": [
            "Identify the error (spelling, DOB, name, address, father's name)",
            "Collect Form 8 from BLO office",
            "Fill form with voter ID and error details",
            "Provide correct information with supporting document",
            "Submit to BLO office or NVSP",
            "BLO verifies with submitted document",
            "Correction approved and updated in system",
            "Confirmation provided to voter"
        ],
        "errors_that_can_be_corrected": ["Name spelling", "Date of birth", "Father's/Husband's name", "Address details"],
        "time": "3-7 days",
        "form": "Form 8"
    },
    "deletion_from_roll": {
        "title": "Deletion from Electoral Roll",
        "reasons": ["Moved to another constituency", "Death", "Loss of eligibility", "Duplicate entries"],
        "steps": [
            "Submit Form 7 to BLO office",
            "Provide reason and supporting documents",
            "For death: Provide death certificate and heir identification",
            "For relocation: Register in new constituency (Form 6) first",
            "Submit Form 7 with proof",
            "BLO verifies and processes deletion",
            "Name removed from electoral roll"
        ],
        "time": "7-10 days",
        "note": "Before deleting, ensure registered in new constituency"
    },
    "postal_ballot": {
        "title": "Postal Ballot Process",
        "eligible": [
            "Government/military employees on duty",
            "Essential services workers on duty",
            "Senior citizens (80+)",
            "Persons with disabilities"
        ],
        "steps": [
            "Collect appropriate form: 12, 12A, or 12D",
            "Fill with voter ID and eligibility details",
            "Attach supporting documents (duty letter, medical cert, etc.)",
            "Submit to Election Officer within deadline",
            "Officer verifies eligibility",
            "Ballot papers sent to home or collected",
            "Mark choice in secrecy and seal",
            "Return to officer before counting begins"
        ],
        "forms": ["Form 12 (govt employees)", "Form 12A (essential services)", "Form 12D (senior/disabled)"]
    },
    "transposition": {
        "title": "Transposition of Voter Entry",
        "when_needed": [
            "Constituency boundaries redrawn",
            "Voter relocated to adjacent constituency",
            "Transfer between constituencies in same district"
        ],
        "steps": [
            "Collect Form 8A from BLO",
            "Fill with current voter ID",
            "Provide new address with proof",
            "Submit to BLO of either old or new constituency",
            "BLO transfers entry to new roll",
            "Entry removed from old, added to new roll",
            "New voter ID generated if needed"
        ],
        "time": "5-7 days",
        "advantage": "Maintains voter continuity (no gap)"
    }
}

# Official links
OFFICIAL_LINKS: Dict[str, Dict[str, str]] = {
    "primary": {
        "voter_portal": "https://voters.eci.gov.in",
        "find_polling_booth": "https://electoralsearch.eci.gov.in",
        "main_eci": "https://eci.gov.in",
        "nvsp": "https://nvsp.in",
        "sveep": "https://ecisveep.nic.in"
    },
    "forms_and_downloads": {
        "form_6": "https://voters.eci.gov.in/forms/form6",
        "form_7": "https://voters.eci.gov.in/forms/form7",
        "form_8": "https://voters.eci.gov.in/forms/form8",
        "form_12": "https://voters.eci.gov.in/forms/form12",
        "all_forms": "https://eci.gov.in/election-forms"
    },
    "resources": {
        "voter_helpline": "1950 (toll-free)",
        "eci_website": "https://eci.gov.in",
        "stat_reports": "https://eci.gov.in/statistical-reports",
        "election_news": "https://eci.gov.in/news",
        "youtube_channel": "https://www.youtube.com/user/ECIIndiaOfficial"
    },
    "state_resources": {
        "state_elections": "https://eci.gov.in/state-election-commissions",
        "ro_offices": "https://voters.eci.gov.in/ro-ao-offices"
    }
}


# Endpoints

@router.get("/")
async def list_all_forms() -> Dict[str, Any]:
    """
    Get list of all available forms with basic information.
    """
    forms_list = [
        {
            "form_id": form["form_id"],
            "form_name": form["form_name"],
            "title": form["title"],
            "purpose": form["purpose"],
            "online_available": form.get("online_available", False)
        }
        for form in FORMS_DATABASE
    ]
    return {
        "total_forms": len(forms_list),
        "forms": forms_list
    }


@router.get("/{form_id}")
async def get_form_details(form_id: str) -> Dict[str, Any]:
    """
    Get complete details of a specific form.
    
    Example: /api/forms/6 (for Form 6)
    """
    form = next((f for f in FORMS_DATABASE if f["form_id"] == form_id), None)
    if not form:
        raise HTTPException(status_code=404, detail=f"Form {form_id} not found")
    return form


@router.get("/search")
async def search_forms(q: str = Query(..., min_length=2, description="Search query")) -> Dict[str, Any]:
    """
    Search forms by keyword.
    
    Search in: form name, title, purpose, documents required
    Example: /api/forms/search?q=registration
    """
    query = q.lower()
    results = []
    
    for form in FORMS_DATABASE:
        # Search in multiple fields
        if (query in form.get("form_name", "").lower() or
            query in form.get("title", "").lower() or
            query in form.get("purpose", "").lower() or
            any(query in doc.lower() for doc in form.get("documents_required", []))):
            results.append({
                "form_id": form["form_id"],
                "form_name": form["form_name"],
                "title": form["title"],
                "relevance": "high" if query in form["form_name"].lower() else "medium"
            })
    
    if not results:
        raise HTTPException(status_code=404, detail=f"No forms found matching '{q}'")
    
    return {
        "search_query": q,
        "results_found": len(results),
        "results": results
    }


@router.get("/categories/procedures")
async def get_procedures() -> Dict[str, Any]:
    """
    Get information about common election procedures.
    
    Includes: voter registration, corrections, deletion, postal ballot, transposition
    """
    return {
        "total_procedures": len(COMMON_PROCEDURES),
        "procedures": COMMON_PROCEDURES
    }


@router.get("/categories/links")
async def get_official_links() -> Dict[str, Dict[str, str]]:
    """
    Get curated list of official Election Commission links.
    """
    return {
        "official_links": OFFICIAL_LINKS,
        "voter_helpline": "1950",
        "helpline_description": "Toll-free helpline for voter queries. Available during election period."
    }


@router.get("/categories/helpline")
async def get_helpline_info() -> Dict[str, Any]:
    """
    Get voter helpline and support information.
    """
    return {
        "voter_helpline": "1950",
        "toll_free": True,
        "description": "Election Commission of India's toll-free helpline for voter assistance",
        "services": [
            "Help with voter registration (Form 6)",
            "Polling booth location",
            "Electoral roll corrections",
            "Postal ballot information",
            "Voter ID/EPIC application",
            "Election schedule and dates",
            "Query resolution and complaints"
        ],
        "available_during": "Election period and throughout the year",
        "also_available": "WhatsApp, email, and web portal at https://voters.eci.gov.in"
    }


@router.get("/guide/registration")
async def voter_registration_guide() -> Dict[str, Any]:
    """
    Complete voter registration guide for new voters.
    """
    return {
        "title": "Voter Registration Guide",
        "eligibility": [
            "Indian citizen",
            "Age 18 years or above",
            "Not convicted of electoral offence",
            "Not disqualified under law"
        ],
        "document_categories": {
            "proof_of_citizenship": [
                "Passport",
                "Birth certificate",
                "School/College certificate",
                "Aadhaar card",
                "PAN card"
            ],
            "proof_of_age": [
                "Birth certificate",
                "School/College certificate",
                "Passport",
                "Aadhaar"
            ],
            "proof_of_residence": [
                "Utility bill (electricity, water, gas)",
                "Rental agreement",
                "Bank statement",
                "Insurance policy",
                "Municipal corporation records",
                "Aadhaar card"
            ]
        },
        "online_registration": "https://nvsp.in",
        "offline_process": "Contact local BLO (Booth Level Officer)",
        "time_to_register": "Before election announcement",
        "cutoff_date": "Usually 3 months before elections"
    }


@router.get("/guide/corrections")
async def voter_correction_guide() -> Dict[str, Any]:
    """
    Guide for correcting errors in voter roll.
    """
    return {
        "title": "Voter Roll Correction Guide",
        "form_to_use": "Form 8",
        "errors_that_can_be_corrected": {
            "name_spelling": "Correct spelling of voter's name",
            "date_of_birth": "Corrected date of birth",
            "father_name": "Father's or husband's name",
            "address": "Current address",
            "gender": "Gender if incorrectly entered"
        },
        "errors_that_cannot_be_corrected": [
            "Voter ID number",
            "Constituency assignment (use Form 8A for transposition)"
        ],
        "documents_required": [
            "Voter ID/EPIC",
            "Document proving correct information",
            "Form 8 properly filled and signed"
        ],
        "submission": "Online via NVSP or offline to BLO",
        "processing_time": "3-7 days"
    }


@router.get("/comparison")
async def form_comparison() -> Dict[str, Any]:
    """
    Comparison of different forms for different situations.
    """
    return {
        "new_voter": {"form": "6", "title": "Form 6", "purpose": "First-time voter registration"},
        "correction": {"form": "8", "title": "Form 8", "purpose": "Correct errors in voter roll"},
        "relocation": {"form": "8A or 6+7", "title": "Form 8A or Form 6+7", "purpose": "Move to different constituency"},
        "deletion": {"form": "7", "title": "Form 7", "purpose": "Remove name from roll"},
        "overseas": {"form": "6A", "title": "Form 6A", "purpose": "Register as overseas voter"},
        "aadhar_link": {"form": "6B", "title": "Form 6B", "purpose": "Link Aadhaar with voter ID"},
        "postal_ballot_govt": {"form": "12", "title": "Form 12", "purpose": "Government employee voting by mail"},
        "postal_ballot_essential": {"form": "12A", "title": "Form 12A", "purpose": "Essential worker voting by mail"},
        "postal_ballot_senior": {"form": "12D", "title": "Form 12D", "purpose": "Senior/disabled voter voting by mail"},
    }

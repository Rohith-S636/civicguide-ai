'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { CheckCircle, Share2, Download, ArrowLeft, ArrowRight } from 'lucide-react';

type Stage = 1|2|3|4|5|6|7|8;

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: 'Polling Day Simulation',
    next: 'Next',
    back: 'Back',
    stage: 'Stage',
    before: 'Before Election Day',
    finding: 'Finding Your Polling Booth',
    arriving: 'Arriving at the Booth',
    verification: 'Verification Process',
    evm: 'The EVM',
    after: 'After Voting',
    counting: 'Counting Day',
    certificate: 'Certificate',
    haveDocs: 'I have my documents',
    findBooth: 'Enter your Voter ID number or Aadhaar',
    showBooth: 'Your Booth',
    boothDistance: 'Your Booth is 0.8 km away',
    showId: 'Show up with your photo ID',
    serialNumber: 'Look for your serial number on the voter list',
    mistakes: 'Common mistakes to avoid',
    findName: 'Find your name on the list',
    showYourId: 'Show your ID to the polling officer',
    inkFinger: 'Indelible ink applied on finger',
    slipIssued: 'Slip (ballot slip) issued',
    indelibleFact: 'Did you know? Indelible ink was developed to prevent double voting and dates back to early 20th century practices.',
    voteSecret: 'Your vote is secret. No one can trace it to you.',
    afterThanks: 'Thanks for voting — encourage 3 friends to vote!',
    countingExplain: 'Votes are counted once polls close. EVMs are opened and VVPAT slips matched.',
    certificateCongrats: 'You completed the Polling Day Simulation!',
    download: 'Download Certificate',
    share: 'Share',
    xpAward: 'You earned 50 XP!',
  },
  hi: {
    title: 'मतदान दिवस सिमुलेशन',
    next: 'आगे',
    back: 'पीछे',
    stage: 'चरण',
    before: 'निर्वाचन से पहले',
    finding: 'अपने मतदान केंद्र का पता लगाना',
    arriving: 'मतदान केंद्र पर पहुंचना',
    verification: 'सत्यापन प्रक्रिया',
    evm: 'EVM',
    after: 'मतदान के बाद',
    counting: 'गणना दिवस',
    certificate: 'प्रमाण पत्र',
    haveDocs: 'मेरे पास दस्तावेज़ हैं',
    findBooth: 'अपना वोटर आईडी या आधार दर्ज करें',
    showBooth: 'आपका मतदान केंद्र',
    boothDistance: 'आपका मतदान केंद्र 0.8 किमी दूर है',
    showId: 'अपना फोटो आईडी साथ लाएं',
    serialNumber: 'मतदाता सूची पर अपना क्रम संख्या देखें',
    mistakes: 'सामान्य गलतियाँ जिन्हें टालें',
    findName: 'सूची में अपना नाम ढूंढें',
    showYourId: 'अपना आईडी दिखाएँ',
    inkFinger: 'अटूट स्याही उंगली पर लगाई जाती है',
    slipIssued: 'स्लिप (बैलट स्लिप) जारी की जाती है',
    indelibleFact: 'क्या आप जानते हैं? अटूट स्याही का उपयोग दो बार मतदान रोकने के लिए किया जाता है।',
    voteSecret: 'आपका वोट गुप्त है। इसे किसी से जोड़ा नहीं जा सकता।',
    afterThanks: 'मतदान के लिए धन्यवाद — 3 मित्रों को वोट देने के लिए प्रेरित करें!',
    countingExplain: 'पोल बंद होने के बाद वोट गिने जाते हैं। EVM खोले जाते हैं और VVPAT मिलान किया जाता है।',
    certificateCongrats: 'आपने मतदान दिवस सिमुलेशन पूरा किया!',
    download: 'प्रमाण पत्र डाउनलोड करें',
    share: 'शेयर करें',
    xpAward: 'आपने 50 XP कमाए!',
  },
  te: {},
  ta: {},
};

// 12 approved photo ID documents list (shortened text keys)
const ID_DOCS = [
  'Electors Photo Identity Card (EPIC)',
  'Passport',
  'Driving Licence',
  'Service Identity Card with photograph',
  'Passbook with photograph issued by Bank/Post Office',
  'PAN Card',
  'Smart Card issued by RGI under NPR',
  'MNREGA Job Card',
  'Health Insurance Smart Card',
  'Pension document with photograph',
  'Income Tax Identity Card',
  'Any other Government approved photo ID',
];

const mockBooth = {
  name: 'Govt. Primary School Polling Station',
  address: 'Ward 12, Near Main Road, Your City, State',
  timing: '7:00 AM - 6:00 PM',
};

const mockCandidates = [
  { id: 'c1', name: 'Asha Verma', party: 'ABC' },
  { id: 'c2', name: 'Ramesh Kumar', party: 'XYZ' },
  { id: 'c3', name: 'S. Rao', party: 'LMN' },
  { id: 'c4', name: 'Priya Singh', party: 'PQR' },
  { id: 'c5', name: 'M. Patel', party: 'DEF' },
];

const sampleCounting = [
  { name: 'Asha Verma', votes: 120 },
  { name: 'Ramesh Kumar', votes: 95 },
  { name: 'S. Rao', votes: 60 },
  { name: 'Priya Singh', votes: 40 },
  { name: 'M. Patel', votes: 30 },
];

export default function SimulationPage() {
  const [stage, setStage] = useState<Stage>(1);
  const [lang, setLang] = useState<'en'|'hi'|'te'|'ta'>('en');
  const t = (key: string) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  // Stage 1
  const [hasDocs, setHasDocs] = useState(false);

  // Stage 2
  const [idInput, setIdInput] = useState('');
  const [boothFound, setBoothFound] = useState(false);

  // Stage 5 - EVM
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showVvpat, setShowVvpat] = useState(false);
  const [voted, setVoted] = useState(false);

  // XP
  const [xp, setXp] = useState(0);

  // Certificate ref
  const certRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // reset EVM when moving back to stage 5
    if (stage !== 5) {
      setSelectedCandidate(null);
      setShowVvpat(false);
    }
  }, [stage]);

  const next = () => {
    if (stage === 1 && !hasDocs) {
      toast('Please confirm you have your documents');
      return;
    }
    if (stage === 2 && !boothFound) {
      toast('Please find your polling booth');
      return;
    }
    if (stage < 8) setStage((s) => (s + 1) as Stage);
    if (stage === 7) {
      // moving to certificate
      setTimeout(() => {
        setXp(50);
        toast.success(t('xpAward'));
      }, 300);
    }
  };

  const back = () => {
    if (stage > 1) setStage((s) => (s - 1) as Stage);
  };

  const findBooth = () => {
    // mock booth lookup
    if (idInput.trim().length >= 3) {
      setBoothFound(true);
      toast.success('Booth found');
    } else {
      setBoothFound(false);
      toast.error('No record found');
    }
  };

  const handleVote = (candidateId: string) => {
    if (voted) return;
    setSelectedCandidate(candidateId);
    setShowVvpat(true);

    // show VVPAT slip for 7 seconds then confirm vote
    setTimeout(() => {
      setShowVvpat(false);
      setVoted(true);
      toast.success('Vote recorded');
    }, 7000);
  };

  const downloadCertificate = async () => {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2 });
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'civicguide-certificate.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      toast.error('Failed to generate PNG');
    }
  };

  const shareCertificate = async () => {
    if (navigator.share && certRef.current) {
      try {
        // attempt to share a simple text + url; full image sharing may need blob handling
        await navigator.share({
          title: 'Polling Day Simulation Certificate',
          text: 'I completed the Polling Day Simulation on CivicGuide AI!',
        });
        toast.success('Shared');
      } catch (e) {
        toast.error('Share cancelled');
      }
    } else {
      // fallback: copy message to clipboard
      const text = 'I completed the Polling Day Simulation on CivicGuide AI!';
      await navigator.clipboard.writeText(text);
      toast.success('Message copied to clipboard');
    }
  };

  const progressPercent = Math.round(((stage - 1) / 7) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-sm text-gray-600">An interactive walkthrough of polling day procedures</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'hi' | 'te' | 'ta')}
              className="border rounded px-2 py-1"
              aria-label="Select simulation language"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="te">TE</option>
              <option value="ta">TA</option>
            </select>
            <div className="text-sm text-gray-500">{t('stage')} {stage}/8</div>
          </div>
        </header>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-saffron to-orange-400" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        <main>
          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.section key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('before')}</h2>
                <p className="text-sm text-gray-700 mb-4">Checklist: Do you have your Voter ID / Aadhaar / any of the 12 approved photo ID documents?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {ID_DOCS.map((d) => (
                    <div key={d} className="p-3 border rounded bg-gray-50 text-sm">{d}</div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 mt-2">
                  <input
                    id="has-docs"
                    type="checkbox"
                    checked={hasDocs}
                    onChange={(e) => setHasDocs(e.target.checked)}
                    className="w-5 h-5"
                    aria-label="I have my documents"
                  />
                  <span className="ml-2">{t('haveDocs')}</span>
                </label>
              </motion.section>
            )}

            {stage === 2 && (
              <motion.section key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('finding')}</h2>
                <p className="text-sm text-gray-700 mb-4">{t('findBooth')}</p>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <label htmlFor="id-input" className="sr-only">
                      EPIC or Aadhaar number
                    </label>
                    <input
                      id="id-input"
                      value={idInput}
                      onChange={(e) => setIdInput(e.target.value)}
                      placeholder="EPIC / Aadhaar"
                      inputMode="text"
                      autoComplete="off"
                      minLength={3}
                      pattern="[A-Za-z0-9\-\s]{3,}"
                      className="w-full border rounded px-3 py-2"
                      aria-describedby="id-input-help"
                      aria-invalid={idInput.length > 0 && idInput.trim().length < 3}
                    />
                    <p id="id-input-help" className="sr-only">
                      Enter a voter ID or Aadhaar reference to look up the polling booth.
                    </p>
                  </div>
                  <button onClick={findBooth} className="px-4 py-2 rounded bg-saffron text-white" aria-label="Find polling booth">
                    Find
                  </button>
                </div>

                {boothFound && (
                  <div className="border p-4 rounded bg-gray-50">
                    <h3 className="font-semibold">{mockBooth.name}</h3>
                    <p className="text-sm text-gray-600">{mockBooth.address}</p>
                    <p className="text-sm text-gray-600">Timing: {mockBooth.timing}</p>
                    <p className="text-sm text-slate-700 mt-3">{t('boothDistance')}</p>
                    <a className="text-xs text-blue-600 mt-2 inline-block" href="https://electoralsearch.eci.gov.in" target="_blank" rel="noreferrer">Search on ECI portal</a>
                  </div>
                )}

                {!boothFound && (
                  <div className="p-3 text-sm text-gray-500">Enter a sample ID like "ABC123" to see a mock booth.</div>
                )}

                <div className="mt-4 h-40 bg-white border rounded flex items-center justify-center">
                  <div className="text-center text-gray-400">[Map placeholder] — {t('boothDistance')}</div>
                </div>
              </motion.section>
            )}

            {stage === 3 && (
              <motion.section key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('arriving')}</h2>
                <div className="flex gap-4 flex-col md:flex-row">
                  <div className="flex-1">
                    {/* simple SVG queue illustration */}
                    <svg viewBox="0 0 600 200" className="w-full h-44 mb-4">
                      <rect x="10" y="60" width="180" height="80" rx="8" fill="#f3f4f6" />
                      <text x="20" y="100" fill="#111827" fontSize="14">Polling Booth</text>
                      <g transform="translate(220,40)">
                        <circle cx="20" cy="40" r="16" fill="#ffb347" />
                        <rect x="50" y="20" width="16" height="40" fill="#94a3b8" />
                        <circle cx="90" cy="40" r="16" fill="#ffb347" />
                        <rect x="110" y="20" width="16" height="40" fill="#94a3b8" />
                        <text x="0" y="90" fill="#374151" fontSize="12">Queue</text>
                      </g>
                    </svg>

                    <ul className="list-disc ml-5 text-sm text-gray-700">
                      <li>{t('showId')}</li>
                      <li>{t('serialNumber')}</li>
                    </ul>
                  </div>

                  <div className="w-full md:w-64">
                    <div className="p-4 border rounded bg-red-50 text-red-800">
                      <h4 className="font-semibold mb-2">{t('mistakes')}</h4>
                      <ul className="text-sm">
                        <li>- Arriving without ID</li>
                        <li>- Trying to influence others inside the booth</li>
                        <li>- Carrying prohibited materials</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {stage === 4 && (
              <motion.section key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('verification')}</h2>
                <div className="flex gap-6">
                  <div className="flex-1">
                    {/* officer checking list animation (simple) */}
                    <div className="p-4 rounded border bg-gray-50">
                      <p className="text-sm mb-2">1. {t('findName')}</p>
                      <p className="text-sm mb-2">2. {t('showYourId')}</p>
                      <p className="text-sm mb-2">3. {t('inkFinger')}</p>
                      <p className="text-sm">4. {t('slipIssued')}</p>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                      <p className="text-sm font-semibold">{t('indelibleFact')}</p>
                    </div>
                  </div>

                  <div className="w-40 h-40 bg-white border rounded flex items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#fde68a" />
                      <rect x="8" y="6" width="8" height="2" fill="#92400e" />
                      <rect x="7" y="10" width="10" height="6" rx="1" fill="#92400e" />
                    </svg>
                  </div>
                </div>
              </motion.section>
            )}

            {stage === 5 && (
              <motion.section key="s5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('evm')}</h2>
                <p className="text-sm text-gray-700 mb-4">{t('voteSecret')}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {mockCandidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleVote(c.id)}
                        disabled={voted}
                        className={`w-full text-left p-3 rounded border ${selectedCandidate===c.id? 'bg-green-50 border-green-300':'bg-white border-gray-200'} hover:bg-gray-50`}
                        aria-label={`Vote for ${c.name}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.party}</div>
                          </div>
                          <div className="text-sm text-gray-400">Press to vote</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 border rounded">
                    <div className="w-full h-40 flex items-center justify-center">
                      {!showVvpat && !voted && (
                        <div className="text-sm text-gray-500">Click a candidate to see VVPAT slip for 7s</div>
                      )}

                      {showVvpat && selectedCandidate && (
                        <div className="p-4 bg-white border rounded shadow text-center">
                          <div className="font-semibold mb-2">VVPAT Slip</div>
                          <div className="text-sm text-gray-700">You selected: {mockCandidates.find(x=>x.id===selectedCandidate)?.name}</div>
                          <div className="text-xs text-gray-400 mt-2">This slip prints for verification only</div>
                        </div>
                      )}

                      {voted && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
                          <CheckCircle className="mx-auto mb-2 text-green-600" />
                          <div className="font-semibold">Vote Confirmed</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600">{t('voteSecret')}</div>
                  </div>
                </div>
              </motion.section>
            )}

            {stage === 6 && (
              <motion.section key="s6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('after')}</h2>
                <div className="flex gap-4 items-center">
                  <div className="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-white">
                    {/* Ink mark illustration */}
                    <div className="w-10 h-10 bg-indigo-700 rounded-full opacity-90" />
                  </div>

                  <div>
                    <p className="font-semibold">{t('inkFinger')}</p>
                    <p className="text-sm text-gray-600">{t('afterThanks')}</p>

                    <div className="mt-3">
                      <Image
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent('vote-confirmed:'+ (idInput||'anonymous'))}&size=120x120`}
                        alt="qr"
                        width={120}
                        height={120}
                        loading="lazy"
                      />
                      <p className="text-xs text-gray-500 mt-2">QR to verify vote recorded (mock)</p>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {stage === 7 && (
              <motion.section key="s7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">{t('counting')}</h2>
                <p className="text-sm text-gray-700 mb-4">{t('countingExplain')}</p>

                <div className="space-y-4">
                  {sampleCounting.map((c, i) => {
                    const max = Math.max(...sampleCounting.map(s=>s.votes));
                    const pct = Math.round((c.votes / (max || 1)) * 100);
                    return (
                      <div key={c.name} className="flex items-center gap-3">
                        <div className="w-32 text-sm">{c.name}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                        </div>
                        <div className="w-12 text-sm text-right">{c.votes}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 text-sm text-gray-500">EVMs are opened and VVPAT slips audited. Official results announced per schedule.</div>
              </motion.section>
            )}

            {stage === 8 && (
              <motion.section key="s8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-6 rounded-lg shadow text-center">
                <h2 className="text-xl font-semibold mb-4">{t('certificate')}</h2>

                <div ref={certRef} className="inline-block p-6 bg-gradient-to-br from-white to-gray-50 border rounded shadow-lg">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-saffron">🎖️</div>
                    <h3 className="text-lg font-semibold mt-2">{t('certificateCongrats')}</h3>
                    <p className="text-sm text-gray-600">{t('xpAward')}</p>
                  </div>

                  <div className="mt-4 text-left">
                    <p className="text-sm">Name: <span className="font-semibold">{idInput || 'Guest Voter'}</span></p>
                    <p className="text-sm">Simulation: Polling Day Walkthrough</p>
                    <p className="text-sm">XP Awarded: <span className="font-semibold">50</span></p>
                    <p className="text-xs text-gray-400 mt-3">CivicGuide AI — Learn, vote, repeat.</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button onClick={downloadCertificate} className="px-4 py-2 bg-white border rounded flex items-center gap-2" aria-label="Download certificate as image"><Download className="w-4 h-4" aria-hidden="true" /> {t('download')}</button>
                  <button onClick={shareCertificate} className="px-4 py-2 bg-saffron text-white rounded flex items-center gap-2" aria-label="Share certificate"><Share2 className="w-4 h-4" aria-hidden="true" /> {t('share')}</button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* Navigation */}
        <footer className="mt-6 flex items-center justify-between">
          <div>
            <button onClick={back} disabled={stage===1} className="px-3 py-2 rounded border flex items-center gap-2" aria-disabled={stage===1} aria-label="Previous stage"><ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('back')}</button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">{Math.round(progressPercent)}% complete</div>
            <button onClick={next} className="px-4 py-2 rounded bg-saffron text-white flex items-center gap-2" aria-label="Next stage">{t('next')} <ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
          </div>
        </footer>
      </div>
    </div>
  );
}

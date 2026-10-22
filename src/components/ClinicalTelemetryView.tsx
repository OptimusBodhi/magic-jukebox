'use client';

import React, { useState } from 'react';
import {
  Activity,
  Clock,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  FileSpreadsheet,
  BellRing,
  PlusCircle,
  Play,
  HeartPulse,
  Stethoscope,
  Copy,
  ShieldAlert,
  Code2,
} from 'lucide-react';
import {
  BARS_SCALE_DEFINITIONS,
  OBSERVED_BEHAVIORAL_SIGNS,
  ObservedBehavioralSignId,
  BarsSessionLog,
  BiographicalTrack,
  IsoTrajectoryResult,
  PatientProfile,
} from '@/lib/iso-sequencer';
import { buildFhirR4EpicBundle } from '@/lib/fhir-epic-adapter';

interface ClinicalTelemetryViewProps {
  patient: PatientProfile;
  trajectory: IsoTrajectoryResult;
  library: BiographicalTrack[];
  quarantinedList: Array<{
    id: string;
    title: string;
    artist: string;
    year: number;
    reason: string;
  }>;
  logs: BarsSessionLog[];
  onAddLog: (log: BarsSessionLog) => void;
  onUpdateSundowningTime: (peakTime: string) => void;
  onTriggerSundowningShieldNow: () => void;
}

export default function ClinicalTelemetryView({
  patient,
  trajectory,
  library,
  quarantinedList,
  logs,
  onAddLog,
  onUpdateSundowningTime,
  onTriggerSundowningShieldNow,
}: ClinicalTelemetryViewProps) {
  const [preBars, setPreBars] = useState<number>(6);
  const [postBars, setPostBars] = useState<number>(4);
  const [triggerContext, setTriggerContext] = useState<string>(
    'Late-Afternoon Sundowning Pacing (4:00 PM Proactive Shield)'
  );
  const [prnAvoided, setPrnAvoided] = useState<boolean>(true);
  const [observedSigns, setObservedSigns] = useState<ObservedBehavioralSignId[]>([
    'pacing_settled',
    'smiling_calm',
  ]);
  const [caregiverStressBefore, setCaregiverStressBefore] = useState<number>(4);
  const [caregiverStressAfter, setCaregiverStressAfter] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [ehrViewTab, setEhrViewTab] = useState<'flowsheet' | 'fhir_json'>('flowsheet');

  const epicRecord = buildFhirR4EpicBundle(
    patient,
    trajectory,
    library,
    quarantinedList,
    logs
  );

  const handleCopyFhirJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(epicRecord.fhirBundle, null, 2));
      setSavedNotice('Copied standardized HL7 FHIR R4 Bundle JSON (Epic / SMART on FHIR) to clipboard!');
      setTimeout(() => setSavedNotice(null), 5000);
    } catch {
      // Ignore clipboard error
    }
  };

  // Compute proactive trigger time (30 minutes prior to peak Time)
  const computeProactiveStartTime = (peakTimeStr: string): string => {
    const [hStr, mStr] = peakTimeStr.split(':');
    const h = parseInt(hStr || '16', 10);
    const m = parseInt(mStr || '30', 10);
    const totalMins = h * 60 + m - 30;
    const adjMins = (totalMins + 1440) % 1440;
    const outH = Math.floor(adjMins / 60);
    const outM = adjMins % 60;
    return `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`;
  };

  const proactiveTime = computeProactiveStartTime(patient.sundowningPeakTime);

  const avgPreBars =
    logs.length > 0
      ? (logs.reduce((acc, l) => acc + l.preBars, 0) / logs.length).toFixed(1)
      : '5.5';
  const avgPostBars =
    logs.length > 0
      ? (logs.reduce((acc, l) => acc + l.postBars, 0) / logs.length).toFixed(1)
      : '4.0';
  const prnAvoidedCount = logs.filter((l) => l.prnAvoided).length;

  const toggleObservedSign = (id: ObservedBehavioralSignId) => {
    setObservedSigns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRecordCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: BarsSessionLog = {
      id: `log-${Date.now()}`,
      date: `Session ${logs.length + 1} (Today)`,
      time: new Date().toTimeString().slice(0, 5),
      triggerContext,
      currentStateLabel:
        preBars >= 6
          ? 'Agitated / Pacing / Sundowning'
          : preBars === 5
          ? 'Anxious / Restless / PLST'
          : 'Withdrawn / Apathetic',
      targetStateLabel: 'Deep Parasympathetic Calm (BARS 4)',
      preBars,
      postBars,
      moodValencePre: preBars >= 5 ? 2 : 3,
      moodValencePost: postBars === 4 ? 5 : 4,
      prnAvoided,
      observedSigns,
      caregiverStressBefore,
      caregiverStressAfter,
      sessionDurationMinutes: 30,
      notes:
        notes.trim() ||
        `30-minute Iso-Principle trajectory completed. BARS shifted from ${preBars} to ${postBars}.`,
    };

    onAddLog(newEntry);
    setNotes('');
    setSavedNotice(
      `Clinical BARS Check-In recorded: Pre-Session BARS ${preBars} → Post-Session BARS ${postBars} (${
        prnAvoided ? 'PRN Psychotropic Dose Avoided' : 'Standard Care'
      }).`
    );
    setTimeout(() => setSavedNotice(null), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Header & KPI Metrics */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
              Caregiver Support • Afternoon Routine &amp; Provider EHR Summary
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              Caregiver Observation Log &amp; Provider EHR Summary
            </h1>
            <p className="text-wildwoods-mint text-sm md:text-base max-w-3xl">
              Helps families and care teams apply Dr. Linda Gerdner’s 30-minute proactive listening
              guideline, record pre/post session observations, and share standardized{' '}
              <span className="text-wildwoods-gold font-semibold">HL7 FHIR R4</span> summaries with
              physicians, nurses, and Board-Certified Music Therapists (MT-BCs).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setExportModalOpen(!exportModalOpen)}
            className="min-h-[48px] px-5 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm flex items-center gap-2 shrink-0 shadow-lg transition"
          >
            <Stethoscope className="w-4 h-4" />
            {exportModalOpen
              ? 'Hide Provider / HL7 FHIR Summary'
              : 'Preview Provider / HL7 FHIR Summary'}
          </button>
        </div>

        {/* 5 Caregiver & Patient Efficacy KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          <div className="bg-wildwoods-forest p-4 sm:p-5 rounded-2xl border border-wildwoods-moss">
            <div className="text-[11px] font-bold uppercase tracking-wider text-wildwoods-mint">
              Observed Activity Shift (BARS)
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-gold mt-1">
              {avgPreBars} → {avgPostBars}
            </div>
            <div className="text-xs text-emerald-300 mt-1 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" />
              Supports BARS 4.0 Calm
            </div>
          </div>

          <div className="bg-wildwoods-forest p-4 sm:p-5 rounded-2xl border border-wildwoods-moss">
            <div className="text-[11px] font-bold uppercase tracking-wider text-wildwoods-mint">
              Settled Without Extra (PRN) Aid
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-300 mt-1">
              {prnAvoidedCount} of {logs.length}
            </div>
            <div className="text-xs text-wildwoods-mint mt-1">
              {epicRecord.flowsheetSummary.longitudinalOutcomes.prnAvoidanceRatePercent}% comfort rate
            </div>
          </div>

          <div className="bg-wildwoods-forest p-4 sm:p-5 rounded-2xl border border-wildwoods-moss">
            <div className="text-[11px] font-bold uppercase tracking-wider text-wildwoods-mint">
              Caregiver Stress Relief
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-gold mt-1">
              {epicRecord.flowsheetSummary.longitudinalOutcomes.meanCaregiverStressBefore} →{' '}
              {epicRecord.flowsheetSummary.longitudinalOutcomes.meanCaregiverStressAfter} / 5
            </div>
            <div className="text-xs text-emerald-300 mt-1">
              Särkämö Dyad Burden Reduction
            </div>
          </div>

          <div className="bg-wildwoods-forest p-4 sm:p-5 rounded-2xl border border-wildwoods-moss">
            <div className="text-[11px] font-bold uppercase tracking-wider text-wildwoods-mint">
              Connection &amp; Lucidity Cues
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-cream mt-1">
              {epicRecord.flowsheetSummary.longitudinalOutcomes.totalObservedSignsCount} Observed
            </div>
            <div className="text-xs text-wildwoods-mint mt-1 truncate">
              Smiles, sing-alongs &amp; stories
            </div>
          </div>

          <div className="bg-wildwoods-forest p-4 sm:p-5 rounded-2xl border border-wildwoods-moss">
            <div className="text-[11px] font-bold uppercase tracking-wider text-wildwoods-mint">
              Afternoon Calm Schedule
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-wildwoods-gold mt-1">
              {proactiveTime} Daily
            </div>
            <div className="text-xs text-wildwoods-mint mt-1">
              30m before {patient.sundowningPeakTime}
            </div>
          </div>
        </div>

        {/* Standardized Epic / HL7 FHIR R4 Medical Record Integration Panel */}
        {exportModalOpen && (
          <div className="bg-wildwoods-forest p-6 rounded-3xl border-2 border-wildwoods-amber space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-wildwoods-moss pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  Provider &amp; EHR Documentation Share • {epicRecord.flowsheetSummary.standardVersion}
                </span>
                <h3 className="text-xl font-serif font-bold text-wildwoods-cream mt-0.5">
                  Shareable Provider Summary (Epic / Oracle Health / Care Team Hand-Off)
                </h3>
                <p className="text-xs text-wildwoods-mint mt-1">
                  Formats personalized music preferences, skipped songs, and caregiver session
                  observations into a standard HL7 FHIR R4 CarePlan (`intent: plan`) to share with
                  healthcare providers and Music Therapists (MT-BCs).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEhrViewTab('flowsheet')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    ehrViewTab === 'flowsheet'
                      ? 'bg-wildwoods-amber text-wildwoods-slate'
                      : 'bg-wildwoods-slate text-wildwoods-mint'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Epic Nursing Flowsheet View
                </button>
                <button
                  type="button"
                  onClick={() => setEhrViewTab('fhir_json')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    ehrViewTab === 'fhir_json'
                      ? 'bg-wildwoods-amber text-wildwoods-slate'
                      : 'bg-wildwoods-slate text-wildwoods-mint'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  HL7 FHIR R4 Bundle JSON
                </button>
                <button
                  type="button"
                  onClick={handleCopyFhirJson}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy FHIR JSON
                </button>
              </div>
            </div>

            {ehrViewTab === 'flowsheet' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                {/* Standardized Clinical Coding & Patient Identity */}
                <div className="lg:col-span-5 bg-wildwoods-slate p-4 rounded-2xl border border-wildwoods-moss space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold">
                    1. Standardized EHR Coding &amp; Patient Biographical Anchor
                  </div>
                  <div className="space-y-1.5 text-wildwoods-cream">
                    <div>
                      <span className="text-wildwoods-mint">Patient:</span>{' '}
                      <strong>{epicRecord.flowsheetSummary.patientSummary.displayName}</strong> (b.{' '}
                      {epicRecord.flowsheetSummary.patientSummary.birthYear})
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Reminiscence Bump (cACC Window):</span>{' '}
                      <strong>
                        {epicRecord.flowsheetSummary.patientSummary.reminiscenceBumpWindow}
                      </strong>
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Procedure Code:</span>{' '}
                      <code className="text-emerald-300">
                        {epicRecord.flowsheetSummary.snomedInterventionCode}
                      </code>
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Diagnosis Target:</span>{' '}
                      <code className="text-amber-300">
                        {epicRecord.flowsheetSummary.icd10TargetCode}
                      </code>
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Observation Scale:</span>{' '}
                      <code className="text-wildwoods-mint">
                        {epicRecord.flowsheetSummary.loincAssessmentCode}
                      </code>
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">CMS Quality Measure:</span>{' '}
                      <strong>{epicRecord.flowsheetSummary.cmsQualityMeasure}</strong>
                    </div>
                  </div>
                </div>

                {/* Supportive Music CarePlan & Songs to Avoid Flags */}
                <div className="lg:col-span-7 bg-wildwoods-slate p-4 rounded-2xl border border-wildwoods-moss space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                    2. Personalized Music Support Plan &amp; Caregiver Flowsheet
                  </div>
                  <div className="space-y-1.5 text-wildwoods-cream">
                    <div>
                      <span className="text-wildwoods-mint">Support Plan:</span>{' '}
                      <strong>{epicRecord.flowsheetSummary.imiaCarePlanOrder.orderName}</strong>
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Suggested Schedule:</span>{' '}
                      <strong className="text-wildwoods-gold">
                        {epicRecord.flowsheetSummary.imiaCarePlanOrder.dosingSchedule}
                      </strong>
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Phase 1 (0–7m State Match):</span>{' '}
                      {epicRecord.flowsheetSummary.imiaCarePlanOrder.phase1Match}
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Phase 2 (8–18m Bridge):</span>{' '}
                      {epicRecord.flowsheetSummary.imiaCarePlanOrder.phase2Bridge}
                    </div>
                    <div>
                      <span className="text-wildwoods-mint">Phase 3 (19–30m Resolution):</span>{' '}
                      {epicRecord.flowsheetSummary.imiaCarePlanOrder.phase3Resolution}
                    </div>
                  </div>

                  {/* Caregiver Flagged Songs to Avoid */}
                  <div className="p-3 rounded-xl bg-red-950/90 border border-red-500/40 space-y-1">
                    <div className="font-extrabold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Caregiver Flag: Songs to Avoid (Do Not Play)
                    </div>
                    {epicRecord.flowsheetSummary.nursingContraindicationFlags.map((flag, i) => (
                      <div key={i} className="text-red-100">
                        • <strong>{flag.track}</strong> — {flag.clinicalReason}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <pre className="text-xs font-mono bg-wildwoods-slate p-4 rounded-2xl overflow-x-auto text-emerald-200 max-h-[380px]">
                {JSON.stringify(epicRecord.fhirBundle, null, 2)}
              </pre>
            )}
          </div>
        )}
      </section>

      {savedNotice && (
        <div
          role="status"
          className="bg-emerald-950 text-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm">{savedNotice}</span>
          </div>
        </div>
      )}

      {/* Proactive Afternoon Scheduler & 1-Tap BARS Check-In */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left 6 Columns: 1-Tap BARS (1-7) Pre/Post Session Check-In Widget */}
        <section
          aria-label="BARS 1-7 Pre and Post Agitation Check-In"
          className="xl:col-span-6 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand space-y-6"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-wildwoods-sage">
              5-Second Caregiver Observation Log
            </span>
            <h2 className="text-2xl font-serif font-bold text-wildwoods-slate">
              Record Pre / Post Session Observation (BARS 1–7)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Note {patient.preferredName}’s activity level before music starts and after listening
              so you can track what works best or share a summary with their care team.
            </p>
          </div>

          <form onSubmit={handleRecordCheckIn} className="space-y-5">
            {/* Pre-Session BARS Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-900">
                1. Pre-Session Observation (Before Music Starts):
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {BARS_SCALE_DEFINITIONS.map((item) => (
                  <button
                    key={`pre-${item.score}`}
                    type="button"
                    onClick={() => setPreBars(item.score)}
                    className={`min-h-[52px] rounded-xl font-bold text-sm flex flex-col items-center justify-center border-2 transition ${
                      preBars === item.score
                        ? 'bg-amber-600 text-white border-wildwoods-slate shadow-md scale-105'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <span className="text-base font-extrabold">{item.score}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                Selected Pre-Session:{' '}
                <strong>
                  {BARS_SCALE_DEFINITIONS.find((b) => b.score === preBars)?.label}
                </strong>{' '}
                — {BARS_SCALE_DEFINITIONS.find((b) => b.score === preBars)?.clinicalDescription}
              </div>
            </div>

            {/* Post-Session BARS Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                2. Post-Session Observation (After Listening):
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {BARS_SCALE_DEFINITIONS.map((item) => (
                  <button
                    key={`post-${item.score}`}
                    type="button"
                    onClick={() => setPostBars(item.score)}
                    className={`min-h-[52px] rounded-xl font-bold text-sm flex flex-col items-center justify-center border-2 transition ${
                      postBars === item.score
                        ? 'bg-emerald-700 text-white border-wildwoods-slate shadow-md scale-105'
                        : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    <span className="text-base font-extrabold">{item.score}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs font-semibold text-emerald-900 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                Selected Post-Session:{' '}
                <strong>
                  {BARS_SCALE_DEFINITIONS.find((b) => b.score === postBars)?.label}
                </strong>{' '}
                — {BARS_SCALE_DEFINITIONS.find((b) => b.score === postBars)?.clinicalDescription}
              </div>
            </div>

            {/* Context & PRN Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-wildwoods-slate mb-1">
                  Daily Routine / Listening Context
                </label>
                <select
                  value={triggerContext}
                  onChange={(e) => setTriggerContext(e.target.value)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl bg-wildwoods-cream border border-wildwoods-sand text-wildwoods-slate text-xs font-semibold"
                >
                  <option value="Late-Afternoon Sundowning Pacing (4:00 PM Proactive Shield)">
                    Late-Afternoon Wind-Down (30m Before Restlessness)
                  </option>
                  <option value="Morning Bathing & Personal Care (Gerdner PLST)">
                    Morning Bathing &amp; Personal Care Routine
                  </option>
                  <option value="Pre-Visit Lucidity Primer (DMN Scaffolding)">
                    Pre-Visit Family Connection Routine
                  </option>
                  <option value="Daytime Apathy / Caregiver Duet Reminiscence">
                    Daytime Sing-Along &amp; Family Reminiscence
                  </option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-wildwoods-parchment border border-wildwoods-sand flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prnAvoided}
                    onChange={(e) => setPrnAvoided(e.target.checked)}
                    className="w-4 h-4 accent-wildwoods-sage"
                  />
                  <span className="text-xs font-bold text-wildwoods-slate">
                    Settled Calmly Without Extra (PRN) Aid
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-wildwoods-slate mb-1.5">
                3. Observed Signs of Connection &amp; Efficacy (Tap Any):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {OBSERVED_BEHAVIORAL_SIGNS.map((sign) => {
                  const active = observedSigns.includes(sign.id);
                  return (
                    <button
                      key={sign.id}
                      type="button"
                      onClick={() => toggleObservedSign(sign.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                      }`}
                    >
                      <span>{sign.emoji}</span>
                      <span>{sign.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-wildwoods-parchment/80 border border-wildwoods-sand flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-wildwoods-slate">
                4. Caregiver Stress / Relief After Session (1 = Very Calm, 5 = High Stress):
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setCaregiverStressAfter(score)}
                    className={`w-9 h-9 rounded-xl font-extrabold text-xs border transition ${
                      caregiverStressAfter === score
                        ? 'bg-wildwoods-slate text-wildwoods-gold border-wildwoods-slate shadow'
                        : 'bg-white text-wildwoods-slate border-wildwoods-sand'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-wildwoods-slate mb-1">
                5. Caregiver Observation Note (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Pacing settled during Frank Sinatra; smiled and sang along with Louis Armstrong."
                className="w-full px-4 py-2.5 rounded-xl bg-wildwoods-cream border border-wildwoods-sand text-wildwoods-slate text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[54px] px-6 py-3 rounded-2xl bg-wildwoods-slate hover:bg-wildwoods-forest text-wildwoods-cream font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              <PlusCircle className="w-5 h-5 text-wildwoods-gold" />
              Save Session Observation to Care Log
            </button>
          </form>
        </section>

        {/* Right 6 Columns: Proactive Afternoon Scheduler + 6-Week Longitudinal Chart */}
        <div className="xl:col-span-6 space-y-6">
          {/* Proactive Afternoon Calm Scheduler (Gerdner Guideline) */}
          <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-7 shadow-xl border border-wildwoods-moss space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold">
                  <BellRing className="w-4 h-4" />
                  Gerdner 30-Minute Proactive Listening Guideline
                </span>
                <h3 className="text-xl font-serif font-bold">
                  Afternoon Calm Routine Scheduler
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                Ready
              </span>
            </div>

            <p className="text-xs text-wildwoods-mint leading-relaxed">
              Published geriatric nursing research (Dr. Linda Gerdner’s PLST framework) shows that
              starting familiar music <strong>30 minutes before</strong> typical late-afternoon
              restlessness helps maintain a calm environment before stress builds up.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-wildwoods-forest p-4 rounded-2xl border border-wildwoods-moss">
              <div>
                <label
                  htmlFor="sundowning-peak-input"
                  className="block text-xs font-bold text-wildwoods-mint mb-1"
                >
                  Typical Sundowning Peak Time:
                </label>
                <input
                  id="sundowning-peak-input"
                  type="time"
                  value={patient.sundowningPeakTime}
                  onChange={(e) => onUpdateSundowningTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-wildwoods-slate border border-wildwoods-amber text-wildwoods-cream font-mono font-bold text-base"
                />
              </div>

              <div className="flex flex-col justify-center">
                <div className="text-xs text-wildwoods-mint">
                  Automated Iso-Principle Start (-30 mins):
                </div>
                <div className="text-2xl font-mono font-extrabold text-wildwoods-gold flex items-center gap-2 mt-0.5">
                  <Clock className="w-5 h-5" />
                  {proactiveTime}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onTriggerSundowningShieldNow}
              className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Play className="w-5 h-5" />
              Launch 30-Minute Sundowning Shield Trajectory Now
            </button>
          </section>

          {/* 6-Week Longitudinal Agitation Reduction Chart */}
          <section className="bg-white rounded-3xl p-6 md:p-7 shadow-md border border-wildwoods-sand space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-wildwoods-sage">
                  Longitudinal Efficacy (NCT04236557 &amp; Svansdottir 2006)
                </span>
                <h3 className="text-xl font-serif font-bold text-wildwoods-slate">
                  6-Week Pre vs. Post Session BARS Trajectory
                </h3>
              </div>
              <HeartPulse className="w-6 h-6 text-wildwoods-sage" />
            </div>

            <div className="space-y-3 pt-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-wildwoods-cream border border-wildwoods-sand space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs text-wildwoods-slate">{log.date}</span>
                      <span className="text-xs text-slate-500 ml-2">• {log.triggerContext}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
                        Pre BARS: {log.preBars}
                      </span>
                      <span className="text-xs font-bold text-slate-400">→</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                        Post BARS: {log.postBars}
                      </span>
                      {log.prnAvoided && (
                        <span className="px-2 py-0.5 rounded-full bg-wildwoods-slate text-wildwoods-gold text-[10px] font-bold">
                          PRN Avoided
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual bar comparison */}
                  <div className="grid grid-cols-12 gap-2 items-center text-[11px]">
                    <div className="col-span-12 bg-wildwoods-parchment rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full transition-all"
                        style={{ width: `${(log.postBars / 7) * 100}%` }}
                        title={`Post-Session BARS ${log.postBars}`}
                      />
                      <div
                        className="bg-amber-500/80 h-full transition-all"
                        style={{
                          width: `${Math.max(0, ((log.preBars - log.postBars) / 7) * 100)}%`,
                        }}
                        title={`Agitation Reduction Delta (-${log.preBars - log.postBars} BARS)`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{log.notes}</p>
                  {((log.observedSigns && log.observedSigns.length > 0) ||
                    (log.topResonantTracks && log.topResonantTracks.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {log.observedSigns?.map((signId) => {
                        const found = OBSERVED_BEHAVIORAL_SIGNS.find((s) => s.id === signId);
                        if (!found) return null;
                        return (
                          <span
                            key={signId}
                            className="px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-950 text-[11px] font-bold"
                          >
                            {found.emoji} {found.label}
                          </span>
                        );
                      })}
                      {log.topResonantTracks?.map((trackTitle) => (
                        <span
                          key={trackTitle}
                          className="px-2 py-0.5 rounded-lg bg-amber-100/80 text-amber-950 text-[11px] font-bold"
                        >
                          🎵 {trackTitle}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

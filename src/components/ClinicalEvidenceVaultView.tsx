'use client';

import React, { useState } from 'react';
import {
  Brain,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Award,
  Microscope,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  CLINICAL_EVIDENCE_MATRIX,
  COMPETITIVE_LANDSCAPE_AUDIT,
} from '@/lib/clinical-evidence';

export default function ClinicalEvidenceVaultView() {
  const [selectedStudyId, setSelectedStudyId] = useState<string>('jacobsen-2015');

  const selectedStudy =
    CLINICAL_EVIDENCE_MATRIX.find((s) => s.id === selectedStudyId) ||
    CLINICAL_EVIDENCE_MATRIX[0];

  return (
    <div className="space-y-8">
      {/* North Star Scope & Collaborative Care Positioning Banner */}
      <section className="bg-white rounded-3xl p-6 md:p-7 shadow-md border-2 border-wildwoods-amber/70 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            North Star Scope • Evidence-Informed Support &amp; Provider Collaboration
          </div>
          <span className="text-xs font-bold text-slate-500">
            Designed to empower families &amp; complement credentialed clinicians and MT-BCs
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-wildwoods-slate">
            Grounded in Peer-Reviewed Science — Built for Personalized Music Sequencing, Caregiver Support &amp; Provider Documentation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Magic Jukebox translates published neuroscience and musicology into an easy-to-use
            daily tool for families, care communities, and allied health professionals.{' '}
            <strong>We do not provide a standalone medical treatment or replace licensed clinicians or Board-Certified Music Therapists (MT-BCs).</strong>{' '}
            Instead, our modular platform equips caregivers and care teams with biographical music
            discovery, mood-to-calm sequencing, pitch-preserving pace support, and standardized{' '}
            <strong>HL7 FHIR R4 observational summaries</strong> to share with healthcare providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3.5 rounded-2xl bg-wildwoods-cream border border-wildwoods-sand space-y-1">
            <div className="font-extrabold text-wildwoods-slate">
              1. Memory &amp; Cognitive Care Track
            </div>
            <p className="text-slate-600">
              Alzheimer’s, dementia &amp; afternoon restlessness support using Reminiscence Bump
              (ages 10–30) playlists, family memory prompts, and 3-phase mood-to-calm sequencing.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-wildwoods-cream border border-wildwoods-sand space-y-1">
            <div className="font-extrabold text-wildwoods-slate">
              2. Movement &amp; Pace Support Track
            </div>
            <p className="text-slate-600">
              Parkinson’s &amp; motor rhythm support using pitch-locked tempo matching (`0.65x–1.35x`),
              gradual speed-up ramping, and optional rhythmic beat cues inspired by RAS research.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-wildwoods-cream border border-wildwoods-sand space-y-1">
            <div className="font-extrabold text-wildwoods-slate">
              3. Calm, Routine &amp; Provider Share Track
            </div>
            <p className="text-slate-600">
              1-tap relaxing playlists for daily care routines plus caregiver observation logs
              formatted into HL7 FHIR R4 summaries for Epic and clinical care teams.
            </p>
          </div>
        </div>
      </section>

      {/* Top Neurobiological Hero: Jacobsen et al. (2015) Max Planck Discovery */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 md:p-8 shadow-xl border border-wildwoods-moss space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
              Neurobiological Foundation • Jacobsen et al. (2015), Brain
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">
              Why Musical Memory Survives Cortical Degeneration in Alzheimer’s Disease
            </h1>
            <p className="text-wildwoods-mint text-sm md:text-base max-w-4xl">
              While neurodegeneration begins in the entorhinal cortex and hippocampus—destroying
              short-term episodic recall and verbal fluency—7 Tesla fMRI and PET imaging prove that
              long-term musical memory is encoded in two preserved cortical sanctuaries: the{' '}
              <strong className="text-wildwoods-gold">
                caudal anterior cingulate cortex (cACC)
              </strong>{' '}
              and the{' '}
              <strong className="text-emerald-300">
                ventral pre-supplementary motor area (ventral pre-SMA)
              </strong>
              .
            </p>
          </div>
        </div>

        {/* 3-Biomarker Dissociation Cards (Jacobsen et al., 2015) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="bg-wildwoods-forest p-5 rounded-2xl border border-wildwoods-moss space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold">
                1. Caudal Anterior Cingulate (cACC)
              </span>
              <Brain className="w-5 h-5 text-wildwoods-gold" />
            </div>
            <h2 className="text-lg font-serif font-bold text-wildwoods-cream">
              Affective Salience &amp; Autonomic Hub
            </h2>
            <p className="text-xs text-wildwoods-mint leading-relaxed">
              Despite heavy amyloid-beta (Aβ) plaque burden equivalent to the rest of the diseased
              cortex, the cACC exhibits <strong>minimal cortical atrophy</strong> and{' '}
              <strong>preserved glucose metabolism</strong>. Tags familiar youth music with intense
              emotional security.
            </p>
          </div>

          <div className="bg-wildwoods-forest p-5 rounded-2xl border border-wildwoods-moss space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                2. Ventral Pre-SMA
              </span>
              <Microscope className="w-5 h-5 text-emerald-300" />
            </div>
            <h2 className="text-lg font-serif font-bold text-wildwoods-cream">
              Embodied Motor-Rhythmic Scaffolding
            </h2>
            <p className="text-xs text-wildwoods-mint leading-relaxed">
              Governs sequential rhythm organization, foot-tapping, and vocal motor planning.
              Explains why non-verbal patients can still sing complete lyrics from ages 10–30 when
              entrained by a familiar beat.
            </p>
          </div>

          <div className="bg-wildwoods-forest p-5 rounded-2xl border border-wildwoods-moss space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-mint">
                3. Default Mode Network (DMN)
              </span>
              <Layers className="w-5 h-5 text-wildwoods-mint" />
            </div>
            <h2 className="text-lg font-serif font-bold text-wildwoods-cream">
              Functional Connectivity Restoration
            </h2>
            <p className="text-xs text-wildwoods-mint leading-relaxed">
              King et al. (2019) demonstrated via fMRI that favored music projects from the
              preserved cACC/pre-SMA into the Default Mode Network, temporarily synchronizing
              fragmented neural circuits to restore eye contact and lucidity.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Peer-Reviewed Clinical Reference Matrix */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-wildwoods-parchment">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-wildwoods-sage flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Peer-Reviewed Clinical Bibliography
            </span>
            <h2 className="text-2xl font-serif font-bold text-wildwoods-slate">
              Comprehensive Clinical Reference Matrix
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-wildwoods-parchment px-3 py-1.5 rounded-xl">
            Click any publication below to inspect cohort methodology &amp; product mandate
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-2.5">
            {CLINICAL_EVIDENCE_MATRIX.map((item) => {
              const isSelected = item.id === selectedStudy.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStudyId(item.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                    isSelected
                      ? 'bg-wildwoods-slate text-wildwoods-cream border-wildwoods-amber shadow-md'
                      : 'bg-wildwoods-cream hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                  }`}
                >
                  <div className="text-xs font-extrabold text-wildwoods-amber">
                    {item.neuroBadge}
                  </div>
                  <div className="font-bold text-sm mt-0.5">{item.citation}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isSelected ? 'text-wildwoods-mint' : 'text-slate-500'
                    }`}
                  >
                    {item.journalAndDoi}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-wildwoods-cream rounded-3xl p-6 md:p-7 border-2 border-wildwoods-sand space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-wildwoods-slate text-wildwoods-gold text-xs font-bold">
                {selectedStudy.neuroBadge}
              </span>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
                {selectedStudy.keyMetricHighlight}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-wildwoods-slate">
                {selectedStudy.citation}
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                {selectedStudy.journalAndDoi}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-4 rounded-2xl bg-white border border-wildwoods-sand">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Clinical Focus &amp; Study Cohort
                </div>
                <p className="text-wildwoods-slate font-medium">{selectedStudy.cohortAndMethod}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-wildwoods-sand">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Core Empirical Finding
                </div>
                <p className="text-slate-700 leading-relaxed">{selectedStudy.empiricalFinding}</p>
              </div>

              <div className="p-4 rounded-2xl bg-wildwoods-slate text-wildwoods-cream border border-wildwoods-moss">
                <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Magic Jukebox Product Architecture Mandate
                </div>
                <p className="text-wildwoods-mint leading-relaxed">
                  {selectedStudy.productMandate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Landscape Audit: Why Existing UK Tools Are Clunky */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            UK &amp; Global Ecosystem Post-Mortem (ILC-UK Commission Context)
          </span>
          <h2 className="text-2xl font-serif font-bold text-wildwoods-slate mt-1">
            Why Existing Dementia Music Tools Suffer from Usability &amp; Clinical Friction
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Validates our clinical partner’s critique of the UK landscape by contrasting{' '}
            <strong>Playlist for Life</strong>, <strong>BBC Music Memories</strong>,{' '}
            <strong>m4d Radio</strong>, <strong>Vera</strong>, and <strong>MediMusic</strong>{' '}
            against the Magic Jukebox architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {COMPETITIVE_LANDSCAPE_AUDIT.map((comp) => (
            <div
              key={comp.name}
              className="p-5 rounded-2xl bg-wildwoods-cream border border-wildwoods-sand grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
            >
              <div className="lg:col-span-3 space-y-1">
                <h3 className="font-serif font-bold text-base text-wildwoods-slate">
                  {comp.name}
                </h3>
                <div className="text-xs font-semibold text-amber-900">{comp.originAndModel}</div>
                <p className="text-xs text-slate-600 pt-1">{comp.strengths}</p>
              </div>

              <div className="lg:col-span-5 space-y-1.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-red-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Documented UX &amp; Clinical Failure Modes
                </div>
                <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                  {comp.clinicalAndUxBottlenecks.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-4 bg-wildwoods-slate text-wildwoods-cream p-4 rounded-xl border border-wildwoods-moss space-y-1">
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Magic Jukebox Resolution
                </div>
                <p className="text-xs text-wildwoods-mint leading-relaxed">
                  {comp.magicJukeboxResolution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

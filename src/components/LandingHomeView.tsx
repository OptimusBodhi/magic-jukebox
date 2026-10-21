'use client';

import React from 'react';
import {
  Wand2,
  Disc3,
  Sparkles,
  Brain,
  Compass,
  ShieldCheck,
  Search,
  Activity,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Users,
  HeartHandshake,
  HelpCircle,
} from 'lucide-react';
import { PatientProfile } from '@/lib/iso-sequencer';

interface LandingHomeViewProps {
  patient: PatientProfile;
  isCustomProfile: boolean;
  onStartCreateOwn: () => void;
  onExploreDemo: () => void;
  onOpenTutorial: () => void;
  onNavigateTab: (tab: 'jukebox' | 'interview' | 'detective' | 'telemetry' | 'science') => void;
}

export default function LandingHomeView({
  patient,
  isCustomProfile,
  onStartCreateOwn,
  onExploreDemo,
  onOpenTutorial,
  onNavigateTab,
}: LandingHomeViewProps) {
  return (
    <div className="space-y-10">
      {/* Clean, Low-Word-Count Hero Section */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-8 md:p-12 shadow-2xl border border-wildwoods-moss relative overflow-hidden">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-wildwoods-forest border border-wildwoods-amber/50 text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Open Family &amp; Clinical Pilot • Free in Your Browser
            </div>

            <button
              type="button"
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-wildwoods-amber text-wildwoods-slate hover:bg-wildwoods-gold text-xs font-extrabold shadow-sm transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              New Here? Open Easy 4-Step Visual Tutorial
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-wildwoods-cream leading-tight">
            Music that meets your loved one where they are—and gently guides them home.
          </h1>

          <p className="text-base sm:text-xl text-wildwoods-mint leading-relaxed max-w-2xl">
            An easy-to-use personal jukebox for families and caregivers. Enter their birth year,
            tap a few favorite music styles from when they were 10 to 30 years old, and press Play
            to spark memories, ease restlessness, and bring calm.
          </p>
        </div>

        {/* Two Crystal-Clear Primary Entry Cards: Create Your Own vs. Explore Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-wildwoods-moss">
          {/* Card 1: Create Your Own (Real Use) */}
          <div className="bg-wildwoods-forest rounded-2xl p-6 md:p-7 border-2 border-wildwoods-amber shadow-xl flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-wildwoods-amber text-wildwoods-slate text-xs font-extrabold uppercase tracking-wider">
                  Create Your Own • Easy Family Setup
                </span>
                <span className="text-xs text-wildwoods-mint font-semibold">Takes ~60 Secs</span>
              </div>

              <h2 className="text-2xl font-serif font-bold text-wildwoods-cream">
                Build a Personalized Jukebox
              </h2>

              <p className="text-sm text-wildwoods-mint leading-relaxed">
                Enter your loved one’s name and birth year, tap a few music styles (with instant
                audio samples!), and we’ll build their custom playlist right in your browser.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onStartCreateOwn}
                className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg transition"
              >
                <Wand2 className="w-5 h-5" />
                Start Easy 3-Step Playlist Builder
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onOpenTutorial}
                className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-wildwoods-slate/60 hover:bg-wildwoods-slate text-wildwoods-gold font-bold text-xs flex items-center justify-center gap-1.5 border border-wildwoods-amber/30 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                See How It Works First (Step-by-Step Guide)
              </button>
            </div>
          </div>

          {/* Card 2: Interactive Demo (Pre-Loaded Sample Patient) */}
          <div className="bg-wildwoods-slate/80 rounded-2xl p-6 md:p-7 border-2 border-wildwoods-sage/50 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400/50 text-emerald-200 text-xs font-extrabold uppercase tracking-wider">
                  {isCustomProfile
                    ? `Active Profile: ${patient.name}`
                    : 'Interactive Demo • Sample Patient'}
                </span>
                <span className="text-xs text-wildwoods-mint font-semibold">
                  {isCustomProfile
                    ? `Born ${patient.birthYear}`
                    : 'Arthur Pendelton (Age 82)'}
                </span>
              </div>

              <h2 className="text-2xl font-serif font-bold text-wildwoods-cream">
                {isCustomProfile
                  ? `Open ${patient.preferredName}’s Jukebox Player`
                  : 'Explore the Pre-Loaded Demo'}
              </h2>

              <p className="text-sm text-wildwoods-mint leading-relaxed">
                {isCustomProfile
                  ? `Your custom Jukebox for ${patient.name} is saved on this device. Open the player to switch emotional states or play songs.`
                  : 'Test-drive a completed jukebox built for “Arthur Pendelton” (born 1944). Switch emotional states, play 30-second song hooks, and try Caregiver Duet Mode.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onExploreDemo}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-wildwoods-moss hover:bg-wildwoods-sage text-wildwoods-cream font-extrabold text-base flex items-center justify-center gap-2.5 transition"
            >
              <Disc3 className="w-5 h-5 text-wildwoods-gold" />
              {isCustomProfile
                ? `Open ${patient.preferredName}’s Jukebox`
                : 'Try Arthur’s Demo Jukebox'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works in 3 Simple Steps (Minimal Text) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-md border border-wildwoods-sand space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate flex items-center justify-center font-bold">
            <Brain className="w-6 h-6 text-wildwoods-amber" />
          </div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
            Step 1 • Ages 10–30 Memory Bump
          </div>
          <h3 className="text-lg font-serif font-bold text-wildwoods-slate">
            Unlock Preserved Brain Hubs
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Youth musical memory survives Alzheimer’s. Every song card plays its chorus hook
            immediately on tap—no reading or Spotify login required.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-wildwoods-sand space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate flex items-center justify-center font-bold">
            <Compass className="w-6 h-6 text-wildwoods-sage" />
          </div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
            Step 2 • The Clinical Iso-Principle
          </div>
          <h3 className="text-lg font-serif font-bold text-wildwoods-slate">
            Match Mood, Then Guide to Calm
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Instead of jarring an agitated listener with a slow lullaby, we match their current
            energy first and gradually step tempo down over 30 minutes.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-wildwoods-sand space-y-2.5">
          <div className="w-11 h-11 rounded-2xl bg-wildwoods-parchment text-wildwoods-slate flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6 text-wildwoods-amber" />
          </div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
            Step 3 • Duet Mode &amp; Sundowning Shield
          </div>
          <h3 className="text-lg font-serif font-bold text-wildwoods-slate">
            Connect &amp; Prevent Afternoon Stress
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Switch between passive calm listening and Caregiver Duet Mode (large lyrics + family
            story prompts), and block distress-linked “Red Flag” songs in one tap.
          </p>
        </div>
      </section>

      {/* Quick Directory of Platform Modules & Current Pilot Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Explore All Modules */}
        <section className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-md border border-wildwoods-sand space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-sage">
            Platform Directory
          </div>
          <h2 className="text-2xl font-serif font-bold text-wildwoods-slate">
            Jump Directly to Any Tool
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <button
              type="button"
              onClick={() => onNavigateTab('interview')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-wildwoods-amber" />
                  Guided Intake Interview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  CREATE YOUR OWN
                </span>
              </div>
              <p className="text-xs text-slate-600">
                6-question interview that builds a custom Jukebox from your loved one’s life story.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('detective')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                  <Search className="w-4 h-4 text-wildwoods-sage" />
                  Music Detective Studio
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  LIVE AUDIO SEARCH
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Audition songs by decade or artist together and swipe to add or quarantine tracks.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('telemetry')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                  <Activity className="w-4 h-4 text-wildwoods-sage" />
                  Sundowning Shield &amp; BARS Log
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-wildwoods-parchment text-wildwoods-slate">
                  CAREGIVER TOOL
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Schedule music 30 mins before peak agitation and log 5-second Pre/Post BARS scores.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('science')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-wildwoods-amber" />
                  Clinical Science &amp; Evidence
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-wildwoods-parchment text-wildwoods-slate">
                  FOR CLINICIANS
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Inspect the peer-reviewed neuroscience (Jacobsen 2015, Gerdner IMIA, NCT04236557).
              </p>
            </button>
          </div>
        </section>

        {/* Right 5 Cols: Transparent Pilot Availability Status */}
        <section className="lg:col-span-5 bg-wildwoods-parchment rounded-3xl p-6 md:p-8 border border-wildwoods-sand flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-wildwoods-slate text-wildwoods-gold text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Current Pilot Status (v1.1 Web Release)
            </div>
            <h3 className="text-xl font-serif font-bold text-wildwoods-slate">
              What You Can Use Today vs. What’s Next
            </h3>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Live Now (Free, No Account Required):</strong> Build a custom profile,
                  play verified 30-second chorus streams for song discovery &amp; reminiscence,
                  sequence 3-phase Iso-Principle playlists, and save locally in your browser.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Click Full-Song Streaming &amp; Shareable Family Links:</strong> Open
                  any sequenced track in Spotify, Apple Music, or YouTube for full-length playback,
                  or click <em>Copy Shareable Family Link</em> to send your custom Jukebox to any
                  sibling, caregiver, or nurse’s tablet with zero login.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Printable Bedside Care Sheet:</strong> Copy or print the 3-Phase
                  Iso-Principle Prescription, Memory Mirror prompts, and Red Flag Do-Not-Play list
                  for bedside care teams.
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

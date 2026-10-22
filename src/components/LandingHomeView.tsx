'use client';

import React, { useState } from 'react';
import {
  Wand2,
  Disc3,
  Sparkles,
  Search,
  Activity,
  BookOpen,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquareHeart,
  Printer,
} from 'lucide-react';
import { PatientProfile } from '@/lib/iso-sequencer';

interface LandingHomeViewProps {
  patient: PatientProfile;
  isCustomProfile: boolean;
  onStartCreateOwn: () => void;
  onExploreDemo: () => void;
  onOpenTutorial: () => void;
  onOpenFeedback?: () => void;
  onOpenBedsideHardware?: () => void;
  onNavigateTab: (tab: 'jukebox' | 'interview' | 'detective' | 'telemetry' | 'science') => void;
}

export default function LandingHomeView({
  patient,
  isCustomProfile,
  onStartCreateOwn,
  onExploreDemo,
  onOpenTutorial,
  onOpenFeedback,
  onOpenBedsideHardware,
  onNavigateTab,
}: LandingHomeViewProps) {
  const [showMoreTools, setShowMoreTools] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Simple, Warm Tactile Cabinet Welcome Card */}
      <section className="card-jukebox-cabinet rounded-3xl p-6 sm:p-10 space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wildwoods-moss/80 pb-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-wildwoods-amber/20 border border-wildwoods-amber/70 text-wildwoods-gold text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              <Disc3 className="w-4 h-4" />
              Easy Personal Music &amp; Memory Player
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-wildwoods-cream leading-tight">
              Welcome to The Magic Jukebox
            </h1>
            <p className="text-base sm:text-xl text-wildwoods-mint leading-relaxed max-w-2xl">
              Play favorite songs from ages 10 to 30, adjust song speed to match your comfortable
              pace, and record what brings calm and smiles.
            </p>
          </div>
        </div>

        {/* Two Giant, Tactile Push-Button Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Action 1: Build Your Own */}
          <button
            type="button"
            onClick={onStartCreateOwn}
            className="btn-tactile-gold text-left p-6 sm:p-8 rounded-3xl flex flex-col justify-between gap-6 min-h-[210px]"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-wildwoods-slate/15 px-3 py-1 rounded-full">
                <Wand2 className="w-4 h-4" />Step 1 • 60-Second Setup
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-extrabold leading-snug">
                Build My Playlist
              </div>
              <p className="text-sm sm:text-base font-bold text-wildwoods-slate/90 leading-relaxed">
                Enter a birth year and tap favorite music styles or decades.
              </p>
            </div>

            <div className="inline-flex items-center justify-between w-full pt-3 border-t border-wildwoods-slate/15 font-extrabold text-base sm:text-lg">
              <span>Tap Here to Start Setup</span>
              <span className="w-10 h-10 rounded-full bg-wildwoods-slate text-wildwoods-gold flex items-center justify-center shadow">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </button>

          {/* Action 2: Open Jukebox Player */}
          <button
            type="button"
            onClick={onExploreDemo}
            className="btn-tactile-wood text-left p-6 sm:p-8 rounded-3xl flex flex-col justify-between gap-6 min-h-[210px]"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-wildwoods-gold bg-black/30 px-3 py-1 rounded-full border border-wildwoods-amber/40">
                <Disc3 className="w-4 h-4" />
                {isCustomProfile ? 'Saved Personal Jukebox' : 'Ready to Listen Now'}
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-extrabold text-wildwoods-cream leading-snug">
                {isCustomProfile
                  ? `Play ${patient.preferredName}’s Jukebox`
                  : 'Play Sample Jukebox'}
              </div>
              <p className="text-sm sm:text-base text-wildwoods-mint leading-relaxed">
                {isCustomProfile
                  ? `Open ${patient.preferredName}’s saved playlist (${patient.birthYear + 10}–${patient.birthYear + 30} era) and press Play.`
                  : 'Listen to a pre-loaded 1950s & 60s playlist right away.'}
              </p>
            </div>

            <div className="inline-flex items-center justify-between w-full pt-3 border-t border-wildwoods-moss font-extrabold text-base sm:text-lg text-wildwoods-gold">
              <span>Tap Here to Open Player</span>
              <span className="w-10 h-10 rounded-full bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center shadow">
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </button>
        </div>

        {/* 1-Tap Elder-Safe / Simple TV & Tablet Mode Quick-Launcher */}
        {onOpenBedsideHardware && (
          <div className="p-4 sm:p-5 rounded-2xl bg-wildwoods-forest/90 border-2 border-wildwoods-amber/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold flex items-center gap-1.5">
                🔘 Ultra-Simple Elder &amp; Bedside Mode
              </div>
              <p className="text-xs sm:text-sm text-wildwoods-cream font-medium">
                Want a giant 1-button radio screen with zero menus, or printable QR cards for the bedside table?
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenBedsideHardware}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              Bedside Cards &amp; Giant 1-Button Mode
            </button>
          </div>
        )}

        {/* Simple Help & Beta Feedback Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-wildwoods-moss">
          <button
            type="button"
            onClick={onOpenTutorial}
            className="min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-gold font-bold text-xs sm:text-sm flex items-center gap-2 border border-wildwoods-amber/40 transition"
          >
            <HelpCircle className="w-4 h-4" />
            First Time Here? See How It Works (4 Easy Pictures)
          </button>

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream font-bold text-xs sm:text-sm flex items-center gap-2 border border-wildwoods-sage/50 transition"
            >
              <MessageSquareHeart className="w-4 h-4 text-wildwoods-amber" />
              Share Beta Feedback
            </button>
          )}
        </div>
      </section>

      {/* Collapsible Caregiver, Medical Record & Clinical Science Tools */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-wildwoods-sand">
        <button
          type="button"
          onClick={() => setShowMoreTools((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-wildwoods-amber shrink-0" />
            <span className="font-bold text-xs sm:text-sm text-wildwoods-slate">
              Caregiver, Song Finder &amp; Medical Record Tools
            </span>
          </div>
          <span className="text-xs font-extrabold text-wildwoods-sage flex items-center gap-1">
            {showMoreTools ? 'Hide' : 'Show Tools'}
            {showMoreTools ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </button>

        {showMoreTools && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-wildwoods-parchment">
            {onOpenBedsideHardware && (
              <button
                type="button"
                onClick={onOpenBedsideHardware}
                className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
              >
                <div className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                  <Printer className="w-4 h-4 text-wildwoods-amber" />
                  Bedside Cards &amp; Easy-Button
                </div>
                <p className="text-xs text-slate-600">
                  1-button screen, printable QR/NFC cards &amp; 3-button radio USB setup.
                </p>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('detective')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                <Search className="w-4 h-4 text-wildwoods-sage" />
                Song Finder
              </div>
              <p className="text-xs text-slate-600">
                Search songs by decade or singer and listen together.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('telemetry')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                <Activity className="w-4 h-4 text-wildwoods-sage" />
                Care Log &amp; Epic EHR
              </div>
              <p className="text-xs text-slate-600">
                Afternoon schedule, mood log, and HL7 FHIR medical record view.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('science')}
              className="p-4 rounded-2xl bg-wildwoods-cream hover:bg-wildwoods-parchment border border-wildwoods-sand text-left transition space-y-1"
            >
              <div className="font-bold text-sm text-wildwoods-slate flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-wildwoods-amber" />
                Clinical Science
              </div>
              <p className="text-xs text-slate-600">
                Peer-reviewed brain research and Iso-Principle evidence.
              </p>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

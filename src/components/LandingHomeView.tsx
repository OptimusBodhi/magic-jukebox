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
} from 'lucide-react';
import { PatientProfile } from '@/lib/iso-sequencer';

interface LandingHomeViewProps {
  patient: PatientProfile;
  isCustomProfile: boolean;
  onStartCreateOwn: () => void;
  onExploreDemo: () => void;
  onOpenTutorial: () => void;
  onOpenFeedback?: () => void;
  onNavigateTab: (tab: 'jukebox' | 'interview' | 'detective' | 'telemetry' | 'science') => void;
}

export default function LandingHomeView({
  patient,
  isCustomProfile,
  onStartCreateOwn,
  onExploreDemo,
  onOpenTutorial,
  onOpenFeedback,
  onNavigateTab,
}: LandingHomeViewProps) {
  const [showMoreTools, setShowMoreTools] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Simple, Warm Welcome Card */}
      <section className="bg-wildwoods-slate text-wildwoods-cream rounded-3xl p-6 sm:p-10 shadow-2xl border border-wildwoods-moss space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-wildwoods-cream leading-tight">
            Welcome to The Magic Jukebox
          </h1>
          <p className="text-base sm:text-lg text-wildwoods-mint leading-relaxed">
            Play the music from your favorite years (ages 10 to 30), adjust the song speed to match
            your pace, and save favorite family memories.
          </p>
        </div>

        {/* Two Big, Crystal-Clear Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Action 1: Build Your Own */}
          <button
            type="button"
            onClick={onStartCreateOwn}
            className="text-left p-6 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate shadow-xl transition flex flex-col justify-between gap-4 border-2 border-white/40"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider bg-wildwoods-slate/15 px-2.5 py-1 rounded-full">
                <Wand2 className="w-3.5 h-3.5" />3 Easy Steps
              </div>
              <div className="text-2xl font-serif font-bold">
                Build My Playlist
              </div>
              <p className="text-xs sm:text-sm font-medium text-wildwoods-slate/90 leading-relaxed">
                Enter your birth year and tap the music styles you love.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base">
              Start Now <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Action 2: Open Jukebox Player */}
          <button
            type="button"
            onClick={onExploreDemo}
            className="text-left p-6 rounded-2xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream shadow-xl transition flex flex-col justify-between gap-4 border-2 border-wildwoods-amber/60"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold bg-wildwoods-slate/50 px-2.5 py-1 rounded-full">
                <Disc3 className="w-3.5 h-3.5" />
                {isCustomProfile ? 'Saved Jukebox' : 'Ready to Play'}
              </div>
              <div className="text-2xl font-serif font-bold text-wildwoods-cream">
                {isCustomProfile
                  ? `Play ${patient.preferredName}’s Jukebox`
                  : 'Play Sample Jukebox'}
              </div>
              <p className="text-xs sm:text-sm text-wildwoods-mint leading-relaxed">
                {isCustomProfile
                  ? `Open ${patient.preferredName}’s saved playlist and press Play.`
                  : 'Listen to a pre-loaded 1950s & 60s playlist right away.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 font-extrabold text-sm sm:text-base text-wildwoods-gold">
              Open Player <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Simple Help & Beta Feedback Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-wildwoods-moss">
          <button
            type="button"
            onClick={onOpenTutorial}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-gold font-bold text-xs sm:text-sm flex items-center gap-2 border border-wildwoods-amber/40 transition"
          >
            <HelpCircle className="w-4 h-4" />
            First Time Here? See How It Works (4 Easy Pictures)
          </button>

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream font-bold text-xs sm:text-sm flex items-center gap-2 border border-wildwoods-sage/50 transition"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-wildwoods-parchment">
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

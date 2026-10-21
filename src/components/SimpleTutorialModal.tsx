'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Wand2,
  Disc3,
  Plus,
  Share2,
  Gauge,
  Smile,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  Volume2,
} from 'lucide-react';

interface SimpleTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBuildingPlaylist: () => void;
  onOpenJukebox: () => void;
}

const TUTORIAL_SLIDES = [
  {
    step: 1,
    badge: 'Step 1 of 4 • Takes 2 Minutes',
    title: 'Enter Their Name & Birth Year',
    subtitle: 'We figure out their golden teenage & young-adult years automatically.',
    icon: Wand2,
    bullets: [
      {
        title: 'No complicated typing required',
        body: 'Just enter your loved one’s name and the year they were born (for example, 1944). We automatically find the music from when they were 10 to 30 years old—the songs their brain remembers best.',
      },
      {
        title: 'Tap big style buttons—or use our 3-Step Express Builder',
        body: 'Simply tap music styles like “1950s Rock & Roll”, “Big Band Swing”, or “Sunday Hymns”. You can even tap the speaker button on any style to hear a sample song right away!',
      },
    ],
    tip: '💡 Tip: Don’t know their exact favorite song? That’s completely okay! Just picking their birth year and 1 or 2 styles builds a wonderful starting playlist.',
  },
  {
    step: 2,
    badge: 'Step 2 of 4 • Easy Everyday Player',
    title: 'Tap Their Mood & Press Play',
    subtitle: 'The Jukebox automatically puts the right songs in the right order.',
    icon: Smile,
    bullets: [
      {
        title: '1. Tap “Mood Before Music”',
        body: 'At the top of the Jukebox, tap how your loved one is feeling right now: Restless, Worried, Quiet, or Ready to Visit.',
      },
      {
        title: '2. Press the Big Gold Play Button',
        body: 'The Jukebox starts with music that matches their current energy, then gently transitions toward calmer, comforting songs.',
      },
      {
        title: '3. Tap “Mood After Listening” when finished',
        body: 'With one tap, save how they felt afterward (Calm & Relaxed, Smiling & Singing, etc.) so your family knows what worked best.',
      },
    ],
    tip: '💡 Tip: Switch on “Sing-Along & Story Prompts” on the player to see large-print song reminders and family questions you can ask together.',
  },
  {
    step: 3,
    badge: 'Step 3 of 4 • Living Family Playlist',
    title: 'Add New Songs & Family Memories Anytime',
    subtitle: 'Your playlist is a living album that grows as new memories surface.',
    icon: Plus,
    bullets: [
      {
        title: 'Add a song in seconds (“+ Add Song / Memory”)',
        body: 'Remembered a song they used to hum in the kitchen or dance to at weddings? Tap “+ Add Song / Memory” right inside the Jukebox, type the title or singer, tap to hear a preview, and add it in one click.',
      },
      {
        title: 'Write down special memories (“✏️ Edit / Add Memory”)',
        body: 'Tap “Edit / Add Memory” on any song to jot down a note like “Danced to this with Grandpa in 1962.” It stays attached to the song for everyone who visits.',
      },
      {
        title: 'Block upsetting songs (“Red Flag”)',
        body: 'If a song ever makes them sad or restless, tap the red “Red Flag” button to hide it permanently.',
      },
    ],
    tip: '💡 Tip: Everything saves automatically right on your device—no account or password needed.',
  },
  {
    step: 4,
    badge: 'Step 4 of 4 • Pace Matcher & Family Sharing',
    title: 'Adjust Song Speed & Share with Family',
    subtitle: 'Match their comfortable walking or movement pace—without changing the singer’s voice.',
    icon: Gauge,
    bullets: [
      {
        title: 'Slower or Faster Tempo (Same Original Voice!)',
        body: 'Use the “Song Speed & Pace Matcher” in the Jukebox to slow a song down (75%–90%) for peaceful relaxation, or match their comfortable walking/movement pace (great for Parkinson’s support) and tap “Gradual Speed-Up”.',
      },
      {
        title: 'Send to Family with 1-Click “Share Link”',
        body: 'Tap “Share Link” at the top of the Jukebox to copy a web link you can text or email to siblings, grandkids, or visiting caregivers so everyone has the exact same playlist.',
      },
    ],
    tip: '💡 Tip: You can reopen this “How It Works” guide anytime from the top bar of the page.',
  },
];

export default function SimpleTutorialModal({
  isOpen,
  onClose,
  onStartBuildingPlaylist,
  onOpenJukebox,
}: SimpleTutorialModalProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentSlide = TUTORIAL_SLIDES[activeSlideIndex];
  const SlideIcon = currentSlide.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simple-tutorial-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden"
    >
      <div className="bg-wildwoods-cream text-wildwoods-slate rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl border-2 sm:border-4 border-wildwoods-amber overflow-hidden my-2 sm:my-8">
        {/* Top Modal Header */}
        <div className="bg-wildwoods-slate text-wildwoods-cream px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-wildwoods-moss">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center font-bold shadow shrink-0">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold truncate">
                Easy Family Guide
              </div>
              <h2
                id="simple-tutorial-title"
                className="text-base sm:text-2xl font-serif font-bold text-wildwoods-cream leading-snug"
              >
                How to Build &amp; Use Your Magic Jukebox
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Tutorial"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream text-xs font-bold flex items-center gap-1 shrink-0 transition"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>

        {/* Step Pill Selector (2x2 Grid on Mobile, 4-across on Desktop) */}
        <div className="bg-wildwoods-parchment px-4 sm:px-6 py-3 border-b border-wildwoods-sand space-y-2">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {TUTORIAL_SLIDES.map((s, idx) => {
              const isCurrent = idx === activeSlideIndex;
              const isDone = idx < activeSlideIndex;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`min-h-[38px] px-2 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition ${
                    isCurrent
                      ? 'bg-wildwoods-slate text-wildwoods-gold shadow-sm'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      : 'bg-white text-slate-600 border border-wildwoods-sand hover:bg-wildwoods-cream'
                  }`}
                >
                  {isDone && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  )}
                  <span>Step {s.step}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Slide Body */}
        <div className="p-4 sm:p-7 space-y-4 sm:space-y-5">
          <div className="flex items-start sm:items-center gap-3.5 pb-3 border-b border-wildwoods-sand">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-wildwoods-slate text-wildwoods-gold flex items-center justify-center shrink-0 shadow-md">
              <SlideIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-wildwoods-slate leading-snug">
                {currentSlide.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {currentSlide.subtitle}
              </p>
            </div>
          </div>

          {/* Numbered Friendly Cards */}
          <div className="space-y-3">
            {currentSlide.bullets.map((b, i) => (
              <div
                key={i}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-wildwoods-sand shadow-sm flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-wildwoods-amber text-wildwoods-slate font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base text-wildwoods-slate">
                    {b.title}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Warm Reassurance Tip Box */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-medium leading-relaxed">
            {currentSlide.tip}
          </div>
        </div>

        {/* Modal Footer with Full-Width Mobile Buttons */}
        <div className="bg-wildwoods-parchment px-4 sm:px-6 py-4 border-t border-wildwoods-sand flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {activeSlideIndex < TUTORIAL_SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setActiveSlideIndex((prev) =>
                  Math.min(TUTORIAL_SLIDES.length - 1, prev + 1)
                )
              }
              className="w-full sm:w-auto sm:order-2 min-h-[50px] px-6 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition"
            >
              Next Step ({activeSlideIndex + 2} of {TUTORIAL_SLIDES.length})
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartBuildingPlaylist();
              }}
              className="w-full sm:w-auto sm:order-2 min-h-[52px] px-6 py-3 rounded-2xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Sparkles className="w-5 h-5" />
              Build My Playlist Now
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center justify-between sm:justify-start gap-2 sm:order-1">
            <button
              type="button"
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-wildwoods-sand disabled:opacity-40 text-wildwoods-slate font-bold text-xs sm:text-sm flex items-center justify-center gap-1 border border-wildwoods-sand transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenJukebox();
              }}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-wildwoods-sand transition"
            >
              <Disc3 className="w-4 h-4 text-wildwoods-sage shrink-0" />
              Open Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  MessageSquareHeart,
  X,
  CheckCircle2,
  Send,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  BetaFeedbackSubmission,
  FEEDBACK_QUICK_TAGS,
  FEEDBACK_RATING_OPTIONS,
  FEEDBACK_ROLE_OPTIONS,
  FeedbackRatingId,
  FeedbackUserRoleId,
  formatFeedbackSummaryText,
  submitBetaFeedback,
} from '@/lib/feedback';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  trackCount: number;
  initialContextPrompt?: string | null;
}

export default function BetaFeedbackModal({
  isOpen,
  onClose,
  activeTab,
  trackCount,
  initialContextPrompt,
}: BetaFeedbackModalProps) {
  const [rating, setRating] = useState<FeedbackRatingId>('loved');
  const [role, setRole] = useState<FeedbackUserRoleId>('family');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [includeContext, setIncludeContext] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<BetaFeedbackSubmission | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submission: BetaFeedbackSubmission = {
      id: `fb-${Date.now()}`,
      rating,
      role,
      tags: selectedTags,
      message: message.trim(),
      contactEmail: contactEmail.trim() || undefined,
      includeContext,
      context: {
        activeTab,
        trackCount,
        viewport:
          typeof window !== 'undefined'
            ? `${window.innerWidth}x${window.innerHeight}`
            : 'unknown',
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await submitBetaFeedback(submission);
      setSubmittedRecord(submission);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = async () => {
    if (!submittedRecord) return;
    try {
      await navigator.clipboard.writeText(formatFeedbackSummaryText(submittedRecord));
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3500);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRecord(null);
    setSelectedTags([]);
    setMessage('');
    setCopiedSummary(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-feedback-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden"
    >
      <div className="bg-wildwoods-cream text-wildwoods-slate rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border-2 sm:border-4 border-wildwoods-amber overflow-hidden my-2 sm:my-6">
        {/* Header */}
        <div className="bg-wildwoods-slate text-wildwoods-cream px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-wildwoods-moss">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-wildwoods-amber text-wildwoods-slate flex items-center justify-center font-bold shadow shrink-0">
              <MessageSquareHeart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-wildwoods-gold truncate">
                Public Beta • Help Us Improve
              </div>
              <h2
                id="beta-feedback-modal-title"
                className="text-base sm:text-2xl font-serif font-bold text-wildwoods-cream leading-snug"
              >
                Share Quick Feedback
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-wildwoods-forest hover:bg-wildwoods-moss text-wildwoods-cream text-xs font-bold flex items-center gap-1 shrink-0"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>

        {submittedRecord ? (
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-wildwoods-slate">
                Thank You for Helping Families!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your feedback has been recorded for the Studio Wildwoods &amp; Magic Jukebox team.
                Every note helps us make this simpler and more comforting for loved ones.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-wildwoods-sand text-left text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {formatFeedbackSummaryText(submittedRecord)}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-wildwoods-sand transition"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    Copied Feedback!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Feedback Note
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 rounded-xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                Back to Jukebox
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {initialContextPrompt && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{initialContextPrompt}</span>
              </div>
            )}

            {/* Step 1: 1-Tap Emoji Reaction */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-wildwoods-slate">
                1. How is The Magic Jukebox working for you today?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {FEEDBACK_RATING_OPTIONS.map((item) => {
                  const isSelected = rating === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRating(item.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                          : 'bg-white hover:bg-wildwoods-parchment border-wildwoods-sand text-wildwoods-slate'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs sm:text-sm leading-tight">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          {item.sublabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Optional Quick Topics */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-wildwoods-slate">
                2. Tap Any Topics That Apply (Optional):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_QUICK_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                        active
                          ? 'bg-wildwoods-slate text-wildwoods-gold border-wildwoods-slate shadow-sm'
                          : 'bg-white hover:bg-wildwoods-parchment text-wildwoods-slate border-wildwoods-sand'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 text-wildwoods-amber" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Open Text Note */}
            <div className="space-y-1.5">
              <label
                htmlFor="beta-feedback-message"
                className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-wildwoods-slate"
              >
                3. What worked well, or what would make this easier?
              </label>
              <textarea
                id="beta-feedback-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what your loved one enjoyed, or anything that felt confusing..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border-2 border-wildwoods-sand focus:border-wildwoods-slate text-sm text-wildwoods-slate"
              />
            </div>

            {/* Step 4: Who is using it + Optional Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                  I am using this as a:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as FeedbackUserRoleId)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white border border-wildwoods-sand text-xs font-bold text-wildwoods-slate"
                >
                  {FEEDBACK_ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="beta-feedback-email"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1"
                >
                  Email (Optional, if you’d like a reply):
                </label>
                <input
                  id="beta-feedback-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com (optional)"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white border border-wildwoods-sand text-xs text-wildwoods-slate"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="rounded border-wildwoods-sand text-wildwoods-slate"
              />
              <span>
                Include anonymous screen info (current view &amp; screen size) to help fix issues
              </span>
            </label>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-wildwoods-parchment">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-wildwoods-parchment hover:bg-wildwoods-sand text-wildwoods-slate font-bold text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-wildwoods-amber hover:bg-wildwoods-gold text-wildwoods-slate font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg transition"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

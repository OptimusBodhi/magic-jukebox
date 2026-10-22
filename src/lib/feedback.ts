export type FeedbackRatingId = 'loved' | 'helpful' | 'confused' | 'bug';

export type FeedbackUserRoleId = 'family' | 'caregiver' | 'clinician' | 'exploring';

export interface BetaFeedbackSubmission {
  id: string;
  rating: FeedbackRatingId;
  role: FeedbackUserRoleId;
  tags: string[];
  message: string;
  contactEmail?: string;
  includeContext: boolean;
  context?: {
    activeTab: string;
    trackCount: number;
    viewport: string;
    timestamp: string;
  };
}

export const FEEDBACK_STORAGE_KEY = 'magic_jukebox_beta_feedback_history_v1';

export const FEEDBACK_RATING_OPTIONS: Array<{
  id: FeedbackRatingId;
  emoji: string;
  label: string;
  sublabel: string;
}> = [
  {
    id: 'loved',
    emoji: '😍',
    label: 'Loved It',
    sublabel: 'Worked great for us',
  },
  {
    id: 'helpful',
    emoji: '🙂',
    label: 'Good & Helpful',
    sublabel: 'Easy to use overall',
  },
  {
    id: 'confused',
    emoji: '🤔',
    label: 'Something Confused Me',
    sublabel: 'A button or step felt unclear',
  },
  {
    id: 'bug',
    emoji: '🐞',
    label: 'Found a Problem',
    sublabel: 'Audio or screen issue',
  },
];

export const FEEDBACK_ROLE_OPTIONS: Array<{
  id: FeedbackUserRoleId;
  label: string;
}> = [
  { id: 'family', label: 'Family / Loved One' },
  { id: 'caregiver', label: 'Caregiver' },
  { id: 'clinician', label: 'Music Therapist / Clinician' },
  { id: 'exploring', label: 'Just Trying It Out' },
];

export const FEEDBACK_QUICK_TAGS: string[] = [
  'Easy to set up',
  'Loved the family memories',
  'Wanted full-length songs',
  'Button or menu was confusing',
  'Finding songs',
  'Song speed / pace matcher',
  'Sharing with family',
];

/**
 * Formats a BetaFeedbackSubmission into a clean human-readable summary for copying or emailing.
 */
export function formatFeedbackSummaryText(submission: BetaFeedbackSubmission): string {
  const ratingObj =
    FEEDBACK_RATING_OPTIONS.find((r) => r.id === submission.rating) ||
    FEEDBACK_RATING_OPTIONS[0];
  const roleObj =
    FEEDBACK_ROLE_OPTIONS.find((r) => r.id === submission.role) ||
    FEEDBACK_ROLE_OPTIONS[0];

  const lines = [
    `The Magic Jukebox — Public Beta Feedback`,
    `----------------------------------------`,
    `Experience: ${ratingObj.emoji} ${ratingObj.label}`,
    `Who is using it: ${roleObj.label}`,
    submission.tags.length > 0 ? `Topics: ${submission.tags.join(', ')}` : '',
    submission.message.trim() ? `\nNotes / Suggestions:\n${submission.message.trim()}` : '',
    submission.contactEmail?.trim() ? `\nReply Email: ${submission.contactEmail.trim()}` : '',
    submission.includeContext && submission.context
      ? `\nApp Info: Screen=${submission.context.activeTab} | Songs=${submission.context.trackCount} | ScreenSize=${submission.context.viewport} | Time=${submission.context.timestamp}`
      : '',
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Saves feedback to local history and submits to Netlify Forms (when deployed on Netlify).
 */
export async function submitBetaFeedback(
  submission: BetaFeedbackSubmission
): Promise<{ deliveredOnline: boolean; savedLocally: boolean }> {
  let savedLocally = false;
  try {
    if (typeof window !== 'undefined') {
      const existingRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const existing: BetaFeedbackSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify([submission, ...existing].slice(0, 30))
      );
      savedLocally = true;
    }
  } catch {
    // Ignore local storage quota errors
  }

  let deliveredOnline = false;
  try {
    const formData = new URLSearchParams({
      'form-name': 'magic-jukebox-beta-feedback',
      rating: submission.rating,
      role: submission.role,
      tags: submission.tags.join(', '),
      message: submission.message.trim(),
      contactEmail: submission.contactEmail?.trim() || '',
      activeTab: submission.includeContext ? submission.context?.activeTab || '' : '',
      trackCount: submission.includeContext ? String(submission.context?.trackCount ?? '') : '',
      viewport: submission.includeContext ? submission.context?.viewport || '' : '',
      timestamp: submission.includeContext ? submission.context?.timestamp || '' : '',
    });

    const res = await fetch('/__forms.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    if (res.ok) {
      deliveredOnline = true;
    }
  } catch {
    // Offline or local dev server
  }

  return { deliveredOnline, savedLocally };
}

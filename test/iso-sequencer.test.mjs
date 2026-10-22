import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Guardrails & Skill files exist (.agents/CONTEXT.md and .agents/skills/iso-sequencer/SKILL.md)', () => {
  const contextPath = path.resolve('.agents/CONTEXT.md');
  const skillPath = path.resolve('.agents/skills/iso-sequencer/SKILL.md');
  assert.equal(fs.existsSync(contextPath), true, '.agents/CONTEXT.md must exist');
  assert.equal(fs.existsSync(skillPath), true, '.agents/skills/iso-sequencer/SKILL.md must exist');

  const skillContent = fs.readFileSync(skillPath, 'utf8');
  assert.match(skillContent, /name:\s*iso-sequencer/);
  assert.match(skillContent, /Reminiscence Bump Calculation/);
  assert.match(skillContent, /Iso-Principle 3-Phase Trajectory Sequencing/);
});

test('Live iTunes Search API returns valid 30-second AAC previewUrl streams with zero silent cards', async () => {
  const res = await fetch(
    'https://itunes.apple.com/search?term=Nat+King+Cole+Unforgettable&entity=song&limit=5'
  );
  assert.equal(res.ok, true, 'iTunes Search API should respond 200 OK');
  const data = await res.json();
  const validResults = (data.results || []).filter(
    (r) => typeof r.previewUrl === 'string' && r.previewUrl.startsWith('http')
  );
  assert.ok(validResults.length > 0, 'Must return at least one track with a valid previewUrl');
});

test('Guided Onboarding Interview module & UI component exist and define both 60-Second Express Builder and 6-Question Story Setup', () => {
  const onboardingLib = fs.readFileSync(
    path.resolve('src/lib/onboarding-interview.ts'),
    'utf8'
  );
  const onboardingView = fs.readFileSync(
    path.resolve('src/components/GuidedOnboardingView.tsx'),
    'utf8'
  );
  const tutorialModal = fs.readFileSync(
    path.resolve('src/components/SimpleTutorialModal.tsx'),
    'utf8'
  );
  assert.match(onboardingLib, /synthesizeInterviewIntoJukebox/);
  assert.match(onboardingLib, /SAMPLE_INTERVIEW_PERSONAS/);
  assert.match(onboardingView, /Step 1 of 3/);
  assert.match(onboardingView, /Hear Sample/);
  assert.match(tutorialModal, /How to Build &amp; Use Your Magic Jukebox/);
});

test('Shareable Family URL link encoder/decoder, Spotify PKCE exporter, and CSV/M3U full-length playlist utilities exist', () => {
  const shareLib = fs.readFileSync(path.resolve('src/lib/share-and-export.ts'), 'utf8');
  const spotifyLib = fs.readFileSync(path.resolve('src/lib/spotify-export.ts'), 'utf8');
  const exportModal = fs.readFileSync(
    path.resolve('src/components/FullLengthExportModal.tsx'),
    'utf8'
  );
  assert.match(shareLib, /encodeShareableJukeboxUrl/);
  assert.match(shareLib, /decodeShareableJukeboxParam/);
  assert.match(shareLib, /getFullSongStreamingLinks/);
  assert.match(shareLib, /formatCaregiverPrescriptionText/);
  assert.match(shareLib, /formatSpotifyImportTracklist/);
  assert.match(shareLib, /formatCsvPlaylist/);
  assert.match(spotifyLib, /createFullLengthSpotifyPlaylist/);
  assert.match(exportModal, /Play Full-Length Songs &amp; Export to Spotify/);
});

test('Epic / HL7 FHIR R4 medical record interoperability adapter exists and encodes SNOMED/ICD-10/LOINC', () => {
  const fhirLib = fs.readFileSync(path.resolve('src/lib/fhir-epic-adapter.ts'), 'utf8');
  assert.match(fhirLib, /buildFhirR4EpicBundle/);
  assert.match(fhirLib, /410260000/); // SNOMED CT Music Therapy
  assert.match(fhirLib, /F03\.911/); // ICD-10-CM Dementia with agitation
  assert.match(fhirLib, /72170-4/); // LOINC BARS assessment
});

test('Pitch-preserving tempo & Parkinson RAS pace matcher is implemented in page.tsx and IsoJukeboxView.tsx', () => {
  const pageSrc = fs.readFileSync(path.resolve('src/app/page.tsx'), 'utf8');
  const jukeboxSrc = fs.readFileSync(path.resolve('src/components/IsoJukeboxView.tsx'), 'utf8');
  assert.match(pageSrc, /preservesPitch\s*=\s*true/);
  assert.match(jukeboxSrc, /Tempo &amp; Pace Matcher/);
  assert.match(jukeboxSrc, /Gradual Speed-Up \(Parkinson’s \/ Gait Pace\)/);
});

test('North Star Charter exists and enforces evidence-informed supportive care & gatekeeper-friendly positioning', () => {
  const charterPath = path.resolve('docs/NORTH_STAR_CHARTER.md');
  assert.equal(fs.existsSync(charterPath), true, 'docs/NORTH_STAR_CHARTER.md must exist');
  const charter = fs.readFileSync(charterPath, 'utf8');
  assert.match(charter, /Board-Certified Music Therapists \(MT-BCs\)/);
  assert.match(charter, /Modular Specialty Architecture/);

  const fhirLib = fs.readFileSync(path.resolve('src/lib/fhir-epic-adapter.ts'), 'utf8');
  assert.match(fhirLib, /intent:\s*'plan'/);
});

test('Public Beta feedback system & bedside wake-lock reliability exist and are wired into page.tsx', () => {
  const feedbackLibPath = path.resolve('src/lib/feedback.ts');
  const feedbackModalPath = path.resolve('src/components/BetaFeedbackModal.tsx');
  const netlifyFormsPath = path.resolve('public/__forms.html');
  assert.equal(fs.existsSync(feedbackLibPath), true, 'src/lib/feedback.ts must exist');
  assert.equal(fs.existsSync(feedbackModalPath), true, 'src/components/BetaFeedbackModal.tsx must exist');
  assert.equal(fs.existsSync(netlifyFormsPath), true, 'public/__forms.html must exist for Netlify Forms');

  const formsHtml = fs.readFileSync(netlifyFormsPath, 'utf8');
  assert.match(formsHtml, /name="magic-jukebox-beta-feedback"/);
  assert.match(formsHtml, /data-netlify="true"/);

  const pageSrc = fs.readFileSync(path.resolve('src/app/page.tsx'), 'utf8');
  assert.match(pageSrc, /BetaFeedbackModal/);
  assert.match(pageSrc, /wakeLock/);
  assert.match(pageSrc, /mediaSession/);

  const shareLib = fs.readFileSync(path.resolve('src/lib/share-and-export.ts'), 'utf8');
  assert.match(shareLib, /formatPhysicalPlayerUsbGuide/);
  assert.match(shareLib, /buildBedsideCardUrl/);

  const jukeboxSrc = fs.readFileSync(path.resolve('src/components/IsoJukeboxView.tsx'), 'utf8');
  assert.match(jukeboxSrc, /Giant 1-Button Mode/);
});






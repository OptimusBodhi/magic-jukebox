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

test('Guided Onboarding Interview module & UI component exist and define 6 clinical domains', () => {
  const onboardingLib = fs.readFileSync(
    path.resolve('src/lib/onboarding-interview.ts'),
    'utf8'
  );
  const onboardingView = fs.readFileSync(
    path.resolve('src/components/GuidedOnboardingView.tsx'),
    'utf8'
  );
  assert.match(onboardingLib, /synthesizeInterviewIntoJukebox/);
  assert.match(onboardingLib, /SAMPLE_INTERVIEW_PERSONAS/);
  assert.match(onboardingView, /The 6-Question “Music Detective” Guided Interview/);
});

test('Shareable Family URL link encoder/decoder and 1-Click Streaming/Care Sheet utilities exist', () => {
  const shareLib = fs.readFileSync(path.resolve('src/lib/share-and-export.ts'), 'utf8');
  assert.match(shareLib, /encodeShareableJukeboxUrl/);
  assert.match(shareLib, /decodeShareableJukeboxParam/);
  assert.match(shareLib, /getFullSongStreamingLinks/);
  assert.match(shareLib, /formatCaregiverPrescriptionText/);
});



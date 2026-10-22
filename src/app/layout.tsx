import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Magic Jukebox | Personalized Music Sequencing & Caregiver Support',
  description:
    'Evidence-informed personalized music sequencing, pitch-preserving pace support, family memory prompts, and shareable EHR documentation for dementia, Parkinson’s, and supportive care.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-wildwoods-cream text-wildwoods-slate selection:bg-wildwoods-amber selection:text-wildwoods-slate">
        {children}
      </body>
    </html>
  );
}

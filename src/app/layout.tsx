import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Magic Jukebox | Precision Music Medicine for Dementia',
  description:
    'Transforming difficult emotions in Alzheimer’s and dementia care through the clinical Iso-Principle, Reminiscence Bump co-curation, and preserved cACC / ventral pre-SMA neural scaffolding.',
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

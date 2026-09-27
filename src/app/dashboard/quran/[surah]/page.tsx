import QuranReaderClient from './quran-reader-client';

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surah: (i + 1).toString(),
  }));
}

export default function QuranReaderPage({ params }: { params: Promise<{ surah: string }> }) {
  return <QuranReaderClient params={params} />;
}

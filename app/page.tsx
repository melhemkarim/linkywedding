import Invitation from '@/components/Invitation';
import { coupleName, wedding, type ThemeName } from '@/lib/wedding';

export const metadata = {
  title: coupleName,
  description: 'You are invited.',
  robots: { index: false, follow: false },
};

const clean = (v?: string) => (v ?? '').replace(/[^\p{L}\p{N}&'’.\- ]/gu, '').trim().slice(0, 60);

/**
 * The link opens the invitation directly. Optionally personalise it: /?to=Sophia%20%26%20Marc
 * (that name is embroidered on the veil instead of the couple's names). Add &theme=noir for soft black.
 */
export default function Home({ searchParams }: { searchParams: { to?: string; theme?: string } }) {
  const guestName = clean(searchParams.to);
  const theme: ThemeName =
    searchParams.theme === 'noir' || searchParams.theme === 'emerald' ? searchParams.theme : wedding.defaultTheme;

  return <Invitation veilName={guestName || coupleName} guestName={guestName || undefined} theme={theme} />;
}

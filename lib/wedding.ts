export type ThemeName = 'emerald' | 'noir';

/**
 * Everything wedding-specific lives here. Date and venue are placeholders — replace with the real ones.
 */
export const wedding = {
  couple: { first: 'Karim', second: 'Dana' },
  defaultTheme: 'emerald' as ThemeName,

  // Countdown target + calendar event
  timezone: 'Asia/Beirut',
  start: '2027-06-12T16:30:00+03:00',
  end: '2027-06-13T00:30:00+03:00',
  timeLabel: 'Half past four in the afternoon',

  venue: {
    name: 'Domaine des Roses',
    address: 'Route de la Mer, Batroun',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Batroun+Lebanon',
  },

  dressCode: {
    title: 'Black tie optional',
    note: 'Evening gowns and dinner jackets. Ivory is reserved for the bride.',
  },

  // The pearl strand starts with one pearl per day from this date
  invitesSentAt: '2026-09-01',
  rsvpBy: '1 May 2027',

  // Set to a hosted audio URL to use your own track; otherwise a soft generated ambience plays.
  musicUrl: null as string | null,
};

export const initials = [
  wedding.couple.first.charAt(0).toUpperCase(),
  wedding.couple.second.charAt(0).toUpperCase(),
] as const;

export const coupleName = `${wedding.couple.first} & ${wedding.couple.second}`;

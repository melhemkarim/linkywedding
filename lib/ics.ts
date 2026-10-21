import { wedding, coupleName } from './wedding';

const fmt = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const esc = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

export function buildIcs() {
  const { venue, dressCode } = wedding;
  const title = `${coupleName} — Wedding`;
  const desc = [`Venue: ${venue.name}, ${venue.address}`, `Dress code: ${dressCode.title}`].join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Veil Invite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${fmt(wedding.start)}@veil-invite`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(wedding.start)}`,
    `DTEND:${fmt(wedding.end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(`${venue.name}, ${venue.address}`)}`,
    `DESCRIPTION:${esc(desc)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)} is tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${coupleName} — Wedding`,
    dates: `${fmt(wedding.start)}/${fmt(wedding.end)}`,
    location: `${wedding.venue.name}, ${wedding.venue.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

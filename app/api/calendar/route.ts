import { buildIcs } from '@/lib/ics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(buildIcs(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      // inline so iOS offers "Add to Calendar" directly
      'Content-Disposition': 'inline; filename="wedding.ics"',
      'Cache-Control': 'no-store',
    },
  });
}

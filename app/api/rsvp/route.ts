import { coupleName } from '@/lib/wedding';

export const runtime = 'nodejs';

type Body = {
  name?: string;
  attending?: boolean;
  note?: string;
  signature?: string;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const name = (body.name ?? '').trim().slice(0, 80);
  if (!name || typeof body.attending !== 'boolean') return Response.json({ ok: false }, { status: 400 });

  const note = (body.note ?? '').slice(0, 400);
  const sig =
    typeof body.signature === 'string' && body.signature.startsWith('data:image/png;base64,') && body.signature.length < 600_000
      ? body.signature.split(',')[1]
      : null;

  const subject = `${body.attending ? '✅' : '✖'} RSVP — ${name} ${body.attending ? 'is attending' : 'declined'}`;
  const text = [`${coupleName} wedding`, `${name} — ${body.attending ? 'attending' : 'declined'}`, note ? `Note: ${note}` : '']
    .filter(Boolean)
    .join('\n');

  const key = process.env.RESEND_API_KEY;
  const to = process.env.RSVP_TO;
  const from = process.env.RSVP_FROM ?? 'Invitations <onboarding@resend.dev>';

  if (!key || !to) {
    // Local/dev: no email configured, just log it.
    console.log('[rsvp]', text);
    return Response.json({ ok: true, delivered: false });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((s) => s.trim()),
      subject,
      html: `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6">${esc(text).replace(/\n/g, '<br>')}</div>`,
      text,
      attachments: sig ? [{ filename: 'signature.png', content: sig }] : undefined,
    }),
  });

  if (!res.ok) {
    console.error('[rsvp] resend failed', res.status, await res.text());
    return Response.json({ ok: false }, { status: 502 });
  }
  return Response.json({ ok: true, delivered: true });
}

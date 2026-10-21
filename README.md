# Karim & Dana — veil invite

White tulle veil → gold monogram → calendar + countdown + pearls → location + dress code → signature RSVP with wax seal.

```bash
npm install
npm run dev        # http://localhost:3000 — opens the invitation directly
```

## Make it yours
- `lib/wedding.ts` — names, date/time, venue and map link, dress code, RSVP deadline, optional `musicUrl`
- `app/api/rsvp/route.ts` — emails via Resend when `RESEND_API_KEY` and `RSVP_TO` are set (optional `RSVP_FROM`); otherwise logs to the console
- `npm run font` — regenerates the 3D monogram typeface from Cormorant Garamond Italic

## Optional personal links
- `/?to=Sophia%20%26%20Marc` embroiders that name on the veil, adds "Reserved for…" and pre-fills the RSVP name
- `?theme=noir` switches emerald to soft black; `?tier=lite` previews the lighter CSS veil

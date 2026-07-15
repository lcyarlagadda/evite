export function normalizeRsvpEntry(input) {
  const name = String(input?.name || '').trim();
  const attendance = input?.attendance;
  const prediction = input?.prediction;

  let adults = '0';
  let kids = '0';

  if (attendance !== 'no') {
    if (input?.adults != null || input?.kids != null) {
      adults = String(input.adults ?? '0');
      kids = String(input.kids ?? '0');
    } else if (input?.guests != null) {
      adults = String(input.guests);
      kids = '0';
    }
  }

  const adultCount = Number.parseInt(adults, 10) || 0;
  const kidCount = Number.parseInt(kids, 10) || 0;
  const total = attendance === 'no' ? 0 : adultCount + kidCount;

  return {
    name,
    attendance,
    prediction,
    adults,
    kids,
    guests: String(total),
  };
}

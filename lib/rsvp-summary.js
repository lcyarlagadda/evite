export function getRsvpHeadCount(rsvp) {
  if (rsvp.attendance === 'no') {
    return { adults: 0, kids: 0, total: 0 };
  }

  if (rsvp.adults != null || rsvp.kids != null) {
    const adults = Number.parseInt(rsvp.adults, 10) || 0;
    const kids = Number.parseInt(rsvp.kids, 10) || 0;
    return { adults, kids, total: adults + kids };
  }

  const total = Number.parseInt(rsvp.guests, 10) || 0;
  return { adults: total, kids: 0, total };
}

export function summarizeRsvps(rsvps) {
  const summary = {
    total: rsvps.length,
    yes: 0,
    maybe: 0,
    no: 0,
    guestCount: 0,
    adultCount: 0,
    kidCount: 0,
    teamBoy: 0,
    teamGirl: 0,
  };

  for (const rsvp of rsvps) {
    if (rsvp.attendance === 'yes') summary.yes += 1;
    else if (rsvp.attendance === 'maybe') summary.maybe += 1;
    else if (rsvp.attendance === 'no') summary.no += 1;

    if (rsvp.attendance !== 'no') {
      const { adults, kids, total } = getRsvpHeadCount(rsvp);
      summary.guestCount += total;
      summary.adultCount += adults;
      summary.kidCount += kids;
    }

    if (rsvp.prediction === 'boy') summary.teamBoy += 1;
    else if (rsvp.prediction === 'girl') summary.teamGirl += 1;
  }

  return summary;
}

export function summarizeRsvps(rsvps) {
  const summary = {
    total: rsvps.length,
    yes: 0,
    maybe: 0,
    no: 0,
    guestCount: 0,
    teamBoy: 0,
    teamGirl: 0,
  };

  for (const rsvp of rsvps) {
    if (rsvp.attendance === 'yes') summary.yes += 1;
    else if (rsvp.attendance === 'maybe') summary.maybe += 1;
    else if (rsvp.attendance === 'no') summary.no += 1;

    if (rsvp.attendance !== 'no') {
      summary.guestCount += Number.parseInt(rsvp.guests, 10) || 0;
    }

    if (rsvp.prediction === 'boy') summary.teamBoy += 1;
    else if (rsvp.prediction === 'girl') summary.teamGirl += 1;
  }

  return summary;
}

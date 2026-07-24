function esc(s: string): string {
	return s
		.replace(/\\/g, '\\\\')
		.replace(/\r?\n/g, '\\n')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,');
}

function fmtUtc(d: Date): string {
	return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildGoogleCalendarIcs(input: {
	id: number;
	title: string;
	description: string;
	location: string;
	start: Date;
	siteUrl: string;
}): string {
	const end = new Date(input.start.getTime() + 2 * 60 * 60 * 1000);
	let host = 'trailblazers';
	try {
		host = new URL(input.siteUrl).hostname || host;
	} catch {
		/* invalid siteUrl */
	}
	const uid = `event-${input.id}@${host}`;
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Trailblazers//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${fmtUtc(new Date())}`,
		`DTSTART:${fmtUtc(input.start)}`,
		`DTEND:${fmtUtc(end)}`,
		`SUMMARY:${esc(input.title)}`,
		`DESCRIPTION:${esc(input.description)}`,
		`LOCATION:${esc(input.location)}`,
		`URL:${esc(`${input.siteUrl.replace(/\/$/, '')}/events/${input.id}`)}`,
		'END:VEVENT',
		'END:VCALENDAR'
	];
	return lines.join('\r\n');
}

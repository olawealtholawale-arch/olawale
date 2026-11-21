export type EnquiryOption = 'Hotel Room' | 'Event Hall' | 'Short Let Apartment';

export type LocationOption = 'Ikorodu' | 'Lagos Island';

export const ENQUIRY_OPTIONS: EnquiryOption[] = [
  'Hotel Room',
  'Event Hall',
  'Short Let Apartment',
];

export const LOCATION_OPTIONS: LocationOption[] = ['Ikorodu', 'Lagos Island'];

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface InspectionPayload {
  fullName: string;
  email: string;
  phone: string;
  enquiry: EnquiryOption[];
  inspectionDate: string;
  inspectionTime: string;
  inspectionDateTime: string;
  budget: number;
  location: LocationOption;
  specialRequirement: string;
  submittedAt: string;
}

export interface DynamicSlot {
  label: string;
  date?: string;
  time?: string;
  raw: string;
}

export interface DynamicDetailEntry {
  key: string;
  label: string;
  value: string;
}

export interface ParsedWebhookOutcome {
  kind: 'success' | 'unavailable' | 'error';
  webhookStatus: number;
  message: string;
  hint?: string;
  availableSlots: DynamicSlot[];
  details: DynamicDetailEntry[];
}

function unwrapN8nData(input: unknown): Record<string, unknown> | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    const first = input[0];
    return first && typeof first === 'object' ? unwrapN8nData(first) : null;
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      return { ...obj, ...(obj.data as Record<string, unknown>) };
    }
    if (obj.json && typeof obj.json === 'object' && !Array.isArray(obj.json)) {
      return { ...obj, ...(obj.json as Record<string, unknown>) };
    }
    return obj;
  }
  return null;
}

function normalizeTimeValue(raw: string): string | undefined {
  const trimmed = raw.trim();
  const twentyFourMatch = trimmed.match(/\b(\d{1,2}):(\d{2})\b/);
  if (twentyFourMatch) {
    const ampmMatch = trimmed.match(/\b(AM|PM)\b/i);
    let hours = parseInt(twentyFourMatch[1], 10);
    const mins = twentyFourMatch[2];
    if (ampmMatch) {
      const meridiem = ampmMatch[1].toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }
    if (hours >= 0 && hours <= 23) {
      return `${String(hours).padStart(2, '0')}:${mins}`;
    }
  }
  return undefined;
}

function normalizeDateValue(raw: string): string | undefined {
  const match = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  return match ? match[1] : undefined;
}

function extractSlotsFromUnknown(rawSlots: unknown): DynamicSlot[] {
  if (!rawSlots) return [];

  let items: unknown[] = [];
  if (Array.isArray(rawSlots)) {
    items = rawSlots;
  } else if (typeof rawSlots === 'string') {
    items = rawSlots
      .split(/[,;\n|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (typeof rawSlots === 'object') {
    items = Object.values(rawSlots as Record<string, unknown>);
  }

  const parsed: DynamicSlot[] = [];

  for (const item of items) {
    if (typeof item === 'string' || typeof item === 'number') {
      const text = String(item).trim();
      if (!text) continue;
      parsed.push({
        label: text,
        date: normalizeDateValue(text),
        time: normalizeTimeValue(text),
        raw: text,
      });
    } else if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>;
      const rawDate =
        typeof rec.date === 'string'
          ? rec.date
          : typeof rec.inspectionDate === 'string'
            ? rec.inspectionDate
            : typeof rec.day === 'string'
              ? rec.day
              : undefined;
      const rawTime =
        typeof rec.time === 'string'
          ? rec.time
          : typeof rec.slot === 'string'
            ? rec.slot
            : typeof rec.timeslot === 'string'
              ? rec.timeslot
              : typeof rec.startTime === 'string'
                ? rec.startTime
                : typeof rec.inspectionTime === 'string'
                  ? rec.inspectionTime
                  : undefined;
      const rawLabel =
        typeof rec.label === 'string'
          ? rec.label
          : typeof rec.display === 'string'
            ? rec.display
            : typeof rec.datetime === 'string'
              ? rec.datetime
              : [rawDate, rawTime].filter(Boolean).join(' · ') || JSON.stringify(rec);

      const dateVal = rawDate ? normalizeDateValue(rawDate) ?? rawDate : normalizeDateValue(rawLabel);
      const timeVal = rawTime ? normalizeTimeValue(rawTime) ?? rawTime : normalizeTimeValue(rawLabel);

      parsed.push({
        label: rawLabel,
        date: dateVal,
        time: timeVal,
        raw: rawLabel,
      });
    }
  }

  return parsed;
}

function formatKeyLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseN8nWebhookResponse(
  ok: boolean,
  webhookStatus: number,
  rawData: unknown,
  rawText: string
): ParsedWebhookOutcome {
  const obj = unwrapN8nData(rawData);

  const slotCandidateKeys = [
    'availableSlots',
    'available_slots',
    'availableTimeslots',
    'available_timeslots',
    'availableTimeSlots',
    'suggestedSlots',
    'suggested_slots',
    'alternativeSlots',
    'alternatives',
    'timeslots',
    'time_slots',
    'openSlots',
    'open_slots',
    'slots',
  ];

  let availableSlots: DynamicSlot[] = [];
  if (obj) {
    for (const key of slotCandidateKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        const extracted = extractSlotsFromUnknown(obj[key]);
        if (extracted.length > 0) {
          availableSlots = extracted;
          break;
        }
      }
    }
  }

  const messageFields = ['message', 'msg', 'statusMessage', 'reason', 'reply', 'output', 'text', 'error'];
  let message = '';
  if (obj) {
    for (const field of messageFields) {
      const val = obj[field];
      if (typeof val === 'string' && val.trim().length > 0) {
        message = val.trim();
        break;
      }
    }
  }
  if (!message && rawText.trim().length > 0) {
    message = rawText.trim();
  }

  const hint = obj && typeof obj.hint === 'string' ? obj.hint : undefined;

  const statusText = obj
    ? [obj.status, obj.state, obj.result, obj.availability]
        .filter((v) => typeof v === 'string')
        .join(' ')
        .toLowerCase()
    : '';

  const explicitlyUnavailable =
    Boolean(
      obj &&
        (obj.available === false ||
          obj.isAvailable === false ||
          obj.slotAvailable === false ||
          obj.timeslotAvailable === false ||
          obj.success === false ||
          /unavail|booked|taken|busy|conflict|full|occup|not[_\s-]?available/i.test(statusText))
    ) ||
    availableSlots.length > 0 ||
    webhookStatus === 409;

  const hiddenKeys = new Set([
    ...slotCandidateKeys,
    ...messageFields,
    'hint',
    'available',
    'isAvailable',
    'slotAvailable',
    'timeslotAvailable',
    'success',
    'code',
    'data',
    'json',
  ]);

  const details: DynamicDetailEntry[] = [];
  if (obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (hiddenKeys.has(key) || value === null || value === undefined || value === '') continue;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        details.push({
          key,
          label: formatKeyLabel(key),
          value: String(value),
        });
      } else if (Array.isArray(value) && value.every((v) => typeof v === 'string' || typeof v === 'number')) {
        details.push({
          key,
          label: formatKeyLabel(key),
          value: value.join(', '),
        });
      }
    }
  }

  if (explicitlyUnavailable && (ok || webhookStatus === 409 || availableSlots.length > 0)) {
    return {
      kind: 'unavailable',
      webhookStatus,
      message:
        message ||
        'The requested inspection slot is currently unavailable. Please choose from the available slots returned below.',
      hint,
      availableSlots,
      details,
    };
  }

  if (!ok) {
    return {
      kind: 'error',
      webhookStatus,
      message: message || `Webhook request returned status ${webhookStatus}.`,
      hint,
      availableSlots,
      details,
    };
  }

  return {
    kind: 'success',
    webhookStatus,
    message: message || 'Your private inspection request has been received and confirmed.',
    hint,
    availableSlots: [],
    details,
  };
}

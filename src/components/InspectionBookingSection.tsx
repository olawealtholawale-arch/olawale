import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import {
  EMAIL_REGEX,
  ENQUIRY_OPTIONS,
  LOCATION_OPTIONS,
  parseN8nWebhookResponse,
  type DynamicSlot,
  type EnquiryOption,
  type InspectionPayload,
  type LocationOption,
  type ParsedWebhookOutcome,
} from '../types/booking';

interface InspectionBookingSectionProps {
  preselectedSpace: EnquiryOption | null;
  onPreselectionApplied: () => void;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  enquiry?: string;
  inspectionDate?: string;
  inspectionTime?: string;
  budget?: string;
  location?: string;
}

function getLocalTodayYYYYMMDD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getUpcomingDays(count: number): { iso: string; dayName: string; dayNum: string; month: string }[] {
  const result: { iso: string; dayName: string; dayNum: string; month: string }[] = [];
  const base = new Date();
  for (let i = 0; i < count; i += 1) {
    const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    result.push({
      iso,
      dayName: i === 0 ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: String(dt.getDate()),
      month: dt.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return result;
}

const INSPECTION_HOUR_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

function isTimeInPastToday(dateStr: string, timeStr: string): boolean {
  if (!dateStr || !timeStr) return false;
  const todayStr = getLocalTodayYYYYMMDD();
  if (dateStr !== todayStr) return false;

  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;

  const now = new Date();
  const selected = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  return selected.getTime() <= now.getTime();
}

export function InspectionBookingSection({
  preselectedSpace,
  onPreselectionApplied,
}: InspectionBookingSectionProps) {
  const todayStr = useMemo(() => getLocalTodayYYYYMMDD(), []);
  const upcomingDays = useMemo(() => getUpcomingDays(6), []);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [enquiry, setEnquiry] = useState<EnquiryOption[]>(['Hotel Room']);
  const [inspectionDate, setInspectionDate] = useState(todayStr);
  const [inspectionTime, setInspectionTime] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState<LocationOption>('Ikorodu');
  const [specialRequirement, setSpecialRequirement] = useState('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<ParsedWebhookOutcome | null>(null);

  useEffect(() => {
    if (preselectedSpace) {
      setEnquiry((prev) =>
        prev.includes(preselectedSpace) ? prev : [...prev, preselectedSpace]
      );
      setErrors((prev) => ({ ...prev, enquiry: undefined }));
      onPreselectionApplied();
    }
  }, [preselectedSpace, onPreselectionApplied]);

  const validateAll = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    const digitsCount = phone.replace(/\D/g, '').length;
    if (!phone.trim() || digitsCount < 7) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }

    if (enquiry.length === 0) {
      nextErrors.enquiry = 'Select at least one space type for your enquiry.';
    }

    if (!inspectionDate) {
      nextErrors.inspectionDate = 'Please choose an inspection date.';
    } else if (inspectionDate < todayStr) {
      nextErrors.inspectionDate = 'Past dates cannot be selected. Choose today or a future date.';
    }

    if (!inspectionTime) {
      nextErrors.inspectionTime = 'Please select an inspection time.';
    } else if (isTimeInPastToday(inspectionDate, inspectionTime)) {
      nextErrors.inspectionTime = 'Selected time has already passed today. Choose an upcoming time.';
    }

    const numericBudget = Number(budget);
    if (!budget.trim() || Number.isNaN(numericBudget) || numericBudget <= 0) {
      nextErrors.budget = 'Please enter a valid budget amount.';
    }

    if (!location) {
      nextErrors.location = 'Please select a property location.';
    }

    return nextErrors;
  };

  const handleToggleEnquiry = (option: EnquiryOption) => {
    setEnquiry((prev) => {
      const next = prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option];
      if (next.length > 0) {
        setErrors((err) => ({ ...err, enquiry: undefined }));
      }
      return next;
    });
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    const trimmed = email.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, email: 'Email address is required.' }));
    } else if (!EMAIL_REGEX.test(trimmed)) {
      setErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address (e.g. name@domain.com).',
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleApplyReturnedSlot = (slot: DynamicSlot) => {
    if (slot.date && slot.date >= todayStr) {
      setInspectionDate(slot.date);
      setErrors((prev) => ({ ...prev, inspectionDate: undefined }));
    }
    if (slot.time) {
      setInspectionTime(slot.time);
      setErrors((prev) => ({ ...prev, inspectionTime: undefined }));
    }
    setOutcome(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAll();
    setErrors(validationErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      enquiry: true,
      inspectionDate: true,
      inspectionTime: true,
      budget: true,
      location: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setOutcome(null);

    const payload: InspectionPayload = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      enquiry,
      inspectionDate,
      inspectionTime,
      inspectionDateTime: `${inspectionDate}T${inspectionTime}`,
      budget: Number(budget),
      location,
      specialRequirement: specialRequirement.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        'https://olawale99.app.n8n.cloud/webhook/c0d88493-6e0d-447f-a5d0-6264f7fc2c02',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: JSON.stringify(payload),
        }
      );

      const rawText = await response.text();
      let parsedData: unknown = null;

      if (rawText.trim().length > 0) {
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          parsedData = { message: rawText.trim() };
        }
      }

      const parsed = parseN8nWebhookResponse(
        response.ok,
        response.status,
        parsedData,
        rawText
      );

      setOutcome(parsed);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to reach the webhook endpoint.';
      setOutcome({
        kind: 'error',
        webhookStatus: 0,
        message: `Direct webhook request failed (${msg}). Ensure the n8n workflow is active and allows browser requests.`,
        availableSlots: [],
        details: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setEnquiry(['Hotel Room']);
    setInspectionDate(todayStr);
    setInspectionTime('');
    setBudget('');
    setLocation('Ikorodu');
    setSpecialRequirement('');
    setErrors({});
    setTouched({});
    setOutcome(null);
  };

  const formattedBudget =
    budget && !Number.isNaN(Number(budget)) && Number(budget) > 0
      ? new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          maximumFractionDigits: 0,
        }).format(Number(budget))
      : null;

  return (
    <section
      id="inspection-booking"
      className="bg-[#F5EFE6] text-[#16221C] py-20 sm:py-24 border-t border-[#DED3C1]"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5B2D6E]">
              Private Walkthroughs
            </p>
            <h2
              className="mt-3 font-display text-3xl sm:text-4xl font-semibold leading-tight text-[#143A2C]"
              style={{ textWrap: 'balance' }}
            >
              Book a Property Inspection
            </h2>
            <div className="mt-4 h-0.5 w-10 bg-[#5B2D6E]" />

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#425049]">
              Select your preferred space category, inspection date from today forward, estimated
              budget, and location. Availability is checked in real time against our property
              schedule.
            </p>

            <div className="mt-8 border-t border-[#DED3C1] pt-6 space-y-5">
              <div>
                <h3 className="font-sans-body text-xs font-semibold uppercase tracking-[0.14em] text-[#143A2C]">
                  Ikorodu Property
                </h3>
                <p className="mt-1 text-sm text-[#4A5750]">
                  Serene garden hotel suites, banquet hall, and gated residential short-lets.
                </p>
              </div>
              <div>
                <h3 className="font-sans-body text-xs font-semibold uppercase tracking-[0.14em] text-[#143A2C]">
                  Lagos Island Property
                </h3>
                <p className="mt-1 text-sm text-[#4A5750]">
                  Executive rooms, grand celebration halls, and harbour-view apartments.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#FBF8F3] border border-[#D8CCB9] p-6 sm:p-10">
              {outcome?.kind === 'success' ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-3 border-b border-[#DED3C1] pb-5">
                    <CheckCircle2 className="w-6 h-6 text-[#143A2C] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#143A2C]">
                        Inspection Confirmed
                      </p>
                      <h3 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-[#16221C]">
                        Thank you, {fullName}
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-[#36443D] leading-relaxed">
                        {outcome.message}
                      </p>
                    </div>
                  </div>

                  {outcome.details.length > 0 && (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5EFE6] border border-[#DED3C1] p-5">
                      {outcome.details.map((entry) => (
                        <div key={entry.key}>
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B2D6E]">
                            {entry.label}
                          </dt>
                          <dd className="mt-1 text-sm font-medium text-[#16221C] tabular-nums break-words">
                            {entry.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 bg-[#143A2C] hover:bg-[#1D4E3B] text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.15em] px-6 py-3.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Schedule Another Inspection</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {outcome?.kind === 'unavailable' && (
                    <div
                      role="alert"
                      className="border border-[#5B2D6E]/40 bg-[#F3ECF6] p-5 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#5B2D6E] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5B2D6E]">
                            Timeslot Unavailable
                          </p>
                          <p className="mt-1 text-sm text-[#2A1933] leading-relaxed">
                            {outcome.message}
                          </p>
                        </div>
                      </div>

                      {outcome.availableSlots.length > 0 && (
                        <div className="pt-2 border-t border-[#5B2D6E]/20">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3B2147] mb-2.5">
                            Available Timeslots
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {outcome.availableSlots.map((slot, idx) => (
                              <button
                                key={`${slot.raw}-${idx}`}
                                type="button"
                                onClick={() => handleApplyReturnedSlot(slot)}
                                className="inline-flex items-center gap-1.5 border border-[#5B2D6E] bg-white hover:bg-[#5B2D6E] text-[#472157] hover:text-[#F5EFE6] text-xs font-semibold px-3.5 py-2 transition-colors cursor-pointer tabular-nums"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>{slot.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {outcome.details.length > 0 && (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#5B2D6E]/15">
                          {outcome.details.map((entry) => (
                            <div key={entry.key}>
                              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5B2D6E]">
                                {entry.label}
                              </dt>
                              <dd className="text-xs text-[#2A1933] tabular-nums">{entry.value}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  )}

                  {outcome?.kind === 'error' && (
                    <div
                      role="alert"
                      className="border border-[#8B2635]/35 bg-[#FDF2F4] p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-[#8B2635] shrink-0 mt-0.5" />
                      <div className="text-sm text-[#4A141C] space-y-1">
                        <p className="font-semibold">
                          Could not complete booking check
                          {outcome.webhookStatus ? ` (Status ${outcome.webhookStatus})` : ''}
                        </p>
                        <p>{outcome.message}</p>
                        {outcome.hint && (
                          <p className="text-xs text-[#6B2530] pt-1">{outcome.hint}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2"
                      >
                        Full Name <span className="text-[#5B2D6E]">*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) {
                            setErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        placeholder="e.g. Adebayo Oluwaseun"
                        className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none px-4 py-3 text-sm text-[#16221C] placeholder:text-[#8E877B]"
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8B2635]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2"
                      >
                        Phone Number <span className="text-[#5B2D6E]">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: undefined }));
                          }
                        }}
                        placeholder="e.g. +234 803 123 4567"
                        className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none px-4 py-3 text-sm text-[#16221C] placeholder:text-[#8E877B] tabular-nums"
                      />
                      {errors.phone && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8B2635]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2"
                    >
                      Email Address <span className="text-[#5B2D6E]">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onBlur={handleEmailBlur}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        if (touched.email || errors.email) {
                          if (!val.trim()) {
                            setErrors((prev) => ({
                              ...prev,
                              email: 'Email address is required.',
                            }));
                          } else if (!EMAIL_REGEX.test(val.trim())) {
                            setErrors((prev) => ({
                              ...prev,
                              email:
                                'Please enter a valid email address (e.g. name@domain.com).',
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }
                      }}
                      placeholder="name@company.com"
                      className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none px-4 py-3 text-sm text-[#16221C] placeholder:text-[#8E877B]"
                    />
                    {errors.email && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8B2635]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <fieldset>
                    <legend className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2.5">
                      Enquiry Type <span className="text-[#5B2D6E]">*</span>
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ENQUIRY_OPTIONS.map((option) => {
                        const checked = enquiry.includes(option);
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-3 border px-4 py-3 text-sm cursor-pointer transition-colors ${
                              checked
                                ? 'border-[#5B2D6E] bg-[#F3ECF6] text-[#2A1933] font-medium'
                                : 'border-[#CFC3B0] bg-white text-[#2F3B34] hover:border-[#143A2C]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="enquiry"
                              value={option}
                              checked={checked}
                              onChange={() => handleToggleEnquiry(option)}
                              className="sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                                checked
                                  ? 'border-[#5B2D6E] bg-[#5B2D6E] text-white'
                                  : 'border-[#8D8476] bg-white'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                            </span>
                            <span className="whitespace-nowrap">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.enquiry && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8B2635]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.enquiry}</span>
                      </p>
                    )}
                  </fieldset>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="inspectionDate"
                        className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2"
                      >
                        Inspection Date (Current Day Forward){' '}
                        <span className="text-[#5B2D6E]">*</span>
                      </label>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                        {upcomingDays.map((day) => {
                          const active = inspectionDate === day.iso;
                          return (
                            <button
                              key={day.iso}
                              type="button"
                              onClick={() => {
                                setInspectionDate(day.iso);
                                setErrors((prev) => ({
                                  ...prev,
                                  inspectionDate: undefined,
                                }));
                              }}
                              className={`flex flex-col items-center justify-center border py-2 px-2 text-center transition-colors cursor-pointer ${
                                active
                                  ? 'border-[#143A2C] bg-[#143A2C] text-[#F5EFE6]'
                                  : 'border-[#CFC3B0] bg-white text-[#2F3B34] hover:border-[#5B2D6E]'
                              }`}
                            >
                              <span className="text-[10px] uppercase tracking-wider opacity-80">
                                {day.dayName}
                              </span>
                              <span className="text-sm font-semibold tabular-nums">
                                {day.dayNum} {day.month}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-[#5B2D6E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="inspectionDate"
                            name="inspectionDate"
                            type="date"
                            min={todayStr}
                            required
                            value={inspectionDate}
                            onChange={(e) => {
                              const picked = e.target.value;
                              if (picked && picked < todayStr) {
                                setInspectionDate(todayStr);
                                setErrors((prev) => ({
                                  ...prev,
                                  inspectionDate:
                                    'Past dates cannot be selected. Adjusted to today.',
                                }));
                              } else {
                                setInspectionDate(picked);
                                setErrors((prev) => ({
                                  ...prev,
                                  inspectionDate: undefined,
                                }));
                              }
                            }}
                            className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none pl-10 pr-4 py-3 text-sm text-[#16221C] tabular-nums"
                          />
                        </div>

                        <div className="relative">
                          <Clock className="w-4 h-4 text-[#5B2D6E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="inspectionTime"
                            name="inspectionTime"
                            type="time"
                            aria-label="Inspection Time"
                            required
                            value={inspectionTime}
                            onChange={(e) => {
                              setInspectionTime(e.target.value);
                              if (errors.inspectionTime) {
                                setErrors((prev) => ({
                                  ...prev,
                                  inspectionTime: undefined,
                                }));
                              }
                            }}
                            className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none pl-10 pr-4 py-3 text-sm text-[#16221C] tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-[11px] text-[#58655E] mb-2">
                          Quick-select inspection hour:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {INSPECTION_HOUR_SLOTS.map((slot) => {
                            const disabled = isTimeInPastToday(inspectionDate, slot);
                            const selected = inspectionTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                  setInspectionTime(slot);
                                  setErrors((prev) => ({
                                    ...prev,
                                    inspectionTime: undefined,
                                  }));
                                }}
                                className={`px-3 py-1.5 text-xs font-medium border transition-colors tabular-nums ${
                                  disabled
                                    ? 'border-[#E2DBD0] bg-[#EFE9DF] text-[#A2998A] cursor-not-allowed line-through'
                                    : selected
                                      ? 'border-[#5B2D6E] bg-[#5B2D6E] text-[#F5EFE6] cursor-pointer'
                                      : 'border-[#CFC3B0] bg-white text-[#2F3B34] hover:border-[#5B2D6E] cursor-pointer'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {(errors.inspectionDate || errors.inspectionTime) && (
                        <div className="mt-2 space-y-1">
                          {errors.inspectionDate && (
                            <p className="flex items-center gap-1.5 text-xs text-[#8B2635]">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errors.inspectionDate}</span>
                            </p>
                          )}
                          {errors.inspectionTime && (
                            <p className="flex items-center gap-1.5 text-xs text-[#8B2635]">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{errors.inspectionTime}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="budget"
                        className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2"
                      >
                        Budget (NGN) <span className="text-[#5B2D6E]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#143A2C]">
                          ₦
                        </span>
                        <input
                          id="budget"
                          name="budget"
                          type="number"
                          min="1"
                          step="any"
                          required
                          value={budget}
                          onChange={(e) => {
                            setBudget(e.target.value);
                            if (errors.budget) {
                              setErrors((prev) => ({ ...prev, budget: undefined }));
                            }
                          }}
                          placeholder="250000"
                          className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none pl-8 pr-4 py-3 text-sm text-[#16221C] placeholder:text-[#8E877B] tabular-nums"
                        />
                      </div>
                      {formattedBudget && !errors.budget && (
                        <p className="mt-1 text-xs text-[#4A5750] tabular-nums">
                          Estimated budget: {formattedBudget}
                        </p>
                      )}
                      {errors.budget && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8B2635]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.budget}</span>
                        </p>
                      )}
                    </div>

                    <fieldset>
                      <legend className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2">
                        Location <span className="text-[#5B2D6E]">*</span>
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        {LOCATION_OPTIONS.map((loc) => {
                          const active = location === loc;
                          return (
                            <label
                              key={loc}
                              className={`flex items-center justify-center gap-2 border px-3 py-3 text-sm cursor-pointer transition-colors ${
                                active
                                  ? 'border-[#143A2C] bg-[#143A2C] text-[#F5EFE6] font-medium'
                                  : 'border-[#CFC3B0] bg-white text-[#2F3B34] hover:border-[#5B2D6E]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="location"
                                value={loc}
                                checked={active}
                                onChange={() => {
                                  setLocation(loc);
                                  setErrors((prev) => ({ ...prev, location: undefined }));
                                }}
                                className="sr-only"
                              />
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">{loc}</span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.location && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#8B2635]">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.location}</span>
                        </p>
                      )}
                    </fieldset>
                  </div>

                  <div>
                    <label
                      htmlFor="specialRequirement"
                      className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#143A2C] mb-2"
                    >
                      Special Requirement{' '}
                      <span className="font-normal text-[#6B6459] normal-case tracking-normal">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      id="specialRequirement"
                      name="specialRequirement"
                      rows={3}
                      value={specialRequirement}
                      onChange={(e) => setSpecialRequirement(e.target.value)}
                      placeholder="Guest count, wheelchair accessibility, preferred floor, or event decor requests..."
                      className="w-full bg-white border border-[#CFC3B0] focus:border-[#5B2D6E] focus:outline-none px-4 py-3 text-sm text-[#16221C] placeholder:text-[#8E877B] resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-[#5B2D6E] hover:bg-[#472157] disabled:opacity-65 text-[#F5EFE6] text-xs font-semibold uppercase tracking-[0.16em] px-8 py-4 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143A2C]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking Schedule &amp; Submitting...</span>
                        </>
                      ) : (
                        <span>Confirm Inspection Request</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

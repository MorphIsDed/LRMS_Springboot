import { addDays, differenceInCalendarDays, isBefore, startOfDay } from "date-fns";

export const VALIDATION_RULES = {
  username: { min: 3, max: 60 },
  password: { min: 8 },
  email: { max: 120 },
  roomNumber: { min: 1, max: 10 },
  page: { min: 0 },
  size: { max: 100 },
  maxStayDays: 30
} as const;

export function validateStayDates(checkIn: Date, checkOut: Date) {
  const today = startOfDay(new Date());
  const ci = startOfDay(checkIn);
  const co = startOfDay(checkOut);
  if (isBefore(ci, today)) return { ok: false, message: "Check-in must be today or later." } as const;
  if (!isBefore(ci, co)) return { ok: false, message: "Check-out must be after check-in." } as const;
  if (!isBefore(addDays(ci, 1), co)) return { ok: false, message: "Stay must be at least 1 night." } as const;
  const days = differenceInCalendarDays(co, ci);
  if (days > VALIDATION_RULES.maxStayDays)
    return { ok: false, message: "Stay is too long." } as const;
  return { ok: true } as const;
}


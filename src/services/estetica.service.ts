import http from "@/lib/axios";

const API_PREFIX = ((process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")).endsWith("/api")
    ? "" : "/api";

// helpers para desanidar {ok,data}
const unwrap = <T>(r: any): T => (Array.isArray(r.data) ? r.data : (r.data?.data ?? r.data));

/* ===== Tipos mínimos (alineados a Prisma/Controllers) ===== */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type AppointmentHour = { day: Weekday; isOpen: boolean; start1?: string | null; end1?: string | null; start2?: string | null; end2?: string | null; };

export type BusinessConfigAppt = {
    aiMode?: "ecommerce" | "agente" | "estetica" | "appts";
    appointmentEnabled?: boolean;
    appointmentVertical?: string;
    appointmentVerticalCustom?: string | null;
    appointmentTimezone?: string;
    appointmentBufferMin?: number;
    appointmentPolicies?: string | null;
    appointmentReminders?: boolean;

    // ventanas / reglas rápidas
    appointmentMinNoticeHours?: number | null;
    appointmentMaxAdvanceDays?: number | null;
    allowSameDayBooking?: boolean;
    requireClientConfirmation?: boolean;
    cancellationAllowedHours?: number | null;
    rescheduleAllowedHours?: number | null;
    defaultServiceDurationMin?: number | null;

    // servicios/ubicación
    servicesText?: string | null;
    services?: any;

    locationName?: string | null;
    locationAddress?: string | null;
    locationMapsUrl?: string | null;
    parkingInfo?: string | null;
    virtualMeetingLink?: string | null;
    instructionsArrival?: string | null;

    // reglas operativas
    cancellationWindowHours?: number | null;
    noShowPolicy?: string | null;
    depositRequired?: boolean;
    depositAmount?: number | null;
    maxDailyAppointments?: number | null;
    bookingWindowDays?: number | null;
    blackoutDates?: any;
    overlapStrategy?: string | null;

    // recordatorios
    reminderSchedule?: any;
    reminderTemplateId?: string | null;
    postBookingMessage?: string | null;
    prepInstructionsPerSvc?: any;

    // compliance
    requireWhatsappOptIn?: boolean;
    allowSensitiveTopics?: boolean;
    minClientAge?: number | null;

    // KB
    kbBusinessOverview?: string | null;
    kbFAQs?: any;
    kbServiceNotes?: any;
    kbEscalationRules?: any;
    kbDisclaimers?: string | null;
    kbMedia?: any;
    kbFreeText?: string | null;
};

/* ===== Config ===== */
export const getApptConfig = async (empresaId?: number) => {
    const url = `${API_PREFIX}/estetica/config${empresaId ? `?empresaId=${empresaId}` : ""}`;
    const r = await http.get(url);
    return unwrap<BusinessConfigAppt>(r);
};

export const saveApptConfig = async (payload: Partial<BusinessConfigAppt> & { empresaId?: number }) => {
    const r = await http.post(`${API_PREFIX}/estetica/config`, payload);
    return unwrap<BusinessConfigAppt>(r);
};

/* ===== Horarios (bulk con {days}) ===== */
export const getAppointmentHours = async (empresaId?: number) => {
    const url = `${API_PREFIX}/appointment-hours${empresaId ? `?empresaId=${empresaId}` : ""}`;
    const r = await http.get(url);
    return unwrap<AppointmentHour[]>(r);
};

export const saveAppointmentHoursBulk = async (days: AppointmentHour[], empresaId?: number) => {
    const body = empresaId ? { empresaId, days } : { days };
    const r = await http.put(`${API_PREFIX}/appointment-hours`, body);
    return unwrap<AppointmentHour[]>(r);
};

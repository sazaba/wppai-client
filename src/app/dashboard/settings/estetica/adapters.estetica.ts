import type { AppointmentHour } from "@/services/estetica.service";
import type { AppointmentConfigValue, Weekday } from "./EsteticaForm";

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function hoursApiToUi(rows: AppointmentHour[]): AppointmentConfigValue["hours"] {
    const map = new Map<Weekday, AppointmentHour>();
    for (const d of ORDER) map.set(d, { day: d, isOpen: false });
    for (const r of rows) map.set(r.day, r);
    return ORDER.map(d => {
        const r = map.get(d)!;
        return { day: r.day, isOpen: r.isOpen, start1: r.start1 ?? null, end1: r.end1 ?? null, start2: r.start2 ?? null, end2: r.end2 ?? null };
    });
}

export function hoursUiToApi(hours: NonNullable<AppointmentConfigValue["hours"]>): AppointmentHour[] {
    return (hours ?? []).map(h => ({
        day: h.day,
        isOpen: !!h.isOpen,
        start1: h.isOpen ? (h.start1 ?? null) : null,
        end1: h.isOpen ? (h.end1 ?? null) : null,
        start2: h.isOpen ? (h.start2 ?? null) : null,
        end2: h.isOpen ? (h.end2 ?? null) : null,
    }));
}

// JSON helpers
const safeParse = (s?: string | null) => { if (!s) return null; try { return JSON.parse(s); } catch { return null; } };
const safeString = (v: any) => (v ? JSON.stringify(v, null, 2) : "");

// UI defaults
export const emptyUiValue: AppointmentConfigValue = {
    appointmentEnabled: false,
    appointmentVertical: "estetica",
    appointmentTimezone: "America/Bogota",
    appointmentBufferMin: 10,
    appointmentReminders: true,
    hours: ORDER.map(d => ({ day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null })),
};

// API → UI
export function apiToUi(cfg: any, hours: AppointmentHour[]): AppointmentConfigValue {
    return {
        appointmentEnabled: !!cfg.appointmentEnabled,
        appointmentVertical: (cfg.appointmentVertical ?? "estetica"),
        appointmentVerticalCustom: cfg.appointmentVerticalCustom ?? null,
        appointmentTimezone: cfg.appointmentTimezone ?? "America/Bogota",
        appointmentBufferMin: cfg.appointmentBufferMin ?? 10,
        appointmentPolicies: cfg.appointmentPolicies ?? "",

        appointmentServices: cfg.servicesText ?? "",

        location: {
            name: cfg.locationName ?? null,
            address: cfg.locationAddress ?? null,
            mapsUrl: cfg.locationMapsUrl ?? null,
            parkingInfo: cfg.parkingInfo ?? null,
            virtualLink: cfg.virtualMeetingLink ?? null,
            instructionsArrival: cfg.instructionsArrival ?? null,
        },

        rules: {
            bookingWindowDays: cfg.bookingWindowDays ?? cfg.appointmentMaxAdvanceDays ?? null,
            maxDailyAppointments: cfg.maxDailyAppointments ?? null,
            cancellationWindowHours: cfg.cancellationWindowHours ?? cfg.cancellationAllowedHours ?? null,
            noShowPolicy: cfg.noShowPolicy ?? null,
            depositRequired: cfg.depositRequired ?? null,
            depositAmount: cfg.depositAmount ?? null,
            overlapStrategy: cfg.overlapStrategy ?? null,
            blackoutDates: cfg.blackoutDates ?? null as any,
        },

        appointmentReminders: !!cfg.appointmentReminders,
        reminders: {
            schedule: cfg.reminderSchedule ?? null,
            templateId: cfg.reminderTemplateId ?? null,
            postBookingMessage: cfg.postBookingMessage ?? null,
        },

        kb: {
            businessOverview: cfg.kbBusinessOverview ?? null,
            faqsText: safeString(cfg.kbFAQs),
            freeText: cfg.kbFreeText ?? null,
        },

        hours: hoursApiToUi(hours),
    };
}

// UI → API (aplana)
export function uiToApi(value: AppointmentConfigValue) {
    const servicesArray =
        (value.appointmentServices ?? "")
            .split(/[\n,]/g).map(s => s.trim()).filter(Boolean);

    return {
        aiMode: "estetica",

        appointmentEnabled: value.appointmentEnabled,
        appointmentVertical: value.appointmentVertical,
        appointmentVerticalCustom: value.appointmentVertical === "custom" ? (value.appointmentVerticalCustom?.trim() || null) : null,
        appointmentTimezone: value.appointmentTimezone,
        appointmentBufferMin: value.appointmentBufferMin,
        appointmentPolicies: value.appointmentPolicies ?? null,
        appointmentReminders: value.appointmentReminders,

        servicesText: (value.appointmentServices ?? "").trim() || null,
        services: servicesArray.length ? servicesArray : null,

        locationName: value.location?.name ?? null,
        locationAddress: value.location?.address ?? null,
        locationMapsUrl: value.location?.mapsUrl ?? null,
        parkingInfo: value.location?.parkingInfo ?? null,
        virtualMeetingLink: value.location?.virtualLink ?? null,
        instructionsArrival: value.location?.instructionsArrival ?? null,

        bookingWindowDays: value.rules?.bookingWindowDays ?? null,
        maxDailyAppointments: value.rules?.maxDailyAppointments ?? null,
        cancellationWindowHours: value.rules?.cancellationWindowHours ?? null,
        noShowPolicy: value.rules?.noShowPolicy ?? null,
        depositRequired: value.rules?.depositRequired ?? null,
        depositAmount: value.rules?.depositAmount ?? null,
        overlapStrategy: value.rules?.overlapStrategy ?? null,
        blackoutDates: (value as any)?.rules?.blackoutDates ?? null,

        reminderSchedule: value.reminders?.schedule ?? null,
        reminderTemplateId: value.reminders?.templateId ?? null,
        postBookingMessage: value.reminders?.postBookingMessage ?? null,

        kbBusinessOverview: value.kb?.businessOverview ?? null,
        kbFAQs: safeParse(value.kb?.faqsText) ?? null,
        kbFreeText: value.kb?.freeText ?? null,
    };
}

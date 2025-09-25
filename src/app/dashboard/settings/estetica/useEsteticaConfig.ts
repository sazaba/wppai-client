"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type AppointmentDay = {
    day: Weekday;
    isOpen: boolean;
    start1: string | null;
    end1: string | null;
    start2: string | null;
    end2: string | null;
};

export type AppointmentConfigValue = {
    appointmentEnabled: boolean;
    appointmentVertical: "odontologica" | "estetica" | "spa" | "custom";
    appointmentVerticalCustom?: string | null;
    appointmentTimezone: string;
    appointmentBufferMin: number;
    appointmentPolicies?: string;
    appointmentReminders: boolean;
    location?: {
        name?: string | null;
        address?: string | null;
        mapsUrl?: string | null;
        parkingInfo?: string | null;
        virtualLink?: string | null;
        instructionsArrival?: string | null;
    };
    rules?: {
        bookingWindowDays?: number | null;
        maxDailyAppointments?: number | null;
        cancellationWindowHours?: number | null;
        noShowPolicy?: string | null;
        depositRequired?: boolean | null;
        depositAmount?: number | null;
        blackoutDates?: string[] | null;
        overlapStrategy?: string | null;
    };
    reminders?: {
        schedule?: Array<{ offsetHours: number; channel: string }> | null;
        templateId?: string | null;
        postBookingMessage?: string | null;
    };
    kb?: {
        businessOverview?: string | null;
        faqsText?: string | null;
        freeText?: string | null;
    };
    hours?: AppointmentDay[];
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "") as string;

function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export function normalizeDays(rows?: AppointmentDay[] | null): AppointmentDay[] {
    const base = new Map<Weekday, AppointmentDay>();
    for (const d of ORDER) base.set(d, { day: d, isOpen: false, start1: null, end1: null, start2: null, end2: null });
    if (Array.isArray(rows)) {
        for (const r of rows) if (ORDER.includes(r.day)) base.set(r.day, { ...base.get(r.day)!, ...r });
    }
    return ORDER.map(d => base.get(d)!);
}

function clampBuffer(n: number) {
    if (!Number.isFinite(n)) return 10;
    return Math.max(0, Math.min(240, Math.round(n)));
}

export function useEsteticaConfig(empresaId?: number) {
    const [value, setValue] = useState<AppointmentConfigValue>({
        appointmentEnabled: false,
        appointmentVertical: "custom",
        appointmentVerticalCustom: "",
        appointmentTimezone: "America/Bogota",
        appointmentBufferMin: 10,
        appointmentPolicies: "",
        appointmentReminders: true,
        hours: normalizeDays([]),
        location: {},
        rules: {},
        reminders: {},
        kb: {},
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ===== LOAD =====
    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const [cfgR, hrsR] = await Promise.all([
                axios.get(`${API_URL}/api/estetica/config`, {
                    headers: getAuthHeaders(),
                    params: { t: Date.now(), ...(empresaId ? { empresaId } : {}) },
                }),
                axios.get(`${API_URL}/api/appointment-hours`, {
                    headers: getAuthHeaders(),
                    params: { t: Date.now(), ...(empresaId ? { empresaId } : {}) },
                }),
            ]);

            const cfg = cfgR?.data?.data ?? cfgR?.data ?? {};

            setValue({
                appointmentEnabled: !!cfg?.appointmentEnabled,
                appointmentVertical: cfg?.appointmentVertical ?? "custom",
                appointmentVerticalCustom: cfg?.appointmentVerticalCustom ?? "",
                appointmentTimezone: cfg?.appointmentTimezone ?? "America/Bogota",
                appointmentBufferMin: Number.isFinite(cfg?.appointmentBufferMin) ? cfg.appointmentBufferMin : 10,
                appointmentPolicies: cfg?.appointmentPolicies ?? "",
                appointmentReminders: (cfg?.appointmentReminders ?? true) as boolean,
                location: {
                    name: cfg?.locationName ?? "",
                    address: cfg?.locationAddress ?? "",
                    mapsUrl: cfg?.locationMapsUrl ?? "",
                    virtualLink: cfg?.virtualMeetingLink ?? "",
                    parkingInfo: cfg?.parkingInfo ?? "",
                    instructionsArrival: cfg?.instructionsArrival ?? "",
                },
                rules: {
                    bookingWindowDays: cfg?.bookingWindowDays ?? null,
                    maxDailyAppointments: cfg?.maxDailyAppointments ?? null,
                    cancellationWindowHours: cfg?.cancellationWindowHours ?? null,
                    noShowPolicy: cfg?.noShowPolicy ?? "",
                    depositRequired: cfg?.depositRequired ?? null,
                    depositAmount: cfg?.depositAmount ?? null,
                    blackoutDates: cfg?.blackoutDates ?? null,
                    overlapStrategy: cfg?.overlapStrategy ?? null,
                },
                reminders: {
                    schedule: cfg?.reminderSchedule ?? null,
                    templateId: cfg?.reminderTemplateId ?? "",
                    postBookingMessage: cfg?.postBookingMessage ?? "",
                },
                kb: {
                    businessOverview: cfg?.kbBusinessOverview ?? "",
                    faqsText: typeof cfg?.kbFAQs === "string" ? cfg.kbFAQs : cfg?.kbFAQs ? JSON.stringify(cfg.kbFAQs) : "",
                    freeText: cfg?.kbFreeText ?? "",
                },
                hours: normalizeDays(Array.isArray(hrsR?.data) ? hrsR.data : hrsR?.data?.data ?? []),
            });
        } finally {
            setLoading(false);
        }
    }, [empresaId]);

    useEffect(() => {
        reload();
    }, [reload]);

    // ===== SAVE =====
    const save = useCallback(async () => {
        setSaving(true);
        try {
            const v = value;

            // 1) Guardar config (upsert)
            const cfgPayload = {
                aiMode: "estetica",
                appointmentEnabled: !!v.appointmentEnabled,
                appointmentVertical: v.appointmentVertical,
                appointmentVerticalCustom: v.appointmentVertical === "custom" ? (v.appointmentVerticalCustom ?? "") : null,
                appointmentTimezone: v.appointmentTimezone,
                appointmentBufferMin: clampBuffer(v.appointmentBufferMin),
                appointmentPolicies: v.appointmentPolicies ?? "",
                appointmentReminders: !!v.appointmentReminders,
                // ubicación
                locationName: v.location?.name ?? null,
                locationAddress: v.location?.address ?? null,
                locationMapsUrl: v.location?.mapsUrl ?? null,
                parkingInfo: v.location?.parkingInfo ?? null,
                virtualMeetingLink: v.location?.virtualLink ?? null,
                instructionsArrival: v.location?.instructionsArrival ?? null,
                // reglas
                bookingWindowDays: v.rules?.bookingWindowDays ?? null,
                maxDailyAppointments: v.rules?.maxDailyAppointments ?? null,
                cancellationWindowHours: v.rules?.cancellationWindowHours ?? null,
                noShowPolicy: v.rules?.noShowPolicy ?? null,
                depositRequired: v.rules?.depositRequired ?? null,
                depositAmount: v.rules?.depositAmount ?? null,
                blackoutDates: v.rules?.blackoutDates ?? null,
                overlapStrategy: v.rules?.overlapStrategy ?? null,
                // recordatorios
                reminderSchedule: v.reminders?.schedule ?? null,
                reminderTemplateId: v.reminders?.templateId ?? null,
                postBookingMessage: v.reminders?.postBookingMessage ?? null,
                // KB
                kbBusinessOverview: v.kb?.businessOverview ?? null,
                kbFAQs: v.kb?.faqsText ?? null,
                kbFreeText: v.kb?.freeText ?? null,
                ...(empresaId ? { empresaId } : {}),
            };

            await axios.post(`${API_URL}/api/estetica/config`, cfgPayload, { headers: getAuthHeaders() });

            // 2) Guardar horarios (bulk PUT) — normalizar HH:MM
            const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
            const asHHMM = (val?: string | null) => {
                if (!val) return null;
                const s = String(val).trim().slice(0, 5);
                return HHMM.test(s) ? s : null;
            };

            const hours = normalizeDays(v.hours).map(d => ({
                day: d.day,
                isOpen: !!d.isOpen,
                start1: d.isOpen ? asHHMM(d.start1) : null,
                end1: d.isOpen ? asHHMM(d.end1) : null,
                start2: d.isOpen ? asHHMM(d.start2) : null,
                end2: d.isOpen ? asHHMM(d.end2) : null,
            }));

            await axios.put(
                `${API_URL}/api/appointment-hours`,
                { hours, ...(empresaId ? { empresaId } : {}) },
                { headers: getAuthHeaders() },
            );

            return true;
        } finally {
            setSaving(false);
        }
    }, [value, empresaId]);

    return { value, setValue, loading, saving, save, reload };
}

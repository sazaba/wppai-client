"use client";

import { useEffect, useState } from "react";
import {
    getApptConfig,
    saveApptConfig,
    getAppointmentHours,
    saveAppointmentHoursBulk,
    type AppointmentHour,
} from "@/services/estetica.service";
import { apiToUi, uiToApi, emptyUiValue, hoursUiToApi } from "./adapters.estetica";

/**
 * Hook Smart para cargar/guardar config de Estética.
 * Nota: evitamos tipos que no existen en services.
 * Usamos typeof emptyUiValue para tipar el estado y ReturnType<typeof uiToApi> para el payload.
 */
export function useEsteticaConfig(empresaId?: number) {
    const [value, setValue] = useState<typeof emptyUiValue>(emptyUiValue);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const reload = async () => {
        setLoading(true);
        try {
            const [cfg, hrs] = await Promise.all([
                getApptConfig(empresaId).catch(() => null),
                getAppointmentHours(empresaId).catch(() => [] as AppointmentHour[]),
            ]);
            setValue(apiToUi(cfg ?? {}, hrs ?? []));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empresaId]);

    const save = async () => {
        if (value.appointmentEnabled && !value.appointmentTimezone) {
            throw new Error("Selecciona zona horaria.");
        }
        if (value.rules?.depositRequired && !(Number(value.rules?.depositAmount) > 0)) {
            throw new Error("Monto de depósito requerido.");
        }
        if (value.appointmentVertical === "custom" && !value.appointmentVerticalCustom) {
            throw new Error("Define el vertical personalizado.");
        }

        setSaving(true);
        try {
            // 👇 Inferimos el tipo del payload desde la firma de saveApptConfig
            const base = uiToApi(value) as Record<string, unknown>;
            const payload = {
                ...base,
                ...(empresaId ? { empresaId } : {}),
            } as Parameters<typeof saveApptConfig>[0];

            await saveApptConfig(payload);

            const days = hoursUiToApi(value.hours || []);
            await saveAppointmentHoursBulk(days, empresaId);
        } finally {
            setSaving(false);
        }
    };


    return { value, setValue, loading, saving, save, reload };
}

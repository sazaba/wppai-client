'use client';

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

export type ChatMessage = {
  id?: number | string | null;
  from: 'client' | 'bot' | 'agent';
  contenido: string;
  timestamp?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string | null;
  mimeType?: string | null;
  caption?: string | null;
  transcription?: string | null;
  isVoiceNote?: boolean;
  mediaId?: string | null;
};

type Props = { message: ChatMessage; isMine?: boolean };

function isMedia(m?: string | null) {
  return m === 'image' || m === 'video' || m === 'audio' || m === 'document';
}

function formatTime(ts?: string) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/** 🔗 Convierte rutas relativas '/api/...' a absolutas usando NEXT_PUBLIC_API_URL */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
function toAbsolute(u?: string | null) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const base = API_BASE.replace(/\/+$/, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${base}${path}`;
}

/** 🔑 Lee el token de la app (para firmar /media/:id?t=JWT en <img>/<video>) */
function getAppToken() {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('token') || '';
  } catch {
    return '';
  }
}

/** Limpia cortes raros */
function sanitizeAggressive(raw: string) {
  if (!raw) return '';
  let s = raw
    .normalize('NFC')
    .replace(/\r/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2');
  s = s.replace(/([a-záéíóúüñ])\s*\n\s*([a-záéíóúüñ])/g, '$1$2');
  s = s.replace(/(?<!\n)\n(?!\n)/g, ' ');
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s.trim();
}

export default function MessageBubble({ message, isMine }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription, mediaId } = message;
  const time = formatTime(message.timestamp);
  const itsMedia = isMedia(mediaType);

  const needsAggressiveWrap = useMemo(() => {
    const text = (contenido || '').trim();
    if (!text) return false;
    const tokens = text.split(/\s+/);
    return tokens.some((t) => /^https?:\/\//i.test(t) || t.length >= 28);
  }, [contenido]);

  const bubbleBase = clsx(
    'relative inline-block align-top',
    'max-w-[86%] sm:max-w-[70%] min-w-[9ch]',
    'px-3 py-2 rounded-2xl shadow-sm ring-1 ring-white/5',
    'overflow-hidden isolate flex flex-col',
    isMine ? 'bg-[#005C4B] text-white ml-auto' : 'bg-[#202C33] text-[#E9EDEF]'
  );

  const textClass = clsx(
    'text-[14px] leading-[1.45] antialiased',
    'whitespace-pre-wrap',
    needsAggressiveWrap
      ? 'break-words [word-break:break-word]'
      : 'break-normal [word-break:keep-all] [overflow-wrap:normal]'
  );

  const timeClass = clsx(
    'text-[11px] opacity-75 whitespace-nowrap select-none mt-1 self-end',
    isMine ? 'text-[#cfe5df]' : 'text-[#8696a0]'
  );

  const showText =
    !itsMedia ||
    (mediaType !== 'audio' &&
      contenido &&
      !['[imagen]', '[video]', '[nota de voz]', '[documento]'].includes(contenido));

  // ✅ Resolver URL final para media:
  // 1) usar mediaUrl si viene (ya firmada por backend)
  // 2) si no, construir con mediaId + ?t=JWT (para que el backend autorice el <img>/<video>)
  const resolvedMediaUrl = useMemo(() => {
    const first = (mediaUrl || '').trim();
    if (first) return toAbsolute(first);

    if (mediaId) {
      const t = getAppToken();
      const qs = t ? `?t=${encodeURIComponent(t)}` : '';
      return toAbsolute(`/api/whatsapp/media/${mediaId}${qs}`);
    }
    return '';
  }, [mediaUrl, mediaId]);

  return (
    <div className={clsx('w-full flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col gap-1 max-w-full">
        {/* BURBUJA MULTIMEDIA */}
        {itsMedia && (
          <div className={bubbleBase}>
            <MediaRenderer
              type={mediaType as any}
              url={resolvedMediaUrl}
              mime={mimeType || undefined}
              caption={caption || undefined}
              transcription={transcription || undefined}
              isMine={!!isMine}
              time={time}
              timeClass={timeClass}
            />
          </div>
        )}

        {/* BURBUJA DE TEXTO */}
        {showText && (
          <div className={bubbleBase}>
            <p className={textClass}>{sanitizeAggressive(contenido)}</p>
            {time ? <span className={timeClass}>{time}</span> : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* =================== MEDIA =================== */

function MediaRenderer({
  type,
  url,
  mime,
  caption,
  transcription,
  isMine,
  time,
  timeClass,
}: {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mime?: string;
  caption?: string;
  transcription?: string;
  isMine: boolean;
  time?: string;
  timeClass: string;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const wideBox = 'w-[min(82vw,420px)] sm:w-[420px] max-w-full';
  const phBase = 'rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400 w-full';
  const imgPh = clsx(phBase, 'min-h-[180px] sm:min-h-[220px]');
  const vidPh = clsx(phBase, 'min-h-[160px] sm:min-h-[200px]');

  if (type === 'audio') {
    return (
      <div className="w-full flex flex-col">
        <p className="text-[14px] leading-[1.45]">
          <span className="font-medium">Transcripción: </span>
          {transcription?.trim() || 'Nota de voz (sin transcripción)'}
        </p>
        {time ? <span className={timeClass}>{time}</span> : null}
      </div>
    );
  }

  if (type === 'image') {
    if (!url || errored) {
      return (
        <div className={wideBox}>
          <div className={imgPh}>imagen</div>
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
      );
    }

    return (
      <figure className="flex flex-col gap-2 max-w-full">
        <div className={clsx(wideBox, 'relative overflow-hidden rounded-xl')}>
          {!loaded && <div className={clsx(imgPh, 'animate-pulse')} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={caption || 'imagen'}
            className={clsx(
              'block w-full h-auto max-h-[70vh] object-contain select-none',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            loading="lazy"
          />
        </div>
        {caption ? (
          <figcaption className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            {caption}
          </figcaption>
        ) : null}
        {time ? <span className={timeClass}>{time}</span> : null}
      </figure>
    );
  }

  if (type === 'video') {
    if (!url || errored) {
      return (
        <div className={wideBox}>
          <div className={vidPh}>video</div>
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 max-w-full">
        <div className={clsx(wideBox, 'relative overflow-hidden rounded-xl')}>
          {!loaded && <div className={clsx(vidPh, 'animate-pulse')} />}
          <video
            src={url}
            onError={() => setErrored(true)}
            onLoadedData={() => setLoaded(true)}
            controls
            preload="metadata"
            className={clsx('block w-full h-auto max-h-[70vh] rounded-xl', loaded ? 'opacity-100' : 'opacity-0')}
          />
        </div>
        {caption ? (
          <p className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>{caption}</p>
        ) : null}
        {time ? <span className={timeClass}>{time}</span> : null}
      </div>
    );
  }

  // document
  return (
    <div className="flex flex-col gap-1 max-w-full">
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={clsx('underline hover:opacity-90 text-[13px] truncate', isMine ? 'text-white' : 'text-[#9DE1FE]')}
          title={mime || 'documento'}
        >
          Descargar documento
        </a>
        {caption ? (
          <span className={clsx('text-[12px] opacity-90 truncate', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            — {caption}
          </span>
        ) : null}
      </div>
      {time ? <span className={timeClass}>{time}</span> : null}
    </div>
  );
}

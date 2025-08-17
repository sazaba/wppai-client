'use client';

import React, { useState } from 'react';
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

/** 🔧 Sanitizador agresivo para “Chocol\nate”, guiones de salto, espacios raros, etc. */
function sanitizeAggressive(raw: string) {
  if (!raw) return '';
  let s = raw
    .normalize('NFC')
    .replace(/\r/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .replace(/\u00A0/g, ' '); // &nbsp;

  // Párrafos: colapsa 3+ saltos → 2
  s = s.replace(/\n{3,}/g, '\n\n');

  // Quita guiones de salto: "palabra-\ncontinua" -> "palabracontinua"
  s = s.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2');

  // Une cortes dentro de palabra (agresivo): "choco\nlate" -> "chocolate"
  // Solo cuando ambos lados son minúsculas (reduce falsos positivos en nombres propios).
  s = s.replace(/([a-záéíóúüñ])\s*\n\s*([a-záéíóúüñ])/g, '$1$2');

  // Saltos simples restantes (no párrafos) -> espacio
  // (preserva \n\n como salto de párrafo)
  s = s.replace(/(?<!\n)\n(?!\n)/g, ' ');

  // Colapsa espacios extras
  s = s.replace(/[ \t]{2,}/g, ' ');

  return s.trim();
}

export default function MessageBubble({ message, isMine }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription } = message;
  const time = formatTime(message.timestamp);
  const itsMedia = isMedia(mediaType);

  const bubble = clsx(
    'inline-flex flex-col items-end gap-1', // texto arriba, hora abajo
    'max-w-[78%] min-w-[120px] rounded-2xl shadow-sm px-3 py-2', // min ancho para que la hora no se parta
    isMine ? 'bg-[#005C4B] text-white ml-auto' : 'bg-[#202C33] text-[#E9EDEF]'
  );

  const textClass = clsx(
    'text-[14px] leading-[1.45] w-full text-left',
    'whitespace-pre-line break-words',
    'word-break:normal' // evita cortar palabras normales
  );

  const timeClass = clsx(
    'text-[11px] opacity-75 whitespace-nowrap', // ← no partir "a. m."
    isMine ? 'text-[#cfe5df]' : 'text-[#8696a0]'
  );

  const showText =
    !itsMedia ||
    (mediaType !== 'audio' &&
      contenido &&
      contenido !== '[imagen]' &&
      contenido !== '[video]' &&
      contenido !== '[nota de voz]' &&
      contenido !== '[documento]');

  return (
    <div className={clsx('w-full flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col gap-1">
        {/* BURBUJA MULTIMEDIA */}
        {itsMedia && (
          <div className={bubble}>
            <div className="w-full">
              <MediaRenderer
                type={mediaType as any}
                url={mediaUrl || ''}
                mime={mimeType || undefined}
                caption={caption || undefined}
                transcription={transcription || undefined}
                isMine={!!isMine}
                time={time}
                timeClass={timeClass}
              />
            </div>
          </div>
        )}

        {/* BURBUJA DE TEXTO */}
        {showText && (
          <div className={bubble}>
            <div className="w-full text-left">
              <p className={textClass}>{sanitizeAggressive(contenido)}</p>
            </div>
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

  if (type === 'audio') {
    return (
      <div className="w-full">
        <p className="text-[14px] leading-[1.45]">
          <span className="font-medium">Transcripción: </span>
          {transcription?.trim() || 'Nota de voz (sin transcripción)'}
        </p>
        {time ? <span className={timeClass}>{time}</span> : null}
      </div>
    );
  }

  if (type === 'image') {
    const box = 'w-[320px] max-w-[86vw]';
    const ph =
      'h-[220px] rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400';

    if (!url || errored) {
      return (
        <div className={clsx('relative', box)}>
          <div className={ph}>imagen</div>
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
      );
    }

    return (
      <figure className="flex flex-col gap-2">
        <div className={clsx('relative', box)}>
          {!loaded && <div className={clsx(ph, 'animate-pulse')} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={caption || 'imagen'}
            className={clsx('rounded-xl object-contain max-h-72 w-full', loaded ? 'block' : 'hidden')}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            loading="lazy"
          />
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
        {caption ? (
          <figcaption
            className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}
          >
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (type === 'video') {
    const box = 'w-[340px] max-w-[90vw]';
    const ph =
      'h-[200px] rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400';

    if (!url || errored) {
      return (
        <div className={clsx('relative', box)}>
          <div className={ph}>video</div>
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className={clsx('relative', box)}>
          {!loaded && <div className={clsx(ph, 'animate-pulse')} />}
          <video
            src={url}
            onError={() => setErrored(true)}
            onLoadedData={() => setLoaded(true)}
            controls
            preload="metadata"
            className={clsx('rounded-xl max-h-72 w-full', loaded ? 'block' : 'hidden')}
          />
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>

        {caption ? (
          <p className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            {caption}
          </p>
        ) : null}
      </div>
    );
  }

  // document
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={clsx('underline hover:opacity-90 text-[13px]', isMine ? 'text-white' : 'text-[#9DE1FE]')}
          title={mime || 'documento'}
        >
          Descargar documento
        </a>
        {caption ? (
          <span className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            — {caption}
          </span>
        ) : null}
      </div>
      {time ? <span className={timeClass}>{time}</span> : null}
    </div>
  );
}

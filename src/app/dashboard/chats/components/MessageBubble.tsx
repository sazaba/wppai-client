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

/** 🔧 Sanitizador agresivo: limpia cortes dentro de palabras, guiones de salto y espacios raros */
function sanitizeAggressive(raw: string) {
  if (!raw) return '';
  let s = raw
    .normalize('NFC')
    .replace(/\r/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n'); // deja doble salto como párrafo
  s = s.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2'); // quita guion de salto
  s = s.replace(/([a-záéíóúüñ])\s*\n\s*([a-záéíóúüñ])/g, '$1$2'); // une minúsculas separadas por \n
  s = s.replace(/(?<!\n)\n(?!\n)/g, ' '); // salto simple -> espacio
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s.trim();
}

export default function MessageBubble({ message, isMine }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription } = message;
  const time = formatTime(message.timestamp);
  const itsMedia = isMedia(mediaType);

  const bubble = clsx(
    'inline-flex flex-col items-end gap-1 overflow-hidden', // evita overflow-x
    'max-w-[86%] sm:max-w-[72%] rounded-2xl shadow-sm px-3 py-2',
    isMine ? 'bg-[#005C4B] text-white ml-auto ring-1 ring-white/5' : 'bg-[#202C33] text-[#E9EDEF] ring-1 ring-white/5'
  );

  const textClass = clsx(
    'text-[14px] leading-[1.45] w-full text-left',
    'whitespace-pre-line break-words'
  );

  const timeClass = clsx(
    'text-[11px] opacity-75 whitespace-nowrap',
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
      <div className="flex flex-col gap-1 max-w-full">
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

  // contenedor responsivo sin anchos fijos ⇒ NO overflow-x
  const mediaBox = 'relative w-full max-w-[88vw] sm:max-w-[420px]';
  const phBase =
    'rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400 w-full';
  const imgPh = clsx(phBase, 'min-h-[180px] sm:min-h-[220px]');
  const vidPh = clsx(phBase, 'min-h-[160px] sm:min-h-[200px]');

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
    if (!url || errored) {
      return (
        <div className={clsx(mediaBox)}>
          <div className={imgPh}>imagen</div>
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
      );
    }

    return (
      <figure className="flex flex-col gap-2 max-w-full">
        <div className={clsx(mediaBox, 'overflow-hidden rounded-xl')}>
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
          {time ? (
            <span
              className={clsx(
                'absolute bottom-1 right-2 px-1.5 py-0.5 rounded-md leading-none',
                'bg-black/35 text-white shadow-sm',
                timeClass
              )}
            >
              {time}
            </span>
          ) : null}
        </div>
        {caption ? (
          <figcaption className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (type === 'video') {
    if (!url || errored) {
      return (
        <div className={clsx(mediaBox)}>
          <div className={vidPh}>video</div>
          {time ? <span className={clsx('absolute bottom-1 right-2', timeClass)}>{time}</span> : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 max-w-full">
        <div className={clsx(mediaBox, 'overflow-hidden rounded-xl')}>
          {!loaded && <div className={clsx(vidPh, 'animate-pulse')} />}
          <video
            src={url}
            onError={() => setErrored(true)}
            onLoadedData={() => setLoaded(true)}
            controls
            preload="metadata"
            className={clsx('block w-full h-auto max-h-[70vh] rounded-xl', loaded ? 'opacity-100' : 'opacity-0')}
          />
          {time ? (
            <span
              className={clsx(
                'absolute bottom-1 right-2 px-1.5 py-0.5 rounded-md leading-none',
                'bg-black/35 text-white shadow-sm',
                timeClass
              )}
            >
              {time}
            </span>
          ) : null}
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
    <div className="flex flex-col items-end gap-1 max-w-full">
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

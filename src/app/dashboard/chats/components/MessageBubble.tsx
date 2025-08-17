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

// Normaliza saltos raros que a veces vienen en transcripciones o mensajes pegados
function normalizeText(txt: string) {
  return txt.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export default function MessageBubble({ message, isMine }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription } = message;
  const time = formatTime(message.timestamp);
  const itsMedia = isMedia(mediaType);

  const bubble = clsx(
    // grid: [contenido | hora] en la misma fila, hora se alinea al fondo
    'inline-grid grid-cols-[1fr,auto] gap-x-2 items-end',
    'max-w-[78%] min-w-[44px] rounded-2xl shadow-sm px-3 py-2',
    isMine ? 'bg-[#005C4B] text-white ml-auto' : 'bg-[#202C33] text-[#E9EDEF]'
  );

  const textClass = clsx(
    'text-[14px] leading-[1.45]',
    // manejo de saltos/rupturas
    'whitespace-pre-line break-words'
  );

  const timeClass = clsx(
    'text-[11px] opacity-75 pl-1',
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
        {itsMedia && (
          <div className={bubble}>
            <div className="col-start-1 row-start-1">
              <MediaRenderer
                type={mediaType as any}
                url={mediaUrl || ''}
                mime={mimeType || undefined}
                caption={caption || undefined}
                transcription={transcription || undefined}
                isMine={!!isMine}
              />
            </div>
            {time ? <span className={clsx('col-start-2 row-start-1', timeClass)}>{time}</span> : null}
          </div>
        )}

        {showText && (
          <div className={bubble}>
            <p className={clsx('col-start-1 row-start-1', textClass)}>
              {normalizeText(contenido)}
            </p>
            {time ? <span className={clsx('col-start-2 row-start-1', timeClass)}>{time}</span> : null}
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
}: {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mime?: string;
  caption?: string;
  transcription?: string;
  isMine: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (type === 'audio') {
    return (
      <div className="space-y-1">
        <p className="text-[14px] leading-[1.45]">
          <span className="font-medium">Transcripción: </span>
          {transcription?.trim() || 'Nota de voz (sin transcripción)'}
        </p>
      </div>
    );
  }

  if (type === 'image') {
    // contenedor estable
    const box = 'w-[320px] max-w-[86vw]';
    const ph = 'h-[220px] rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400';

    if (!url || errored) return <div className={clsx(box, ph)}>imagen</div>;

    return (
      <figure className="flex flex-col gap-2">
        {!loaded && <div className={clsx(box, ph, 'animate-pulse')} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={caption || 'imagen'}
          className={clsx(
            'rounded-xl object-contain max-h-72',
            box,
            loaded ? 'block' : 'hidden'
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          loading="lazy"
        />
        {caption ? (
          <figcaption className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (type === 'video') {
    const box = 'w-[340px] max-w-[90vw]';
    const ph = 'h-[200px] rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400';

    if (!url || errored) return <div className={clsx(box, ph)}>video</div>;

    return (
      <div className="flex flex-col gap-2">
        {!loaded && <div className={clsx(box, ph, 'animate-pulse')} />}
        <video
          src={url}
          onError={() => setErrored(true)}
          onLoadedData={() => setLoaded(true)}
          controls
          preload="metadata"
          className={clsx('rounded-xl max-h-72', box, loaded ? 'block' : 'hidden')}
        />
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
        <span className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>— {caption}</span>
      ) : null}
    </div>
  );
}

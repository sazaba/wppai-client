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
};

type Props = {
  message: ChatMessage;
  isMine?: boolean;
};

function isMedia(m?: string | null) {
  return m === 'image' || m === 'video' || m === 'audio' || m === 'document';
}

export default function MessageBubble({ message, isMine }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription } = message;

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const bubbleBase = clsx(
    'relative max-w-[78%] rounded-2xl px-3 py-2 shadow-sm',
    'whitespace-pre-wrap break-words hyphens-none text-[13.5px] leading-[1.35]',
    'pr-10', // reserva espacio para la hora
    isMine ? 'bg-[#005C4B] text-white ml-auto' : 'bg-[#202C33] text-[#E9EDEF]'
  );

  const showTextBubble =
    !isMedia(mediaType) ||
    (mediaType !== 'audio' &&
      contenido &&
      contenido !== '[imagen]' &&
      contenido !== '[video]' &&
      contenido !== '[nota de voz]' &&
      contenido !== '[documento]');

  return (
    <div className={clsx('w-full flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col gap-1">
        {isMedia(mediaType) && (
          <div className={bubbleBase}>
            <MediaRenderer
              type={mediaType!}
              url={mediaUrl || ''}
              mime={mimeType || undefined}
              caption={caption || undefined}
              transcription={transcription || undefined}
              isMine={!!isMine}
            />
            {time ? (
              <span
                className={clsx(
                  'absolute bottom-1 right-2 text-[11px] opacity-75',
                  isMine ? 'text-[#cfe5df]' : 'text-[#8696a0]'
                )}
              >
                {time}
              </span>
            ) : null}
          </div>
        )}

        {showTextBubble && (
          <div className={bubbleBase}>
            <p>{contenido}</p>
            {time ? (
              <span
                className={clsx(
                  'absolute bottom-1 right-2 text-[11px] opacity-75',
                  isMine ? 'text-[#cfe5df]' : 'text-[#8696a0]'
                )}
              >
                {time}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/** ---- Media ---- */

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
  // ✅ Hooks arriba: una sola pareja de estados para manejar error/carga según el tipo
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (type === 'audio') {
    return (
      <div className="space-y-1">
        <p className="text-[13.5px] leading-[1.35]">
          <span className="font-medium">Transcripción: </span>
          {transcription?.trim() || 'Nota de voz (sin transcripción)'}
        </p>
      </div>
    );
  }

  if (type === 'image') {
    if (!url || errored) {
      return (
        <div className="w-[280px] h-[220px] rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400">
          imagen
        </div>
      );
    }
    return (
      <figure className="flex flex-col gap-2">
        <div className="relative w-[280px] max-w-[320px]">
          {/* skeleton / placeholder para evitar saltos */}
          {!loaded && (
            <div className="w-full h-[220px] rounded-xl bg-black/20 animate-pulse" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={caption || 'imagen'}
            className={clsx(
              'rounded-xl object-cover',
              'w-full h-auto max-h-72',
              loaded ? 'block' : 'hidden'
            )}
            referrerPolicy="no-referrer"
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
      </figure>
    );
  }

  if (type === 'video') {
    if (!url || errored) {
      return (
        <div className="w-[320px] h-[200px] rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400">
          video
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {!loaded && <div className="w-[320px] h-[200px] rounded-xl bg-black/20 animate-pulse" />}
        <video
          src={url}
          onError={() => setErrored(true)}
          onLoadedData={() => setLoaded(true)}
          controls
          preload="metadata"
          className={clsx('rounded-xl max-h-72 w-[320px] h-auto', loaded ? 'block' : 'hidden')}
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

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

  const bubbleClass = clsx(
    'max-w-[85%] rounded-2xl px-3 py-2 shadow-sm',
    isMine ? 'bg-emerald-600 text-white ml-auto' : 'bg-white text-gray-900'
  );

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // — Render —
  return (
    <div className={clsx('w-full flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col gap-1">
        {/* MEDIA (sin reproductor para audio) */}
        {isMedia(mediaType) ? (
          <div className={bubbleClass}>
            <MediaRenderer
              type={mediaType!}
              url={mediaUrl || ''}
              mime={mimeType || undefined}
              caption={caption || undefined}
              transcription={transcription || undefined}
            />
          </div>
        ) : null}

        {/* TEXTO (más pequeño y sin saltos raros) */}
        {(!isMedia(mediaType) ||
          (contenido &&
            contenido !== '[imagen]' &&
            contenido !== '[video]' &&
            contenido !== '[nota de voz]' &&
            contenido !== '[documento]')) && (
          <div className={bubbleClass}>
            <p className="whitespace-normal break-words hyphens-auto text-[14px] leading-snug">
              {contenido}
            </p>
          </div>
        )}

        {/* Timestamp */}
        {time ? (
          <span className={clsx('text-[11px] text-gray-400 mt-0.5', isMine ? 'text-right' : 'text-left')}>
            {time}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function MediaRenderer({
  type,
  url,
  mime,
  caption,
  transcription,
}: {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mime?: string;
  caption?: string;
  transcription?: string;
}) {
  // 🚫 Audio: NO usamos reproductor, solo mostramos la transcripción
  if (type === 'audio') {
    return (
      <div className="space-y-1">
        <p className="text-[13px]">
          <span className="font-medium">Transcripción:</span>{' '}
          {transcription?.trim() || 'Nota de voz (sin transcripción)'}
        </p>
      </div>
    );
  }

  // Imagen con fallback si falla la carga
  if (type === 'image') {
    const [error, setError] = useState(false);
    if (!url || error) {
      return (
        <div className="w-28 h-28 rounded-xl bg-black/10 flex items-center justify-center text-xs text-gray-500">
          imagen
        </div>
      );
    }
    return (
      <figure className="flex flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={caption || 'imagen'}
          className="max-h-72 max-w-[320px] rounded-xl object-cover border border-gray-100"
          onError={() => setError(true)}
          loading="lazy"
        />
        {caption ? <figcaption className="text-[13px] opacity-90">{caption}</figcaption> : null}
      </figure>
    );
  }

  if (type === 'video') {
    return (
      <div className="flex flex-col gap-2">
        <video
          src={url}
          controls
          preload="metadata"
          className="max-h-72 max-w-[360px] rounded-xl"
        />
        {caption ? <p className="text-[13px] opacity-90">{caption}</p> : null}
      </div>
    );
  }

  // Document
  return (
    <div className="flex items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-[13px] underline hover:opacity-80"
        title={mime || 'documento'}
      >
        Descargar documento
      </a>
      {caption ? <span className="text-[13px] opacity-90">— {caption}</span> : null}
    </div>
  );
}

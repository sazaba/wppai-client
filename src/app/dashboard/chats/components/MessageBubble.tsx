'use client';

import React from 'react';
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
    'max-w-[80%] rounded-2xl px-3 py-2 shadow-sm text-[14px] leading-snug',
    isMine ? 'bg-emerald-600 text-white ml-auto' : 'bg-white text-gray-900'
  );

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={clsx('w-full flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="flex flex-col gap-1">
        {/* MEDIA */}
        {isMedia(mediaType) && mediaUrl ? (
          <div className={bubbleClass}>
            <MediaRenderer
              type={mediaType!}
              url={mediaUrl}
              mime={mimeType || undefined}
              caption={caption || undefined}
              transcription={transcription || undefined}
            />
          </div>
        ) : null}

        {/* TEXTO (si hay contenido real) */}
        {contenido &&
          contenido !== '[imagen]' &&
          contenido !== '[video]' &&
          contenido !== '[nota de voz]' &&
          contenido !== '[documento]' && (
            <div className={bubbleClass}>
              <p className="whitespace-pre-wrap break-words">{contenido}</p>
            </div>
          )}

        {/* timestamp */}
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
  if (type === 'image') {
    return (
      <figure className="flex flex-col gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={caption || 'imagen'}
          className="max-h-72 rounded-xl object-contain border border-gray-100"
        />
        {caption ? <figcaption className="text-xs opacity-80">{caption}</figcaption> : null}
      </figure>
    );
  }

  if (type === 'video') {
    return (
      <div className="flex flex-col gap-2">
        <video src={url} controls preload="metadata" className="max-h-72 rounded-xl" />
        {caption ? <p className="text-xs opacity-80">{caption}</p> : null}
      </div>
    );
  }

  if (type === 'audio') {
    // 🔹 Solo mostramos la transcripción (sin reproductor)
    return transcription ? (
      <p className="text-sm opacity-90">{transcription}</p>
    ) : (
      <p className="text-sm italic text-gray-400">[Nota de voz sin transcripción]</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline hover:opacity-80"
        title={mime || 'document'}
      >
        Descargar documento
      </a>
      {caption ? <span className="text-xs opacity-80">— {caption}</span> : null}
    </div>
  );
}

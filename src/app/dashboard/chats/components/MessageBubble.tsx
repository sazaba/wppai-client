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
    'whitespace-pre-wrap break-words text-[13px] leading-snug',
    isMine ? 'bg-[#005C4B] text-white ml-auto' : 'bg-[#202C33] text-[#E9EDEF]'
  );

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

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
        {isMedia(mediaType) ? (
          <div className={bubbleClass}>
            <MediaRenderer
              type={mediaType!}
              url={mediaUrl || ''}
              mime={mimeType || undefined}
              caption={caption || undefined}
              transcription={transcription || undefined}
              isMine={!!isMine}
            />
          </div>
        ) : null}

        {showTextBubble && (
          <div className={bubbleClass}>
            <p>{contenido}</p>
          </div>
        )}

        {time ? (
          <span
            className={clsx(
              'text-[11px] mt-0.5',
              isMine ? 'text-[#d1d7db] text-right' : 'text-[#8696a0] text-left'
            )}
          >
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
  isMine,
}: {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mime?: string;
  caption?: string;
  transcription?: string;
  isMine: boolean;
}) {
  if (type === 'audio') {
    return (
      <div className="space-y-1">
        <p className="text-[13px] leading-snug">
          <span className="font-medium">Transcripción: </span>
          {transcription?.trim() || 'Nota de voz (sin transcripción)'}
        </p>
      </div>
    );
  }

  if (type === 'image') {
    const [error, setError] = useState(false);
    if (!url || error) {
      return (
        <div className="w-28 h-28 rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400">
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
          className="max-h-72 max-w-[320px] rounded-xl object-cover"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setError(true)}
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
    const [error, setError] = useState(false);
    if (!url || error) {
      return (
        <div className="w-36 h-24 rounded-xl bg-black/20 flex items-center justify-center text-[12px] text-gray-400">
          video
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <video
          src={url}
          onError={() => setError(true)}
          controls
          preload="metadata"
          className="max-h-72 max-w-[360px] rounded-xl"
          crossOrigin="anonymous" // ← dejar solo crossOrigin en <video>
        />
        {caption ? (
          <p className={clsx('text-[12px] opacity-90', isMine ? 'text-white/90' : 'text-[#E9EDEF]/90')}>
            {caption}
          </p>
        ) : null}
      </div>
    );
  }

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

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
  status?: 'sending' | 'sent' | 'failed'; // ← OPCIONAL
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
function toAbsolute(u?: string | null) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  const base = API_BASE.replace(/\/+$/, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  return `${base}${path}`;
}

function sanitizeAggressive(raw: string) {
  if (!raw) return '';
  let s = raw
    .normalize('NFC')
    .replace(/\r/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2');
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s.trim();
}

/* ----------------- COLA CON BORDE ------------------ */
function BubbleTail({ side, color, borderColor }: { side: 'left' | 'right'; color: string; borderColor: string }) {
  if (side === 'right') {
    return (
      <>
        <span
          className="absolute -right-[7px] bottom-[7px] w-0 h-0"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: `10px solid ${borderColor}`,
          }}
        />
        <span
          className="absolute -right-[6px] bottom-[7px] w-0 h-0"
          style={{
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: `10px solid ${color}`,
          }}
        />
      </>
    );
  }
  return (
    <>
      <span
        className="absolute -left-[7px] bottom-[7px] w-0 h-0"
        style={{
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: `10px solid ${borderColor}`,
        }}
      />
      <span
        className="absolute -left-[6px] bottom-[7px] w-0 h-0"
        style={{
          borderTop: '8px solid transparent',
          borderBottom: '8px solid transparent',
          borderRight: `10px solid ${color}`,
        }}
      />
    </>
  );
}

/* --------- Contenedor de burbuja con cola opcional --------- */
function BubbleBox({
  children,
  isMine,
  withTail,
}: {
  children: React.ReactNode;
  isMine: boolean;
  withTail?: boolean;
}) {
  const bgMine = '#005C4B';
  const bgOther = '#1F2C34';     // ← gris WhatsApp dark (más claro que #202C33)
  const borderMine = '#004137';
  const borderOther = '#111B21';

  const bubbleBase = clsx(
    'relative inline-flex flex-col',
    'min-w-0 max-w-[92%] sm:max-w-[72%] md:max-w-[65%]',
    'px-3.5 py-2.5 rounded-2xl shadow-sm',
    isMine ? 'bg-[#005C4B] text-white self-end' : 'bg-[#1F2C34] text-[#E9EDEF] self-start'
  );

  return (
    <div className={bubbleBase}>
      {children}
      {withTail ? (
        <BubbleTail
          side={isMine ? 'right' : 'left'}
          color={isMine ? bgMine : bgOther}
          borderColor={isMine ? borderMine : borderOther}
        />
      ) : null}
    </div>
  );
}

/* --------- Loader de 3 puntitos estilo WhatsApp --------- */
function DotsLoader({ className = '' }: { className?: string }) {
  return (
    <span className={clsx('flex items-center gap-1', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-.2s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce [animation-delay:-.1s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" />
    </span>
  );
}

export default function MessageBubble({ message, isMine = false }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription, mediaId, status } = message;
  const time = formatTime(message.timestamp);
  const itsMedia = isMedia(mediaType);

  const textClass = clsx(
    'text-[14px] leading-[1.45] antialiased',
    'whitespace-pre-wrap break-words [overflow-wrap:anywhere]'
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

  const resolvedMediaUrl = useMemo(() => {
    const first = (mediaUrl || '').trim();
    if (first) return toAbsolute(first);
    if (mediaId) return toAbsolute(`/api/whatsapp/media/${mediaId}`);
    return '';
  }, [mediaUrl, mediaId]);

  const willRenderMedia = itsMedia;
  const willRenderText = !!showText;
  const isSending = status === 'sending';
  const isFailed = status === 'failed';

  return (
    <div className={clsx('w-full flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-full flex flex-col gap-1">
        {willRenderMedia && (
          <BubbleBox isMine={isMine} withTail={!willRenderText}>
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
          </BubbleBox>
        )}

        {willRenderText && (
          <BubbleBox isMine={isMine} withTail>
            {contenido ? <p className={textClass}>{sanitizeAggressive(contenido)}</p> : null}

            {/* Línea de estado + hora */}
            <div className="mt-1 flex items-center gap-2 self-end">
              {time ? <span className={timeClass}>{time}</span> : null}
              {isSending && (
                <DotsLoader className={clsx(isMine ? 'text-white/80' : 'text-[#E9EDEF]/80')} />
              )}
              {isFailed && (
                <span className="text-[11px] text-red-400">Error</span>
              )}
            </div>
          </BubbleBox>
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

  const mediaWrap = 'w-full';
  const mediaBox = 'relative overflow-hidden rounded-xl';
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
        <div className={mediaWrap}>
          <div className={imgPh}>imagen</div>
          {time ? <span className={timeClass}>{time}</span> : null}
        </div>
      );
    }

    return (
      <figure className="flex flex-col gap-2 max-w-full">
        <div className={clsx(mediaWrap, mediaBox)}>
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
        <div className={mediaWrap}>
          <div className={vidPh}>video</div>
          {time ? <span className={timeClass}>{time}</span> : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 max-w-full">
        <div className={clsx(mediaWrap, mediaBox)}>
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

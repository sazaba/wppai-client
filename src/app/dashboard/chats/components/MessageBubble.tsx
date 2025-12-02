'use client';

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { FiFile, FiPlay, FiImage, FiMic } from 'react-icons/fi';

export type ChatMessage = {
  id?: number | string | null;
  externalId?: string | null;
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
  status?: 'sending' | 'sent' | 'failed';
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

/* ----------------- COLA CON BORDE (Tail) ------------------ */
function BubbleTail({ side, color }: { side: 'left' | 'right'; color: string }) {
  if (side === 'right') {
    return (
      <svg className="absolute -right-[8px] top-0 w-[8px] h-[13px]" viewBox="0 0 8 13" aria-hidden="true">
         <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" fill={color} />
      </svg>
    );
  }
  return (
    <svg className="absolute -left-[8px] top-0 w-[8px] h-[13px]" viewBox="0 0 8 13" aria-hidden="true">
        <path d="M-1.188 1H4v11.193l-6.467-8.625C-3.526 2.156 -2.958 1 -1.188 1z" transform="scale(-1, 1) translate(-4, 0)" fill={color} />
    </svg>
  );
}

/* --------- Contenedor de burbuja --------- */
function BubbleBox({
  children,
  isMine,
  withTail,
}: {
  children: React.ReactNode;
  isMine: boolean;
  withTail?: boolean;
}) {
  // 🎨 COLORES SOBRIOS & PREMIUM (Menos llamativos)
  // Mine: Un verde azulado oscuro o índigo muy desaturado (más elegante)
  const bgMine = '#374151'; // Zinc-700 (Opcional: '#005C4B' para verde WhatsApp Dark clásico)
  
  // Other: Un gris oscuro casi negro para contraste sutil
  const bgOther = '#27272a'; // Zinc-800

  // Clases base con proporciones ajustadas (50% en desktop)
  const bubbleBase = clsx(
    'relative inline-flex flex-col',
    'min-w-0 max-w-[85%] sm:max-w-[60%] md:max-w-[50%]', // <-- Proporciones ajustadas (50%)
    'px-3.5 py-2 rounded-xl shadow-sm border border-white/5 transition-all', 
    isMine 
        ? 'bg-zinc-700 text-white self-end rounded-tr-none' 
        : 'bg-zinc-800 text-zinc-100 self-start rounded-tl-none'
  );

  return (
    <div className={bubbleBase}>
      {children}
      {withTail ? (
        <BubbleTail
          side={isMine ? 'right' : 'left'}
          color={isMine ? bgMine : bgOther}
        />
      ) : null}
    </div>
  );
}

/* --------- Loader de 3 puntitos --------- */
function DotsLoader({ className = '' }: { className?: string }) {
  return (
    <span className={clsx('flex items-center gap-1', className)}>
      <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-.2s]" />
      <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-.1s]" />
      <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
    </span>
  );
}

export default function MessageBubble({ message, isMine = false }: Props) {
  const { contenido, mediaType, mediaUrl, mimeType, caption, transcription, mediaId, status } = message;
  const time = formatTime(message.timestamp);
  const itsMedia = isMedia(mediaType);

  const textClass = clsx(
    'text-[14px] leading-relaxed antialiased font-normal',
    'whitespace-pre-wrap break-words [overflow-wrap:anywhere]'
  );

  const timeClass = clsx(
    'text-[10px] whitespace-nowrap select-none mt-1 self-end font-medium opacity-60',
    isMine ? 'text-white' : 'text-zinc-400'
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
    <div className={clsx('w-full flex mb-2', isMine ? 'justify-end' : 'justify-start')}>
      <div className="w-full flex flex-col gap-1">
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
            <div className="flex items-center justify-end gap-1.5 mt-1 -mb-0.5">
              {time ? <span className={timeClass}>{time}</span> : null}
              
              {isSending && (
                <DotsLoader className={clsx('w-3 h-3', isMine ? 'text-white/60' : 'text-zinc-500')} />
              )}
              
              {isFailed && (
                <span className="text-[9px] text-red-300 font-bold bg-red-500/20 px-1 rounded">!</span>
              )}
              
              {isMine && !isSending && !isFailed && (
                 <svg viewBox="0 0 16 11" className="w-3.5 h-3.5 text-emerald-400 fill-current opacity-90"><path d="M11.5 0L4.5 7L2.5 5L0 7.5L4.5 11L16 2L11.5 0Z"/></svg>
              )}
            </div>
          </BubbleBox>
        )}
      </div>
    </div>
  );
}

/* =================== MEDIA RENDERER =================== */

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

  const mediaWrap = 'w-full min-w-[200px]';
  const mediaBox = 'relative overflow-hidden rounded-lg border border-white/5';
  const phBase = 'rounded-lg bg-black/20 flex flex-col gap-2 items-center justify-center text-xs text-zinc-500 w-full animate-pulse';
  
  const imgPh = clsx(phBase, 'min-h-[180px]');
  const vidPh = clsx(phBase, 'min-h-[180px]');

  if (type === 'audio') {
    return (
      <div className="w-full flex flex-col gap-2 min-w-[220px]">
        <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
            <div className={clsx("p-2 rounded-full", isMine ? "bg-zinc-600 text-white" : "bg-indigo-500 text-white")}>
                <FiMic />
            </div>
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-white/40 rounded-full" />
            </div>
        </div>
        <p className="text-[13px] leading-snug italic opacity-70">
          <span className="font-semibold text-[10px] uppercase tracking-wide opacity-60 block mb-1">Transcripción</span>
          {transcription?.trim() || 'Nota de voz'}
        </p>
        {time ? <span className={timeClass}>{time}</span> : null}
      </div>
    );
  }

  if (type === 'image') {
    if (!url || errored) {
      return (
        <div className={mediaWrap}>
          <div className={imgPh}>
            <FiImage className="w-5 h-5 opacity-40" />
            <span className="text-[10px]">Imagen</span>
          </div>
          {time ? <span className={timeClass}>{time}</span> : null}
        </div>
      );
    }

    return (
      <figure className="flex flex-col gap-1.5 max-w-full">
        <div className={clsx(mediaWrap, mediaBox)}>
          {!loaded && (
            <div className={imgPh}>
                <FiImage className="w-5 h-5 opacity-40" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={caption || 'imagen'}
            className={clsx(
              'block w-full h-auto max-h-[350px] object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0 absolute top-0 left-0'
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            loading="lazy"
          />
        </div>
        {caption ? (
          <figcaption className={clsx('text-[13px] opacity-90 mt-0.5', isMine ? 'text-white' : 'text-zinc-200')}>
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
          <div className={vidPh}>
            <FiPlay className="w-5 h-5 opacity-40" />
            <span className="text-[10px]">Video</span>
          </div>
          {time ? <span className={timeClass}>{time}</span> : null}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 max-w-full">
        <div className={clsx(mediaWrap, mediaBox)}>
          {!loaded && (
             <div className={vidPh} />
          )}
          <video
            src={url}
            onError={() => setErrored(true)}
            onLoadedData={() => setLoaded(true)}
            controls
            preload="metadata"
            className={clsx('block w-full h-auto max-h-[350px]', loaded ? 'opacity-100' : 'opacity-0')}
          />
        </div>
        {caption ? (
          <p className={clsx('text-[13px] opacity-90 mt-0.5', isMine ? 'text-white' : 'text-zinc-200')}>{caption}</p>
        ) : null}
        {time ? <span className={timeClass}>{time}</span> : null}
      </div>
    );
  }

  // Documento
  return (
    <div className="flex flex-col gap-1 max-w-full min-w-[200px]">
      <div className={clsx(
          "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
          isMine 
            ? "bg-zinc-800 border-white/5 hover:bg-zinc-900" 
            : "bg-zinc-900 border-white/5 hover:bg-black/40"
      )}>
        <div className={clsx("p-2 rounded-md shrink-0", isMine ? "bg-white/10 text-white" : "bg-zinc-800 text-zinc-400")}>
            <FiFile className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className={clsx('text-[13px] font-medium truncate block hover:underline', isMine ? 'text-white' : 'text-indigo-400')}
                title={mime || 'documento'}
            >
                {caption || 'Documento'}
            </a>
            <span className={clsx("text-[9px] uppercase tracking-wide opacity-60", isMine ? "text-white" : "text-zinc-500")}>
                {mime ? mime.split('/')[1] : 'FILE'}
            </span>
        </div>
      </div>
      {time ? <span className={timeClass}>{time}</span> : null}
    </div>
  );
}
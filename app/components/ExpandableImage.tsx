'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ExpandableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  figureClassName?: string;
};

export default function ExpandableImage({
  src,
  alt,
  width,
  height,
  caption,
  sizes = '(min-width: 920px) 872px, calc(100vw - 48px)',
  priority = false,
  className = 'w-full bg-white object-contain outline outline-1 -outline-offset-1 outline-black/10',
  figureClassName,
}: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const lightbox = (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4 sm:p-8"
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            y: -12,
            filter: 'blur(4px)',
            transition: { duration: 0.15, ease: 'easeIn' },
          }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded project image"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute right-4 top-4 z-10 flex size-12 cursor-pointer items-center justify-center border border-white/50 bg-black/45 text-4xl leading-none text-white transition-[background-color,color,scale] duration-200 hover:bg-white hover:text-black active:scale-[0.96] sm:right-6 sm:top-6"
            aria-label="Close expanded image"
          >
            ×
          </button>

          <div className="relative h-full max-h-[84vh] w-full max-w-7xl">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {caption ? (
            <p className="absolute bottom-4 left-4 right-4 text-center text-xs leading-relaxed text-white/85 sm:bottom-6">
              {caption}
            </p>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <figure className={figureClassName}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group block w-full cursor-zoom-in text-left transition-transform duration-200 active:scale-[0.96]"
          aria-label={`Expand image: ${alt}`}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={`${className} transition-opacity duration-300 group-hover:opacity-90`}
            priority={priority}
          />
        </button>
        {caption ? (
          <figcaption className="mt-2 text-xs text-neutral-600">
            {caption}
          </figcaption>
        ) : null}
      </figure>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(lightbox, document.body)
        : null}
    </>
  );
}

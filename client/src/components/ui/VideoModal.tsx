import React, { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSiteContent } from '../../context/ContentContext';

function getEmbedUrl(url: string): { type: 'iframe' | 'video'; src: string } {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }
  return { type: 'video', src: url };
}

export const VideoModal: React.FC = () => {
  const { videos, videoModalOpen, setVideoModalOpen } = useSiteContent();
  const walkthrough = videos.find((v) => v.isWalkthrough && v.visible) || videos.find((v) => v.visible);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVideoModalOpen(false);
    };
    if (videoModalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videoModalOpen, setVideoModalOpen]);

  return (
    <AnimatePresence>
      {videoModalOpen && walkthrough && (
        <m.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Gym walkthrough video"
        >
          <button
            type="button"
            onClick={() => setVideoModalOpen(false)}
            aria-label="Close video modal"
            className="absolute top-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#B6F500]/50 bg-[#0B0B0C] text-white hover:bg-[#B6F500] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-[#B6F500]/40 bg-[#0B0B0C] shadow-lime-lg">
            {(() => {
              const media = getEmbedUrl(walkthrough.url);
              if (media.type === 'iframe') {
                return (
                  <iframe
                    src={media.src}
                    title={walkthrough.title}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                );
              }
              return (
                <video
                  src={media.src}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              );
            })()}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

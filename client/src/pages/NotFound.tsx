import React from 'react';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/ui/SEOHead';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[82vh] flex items-center justify-center px-5 bg-[#050505] pt-[72px]">
      <SEOHead title="Page Not Found" path="/404" />
      <div className="text-center max-w-lg">
        <div className="font-display italic font-black text-[120px] leading-none text-[#B6F500] text-lime-glow">
          404
        </div>
        <h1 className="headline-display text-4xl sm:text-5xl text-white mt-2">
          OFF THE TRAINING FLOOR
        </h1>
        <p className="mt-4 text-sm text-[#C9C9C9]">
          The page you&apos;re looking for doesn&apos;t exist or moved. Head back to the main floor.
        </p>
        <div className="mt-8">
          <Button variant="primary" to="/">
            BACK TO HOME
          </Button>
        </div>
      </div>
    </div>
  );
};

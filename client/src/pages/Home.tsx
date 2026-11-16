import React from 'react';
import { SEOHead } from '../components/ui/SEOHead';
import { HeroSection } from '../components/home/HeroSection';
import { FeatureStrip } from '../components/home/FeatureStrip';
import { MembershipSection } from '../components/home/MembershipSection';
import { SystemSection } from '../components/home/SystemSection';
import { TransformationsSection } from '../components/home/TransformationsSection';
import { FounderSection } from '../components/home/FounderSection';
import { BookingCardsSection } from '../components/home/BookingCardsSection';

interface HomeProps {
  preloaderDone: boolean;
}

export const Home: React.FC<HomeProps> = ({ preloaderDone }) => {
  return (
    <>
      <SEOHead
        title="JS FITNESS INC | 24/7 Gym & Personal Training Calgary NE"
        description="More than just a gym membership. 24/7 gym access, custom training & nutrition coaching, and real transformations in Calgary NE."
        path="/"
      />
      <HeroSection ready={preloaderDone} />
      <FeatureStrip />
      <MembershipSection />
      <SystemSection />
      <TransformationsSection />
      <FounderSection />
      <BookingCardsSection />
    </>
  );
};

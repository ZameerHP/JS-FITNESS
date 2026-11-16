import React from 'react';
import { MembershipSection } from './MembershipSection';
import { SystemSection } from './SystemSection';
import { TransformationsSection } from './TransformationsSection';
import { FounderSection } from './FounderSection';
import { BookingCardsSection } from './BookingCardsSection';

interface HomeBelowFoldProps {
  onPrefetchCalendly?: () => void;
}

export const HomeBelowFold: React.FC<HomeBelowFoldProps> = React.memo(({ onPrefetchCalendly }) => {
  return (
    <>
      <MembershipSection />
      <SystemSection />
      <TransformationsSection />
      <FounderSection />
      <BookingCardsSection onPrefetchCalendly={onPrefetchCalendly} />
    </>
  );
});

export default HomeBelowFold;

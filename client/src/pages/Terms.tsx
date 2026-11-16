import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { SEOHead } from '../components/ui/SEOHead';

export const Terms: React.FC = () => {
  const { config } = useSiteContent();

  return (
    <div className="pt-[110px] pb-24 bg-[#050505]">
      <SEOHead
        title="Terms & Conditions"
        description="Terms and Conditions for JS FITNESS INC including the $99.99 CAD Strategy Assessment non-refundable policy and credit application rules."
        path="/terms"
      />
      <div className="mx-auto max-w-[900px] px-5 lg:px-8">
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-xs text-amber-200 mb-8">
          Template Notice: These Terms &amp; Conditions are an editable template for JS FITNESS INC
          (Alberta, Canada) and are flagged for final legal review before commercial launch.
        </div>

        <div className="eyebrow-row mb-4">LEGAL</div>
        <h1 className="headline-display text-5xl text-white mb-2">TERMS &amp; CONDITIONS</h1>
        <p className="text-xs text-[#8C8C8C] mb-10">
          Last updated: {config.legal.termsUpdated}
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-[#C9C9C9]">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              1. Strategy Assessment Policy ($99.99 CAD)
            </h2>
            <p>
              The Strategy Assessment is an in-person, 1-to-2 hour diagnostic session conducted at{' '}
              {config.contact.address} priced at <strong className="text-white">$99.99 CAD</strong>.
              This appointment fee is <strong className="text-white">non-refundable</strong>.
            </p>
            <p className="mt-2">
              <strong className="text-[#B6F500]">Credit Application:</strong> Following completion of
              your Strategy Assessment, your full $99.99 CAD fee may be applied as a direct credit
              toward either (a) an eligible JS FITNESS SYSTEM coaching enrollment or (b) a gym
              membership initiated in person. Regardless of whether you enroll, you receive your
              personalized transformation roadmap from the session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">
              2. Gym Tours &amp; Membership Enrollment
            </h2>
            <p>
              Free Gym Tours are complimentary in-person appointments. All membership enrollments,
              phase availability (Founders Membership, Second Release, Final Release), and facility
              agreements are finalized in person at the gym.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. 24/7 Facility Conduct &amp; Waiver</h2>
            <p>
              Members agree to follow all safety rules, equipment guidelines, and facility access
              terms upon signing an in-person membership waiver. Semi-private coaching sessions are
              capped at 4 participants per slot.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Province of Alberta and the federal laws of
              Canada applicable therein. Questions may be directed to {config.contact.email}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

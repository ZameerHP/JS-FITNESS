import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { SEOHead } from '../components/ui/SEOHead';

export const Privacy: React.FC = () => {
  const { config } = useSiteContent();

  return (
    <div className="pt-[110px] pb-24 bg-[#050505]">
      <SEOHead
        title="Privacy Policy"
        description="Privacy Policy for JS FITNESS INC (Calgary, Alberta) under PIPEDA and Alberta PIPA guidelines."
        path="/privacy"
      />
      <div className="mx-auto max-w-[900px] px-5 lg:px-8">
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-xs text-amber-200 mb-8">
          Template Notice: This Privacy Policy is an editable starter template aligned with Canadian
          PIPEDA and Alberta PIPA standards and is flagged for final legal review prior to launch.
        </div>

        <div className="eyebrow-row mb-4">LEGAL</div>
        <h1 className="headline-display text-5xl text-white mb-2">PRIVACY POLICY</h1>
        <p className="text-xs text-[#8C8C8C] mb-10">
          Last updated: {config.legal.privacyPolicyUpdated}
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-[#C9C9C9]">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Who We Are</h2>
            <p>
              JS FITNESS INC operates a 24/7 fitness facility and personal coaching service at{' '}
              {config.contact.address}. We respect your privacy and protect personal information in
              accordance with the Personal Information Protection Act (Alberta PIPA) and Canada&apos;s
              Personal Information Protection and Electronic Documents Act (PIPEDA).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Information We Collect</h2>
            <p>
              When you submit a contact inquiry, book a free gym tour, or book a Strategy
              Assessment, we may collect your name, email address, phone number, and fitness goals
              or interests. Uploaded client transformation photos are published only with explicit
              written client consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. How We Use Information</h2>
            <p>
              Your information is used strictly to schedule in-person gym tours, conduct Strategy
              Assessments, respond to inquiries, manage active memberships, and deliver coaching
              services. We never sell or rent personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Contact &amp; Access Requests</h2>
            <p>
              You may request access to, correction of, or deletion of your personal records by
              contacting {config.contact.email} or calling {config.contact.phone}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

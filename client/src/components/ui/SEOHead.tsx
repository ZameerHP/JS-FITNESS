import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteContent } from '../../context/ContentContext';

interface SEOHeadProps {
  title: string;
  description?: string;
  path?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = React.memo(({ title, description, path = '/' }) => {
  const { config } = useSiteContent();
  const fullTitle = title.includes('JS FITNESS') ? title : `${title} | JS FITNESS INC`;
  const desc = description || config.seo.defaultDescription;
  const canonicalUrl = `https://jsfitness.ca${path}`;

  const jsonLdString = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ExerciseGym',
        name: 'JS FITNESS INC',
        description: desc,
        url: 'https://jsfitness.ca',
        logo: 'https://jsfitness.ca/images/js-logo.png',
        telephone: config.contact.phone,
        email: config.contact.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Unit 3135, 6520 36 Street NE',
          addressLocality: 'Calgary',
          addressRegion: 'AB',
          postalCode: 'T3J 2L3',
          addressCountry: 'CA',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        ],
        sameAs: [
          config.socials.instagram,
          config.socials.tiktok,
          config.socials.youtube,
          config.socials.facebook,
        ],
      }),
    [
      desc,
      config.contact.phone,
      config.contact.email,
      config.socials.instagram,
      config.socials.tiktok,
      config.socials.youtube,
      config.socials.facebook,
    ]
  );

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={config.seo.keywords} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content="https://jsfitness.ca/images/hero-bg.webp" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />

      <script type="application/ld+json">{jsonLdString}</script>
    </Helmet>
  );
});

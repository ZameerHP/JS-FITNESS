export type PhaseStatus = 'Upcoming' | 'Active' | 'Sold out';

export interface PricingPhase {
  tier: string;
  title: string;
  subtitle: string;
  status: PhaseStatus;
  icon: 'star' | 'bars' | 'crown';
}

export interface SiteConfigData {
  brand: {
    name: string;
    shortName: string;
    brandLine: string;
    tagline: string;
    copyright: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    whatsappNumber: string;
    whatsappUrl: string;
    mapsQuery: string;
  };
  hours: {
    gymAccess: string;
    personalTraining: string;
  };
  socials: {
    instagram: string;
    instagramHandle: string;
    tiktok: string;
    tiktokHandle: string;
    youtube: string;
    youtubeHandle: string;
    facebook: string;
    facebookHandle: string;
  };
  booking: {
    calendlyTourUrl: string;
    calendlyAssessmentUrl: string;
    assessmentPriceCad: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  membershipAvailability: {
    open: boolean;
    spotsRemaining: number;
    label: string;
  };
  pricingPhases: PricingPhase[];
  seo: {
    siteTitle: string;
    defaultDescription: string;
    keywords: string;
  };
  legal: {
    privacyPolicyUpdated: string;
    termsUpdated: string;
  };
}

// Note: Never store or expose gym membership dollar prices anywhere in config or UI.
// The only public price is the Strategy Assessment: $99.99 CAD.
export const siteConfig: SiteConfigData = {
  brand: {
    name: 'JS FITNESS INC',
    shortName: 'JS',
    brandLine: 'MORE THAN JUST A GYM MEMBERSHIP.',
    tagline: 'TRAIN. EAT. SLEEP. REPEAT.',
    copyright: '© 2026 JS FITNESS INC. All Rights Reserved.',
  },
  contact: {
    address: 'Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3',
    phone: '403-704-7021',
    email: 'coachingbyjatinder@gmail.com',
    whatsappNumber: '14037047021',
    whatsappUrl: 'https://wa.me/14037047021',
    mapsQuery: 'Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3',
  },
  hours: {
    gymAccess: '24/7 Gym Access',
    personalTraining: 'Personal Training: By Appointment Only',
  },
  socials: {
    instagram: 'https://instagram.com/jatindersinghsra',
    instagramHandle: '@jatindersinghsra',
    tiktok: 'https://tiktok.com/@jatindersinghsra',
    tiktokHandle: '@jatindersinghsra',
    youtube: 'https://youtube.com/@jatindersinghsra',
    youtubeHandle: '@jatindersinghsra',
    facebook: 'https://facebook.com/jatinder.singh.165',
    facebookHandle: 'jatinder.singh.165',
  },
  booking: {
    calendlyTourUrl: '',
    calendlyAssessmentUrl: '',
    assessmentPriceCad: '99.99',
  },
  announcement: {
    enabled: false,
    text: 'Founders Membership spots are open — Book your free gym tour today.',
    link: '/membership',
  },
  membershipAvailability: {
    open: true,
    spotsRemaining: 24,
    label: 'LIMITED SPOTS',
  },
  pricingPhases: [
    {
      tier: 'Tier 1',
      title: 'Founders Membership',
      subtitle: 'Introductory rate with limited spots.',
      status: 'Active',
      icon: 'star',
    },
    {
      tier: 'Tier 2',
      title: 'Second Release',
      subtitle: 'Pricing increases soon.',
      status: 'Upcoming',
      icon: 'bars',
    },
    {
      tier: 'Tier 3',
      title: 'Final Release',
      subtitle: 'Final pricing phase.',
      status: 'Upcoming',
      icon: 'crown',
    },
  ],
  seo: {
    siteTitle: 'JS FITNESS INC | 24/7 Gym & Personal Training Calgary NE',
    defaultDescription:
      'JS FITNESS INC — More than just a gym membership. 24/7 gym access, customized coaching, nutrition tracking, and real transformations in Calgary NE.',
    keywords: 'gym Calgary NE, 24/7 gym Calgary, personal trainer Calgary',
  },
  legal: {
    privacyPolicyUpdated: 'November 2026',
    termsUpdated: 'November 2026',
  },
};

export const HOME_COPY = {
  hero: {
    eyebrow: 'JS FITNESS INC',
    headlineLine1: 'TRAIN. EAT.',
    headlineLine2Prefix: 'SLEEP.',
    headlineLine2Accent: 'REPEAT.',
    subline: 'Build Strength. Build Discipline. Build Your Future.',
    primaryCta: 'BOOK YOUR FREE GYM TOUR',
    secondaryCta: 'WATCH OUR GYM',
    scrollLabel: 'SCROLL TO EXPLORE',
    rightTagline: ['MORE', 'THAN JUST', 'A GYM', 'MEMBERSHIP.'],
  },
  features: [
    { id: 'access', icon: 'clock', lines: ['24/7', 'Gym Access'] },
    { id: 'app', icon: 'phone', lines: ['Fitness App', '& Videos'] },
    { id: 'community', icon: 'group', lines: ['Fitness', 'Community'] },
    { id: 'progress', icon: 'chart', lines: ['Track Your', 'Progress'] },
    { id: 'equipment', icon: 'diamond', lines: ['Premium', 'Equipment'] },
  ],
  membership: {
    eyebrow: 'GYM MEMBERSHIP',
    bigLime: '24/7',
    bigWhite: 'ACCESS',
    description:
      'Get unlimited access to our state-of-the-art facility, powered by a fitness app, expert resources, and a supportive community.',
    cta: 'EXPLORE MEMBERSHIP',
    cardTitle: 'MEMBERSHIP PHASES',
  },
  system: {
    eyebrow: 'JS FITNESS SYSTEM',
    titleLine1: 'YOUR COMPLETE',
    titleAccent: 'TRANSFORMATION',
    titleSuffix: 'SYSTEM',
    description:
      'Personalized coaching with nutrition, training, lifestyle tracking and more.',
    checklist: [
      'Nutrition & Meal Plans',
      'Progress Monitoring',
      'Custom Workouts',
      'Expert Guidance',
      'Lifestyle Tracking',
      'Accountability',
    ],
    cta: 'LEARN MORE',
  },
  transformations: {
    eyebrow: 'CLIENT TRANSFORMATIONS',
    titleLine1: 'REAL PEOPLE.',
    titleWhite: 'REAL',
    titleAccent: 'RESULTS.',
    description: 'Be part of our growing community and achieve your own transformation.',
    cta: 'VIEW TRANSFORMATIONS',
  },
  founder: {
    eyebrow: 'MEET THE FOUNDER',
    name: 'JATINDER SINGH',
    title: 'Certified Personal Trainer',
    mission:
      'My mission is to help you become the strongest, healthiest version of yourself.',
    cta: 'LEARN MORE',
    scriptTop: 'Stronger',
    scriptBottom: 'Together',
  },
  bookingCards: {
    tour: {
      titleLine1: 'BOOK YOUR FREE',
      titleLine2: 'GYM TOUR',
      description: 'Explore the facility and discuss membership in person.',
      cta: 'BOOK NOW',
    },
    assessment: {
      badge: 'PAID APPOINTMENT',
      title: 'STRATEGY ASSESSMENT',
      priceLabel: '$99.99 CAD',
      description: 'Personalized assessment and transformation roadmap.',
      cta: 'BOOK NOW',
    },
  },
};

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Gym Membership', path: '/membership' },
  { label: 'JS FITNESS SYSTEM', path: '/system' },
  { label: 'Transformations', path: '/transformations' },
  { label: 'Contact', path: '/contact' },
];

export const MEMBERSHIP_BENEFITS = [
  {
    title: '24/7 Facility Access',
    description:
      'Train on your schedule—early mornings, late nights, or weekends—with secure keycard entry 365 days a year.',
  },
  {
    title: 'Fitness App with Instructional Videos',
    description:
      'Every member gets access to our dedicated training app with clear video demonstrations for proper exercise form.',
  },
  {
    title: 'Workout Logging (Sets, Reps & Weights)',
    description:
      'Record every working set, rep count, and weight directly in the app so you never guess what you lifted last week.',
  },
  {
    title: 'Progressive Overload Tracking',
    description:
      'Visualize strength trends and volume progression automatically so every training block pushes you forward.',
  },
  {
    title: 'WhatsApp Fitness Community',
    description:
      'Stay locked in with like-minded members in Calgary NE sharing daily wins, accountability, and training energy.',
  },
  {
    title: 'Daily 3 Non-Negotiables',
    description:
      'Build unstoppable consistency around daily training effort, nutrition standards, and sleep/recovery habits.',
  },
  {
    title: 'Fully Equipped Strength & Cardio Floor',
    description:
      'Train on hand-picked commercial machines, heavy free weights, squat racks, and conditioning gear.',
  },
];

export const EQUIPMENT_LIST = [
  { name: 'Smith Machines', category: 'Strength' },
  { name: 'Squat Racks', category: 'Power' },
  { name: 'Dumbbells', category: 'Free Weights' },
  { name: 'Cable Stations', category: 'Hypertrophy' },
  { name: 'Chest Press', category: 'Upper Body' },
  { name: 'Lat Pulldowns', category: 'Back' },
  { name: 'Rows', category: 'Back' },
  { name: 'Leg Press', category: 'Lower Body' },
  { name: 'Glute Equipment', category: 'Lower Body' },
  { name: 'Treadmills', category: 'Cardio' },
  { name: 'StairMasters', category: 'Conditioning' },
];

export const MEMBERSHIP_FAQS = [
  {
    q: 'How do I join JS FITNESS INC?',
    a: 'Start by booking your free in-person gym tour. You will walk the facility, review available spots in the current membership phase, and choose the right path forward in person.',
  },
  {
    q: 'Why are gym membership prices not listed online?',
    a: 'We onboard members in limited phases (Founders Membership, Second Release, Final Release) to protect gym floor quality and community standards. Book your free gym tour to see the facility and lock in your spot in person.',
  },
  {
    q: 'Is the gym genuinely open 24/7?',
    a: 'Yes. Members receive 24/7 access all year round. Personal training and strategy assessments operate by appointment only.',
  },
  {
    q: 'What is included with every membership?',
    a: '24/7 facility access, our member fitness app with instructional exercise videos, workout & progressive overload logging, our WhatsApp fitness community, and the Daily 3 Non-Negotiables framework.',
  },
  {
    q: 'What is the difference between a Free Gym Tour and the Strategy Assessment?',
    a: 'The Free Gym Tour lets you explore the facility and discuss membership in person. The Strategy Assessment ($99.99 CAD, 1–2 hours in person) is a deep-dive diagnostic session covering your body composition, biomechanics, lifestyle, and custom transformation roadmap.',
  },
];

export const SYSTEM_PILLARS = [
  {
    id: 'nutrition',
    number: '01',
    title: 'Nutrition Google Sheets',
    subtitle: 'Precision Macronutrients & Sustainable Meal Structure',
    description:
      'Custom calorie targets, protein goals, flexible meal swaps, and real-time adherence tracking inside structured Google Sheets built around your schedule and food preferences.',
  },
  {
    id: 'training',
    number: '02',
    title: 'Training App',
    subtitle: 'Periodized Programs with Form Video Demos',
    description:
      'Every set, rep, tempo, rest period, and progressive overload milestone organized inside your training app so every minute on the floor counts.',
  },
  {
    id: 'lifestyle',
    number: '03',
    title: 'Lifestyle Tracking',
    subtitle: 'Sleep, Steps, Stress & Hydration Habits',
    description:
      'Transformations happen in the 23 hours outside the gym. Track daily step targets, sleep quality, stress management, and the Daily 3 Non-Negotiables.',
  },
  {
    id: 'bodycomp',
    number: '04',
    title: 'Body Composition',
    subtitle: 'Objective Measurements & Visual Progress',
    description:
      'Go beyond scale fluctuations with consistent waist/circumference measurements, progress photo benchmarks, and strength-to-weight ratios.',
  },
  {
    id: 'checkins',
    number: '05',
    title: 'Weekly Check-ins',
    subtitle: 'Data-Driven Coaching Adjustments',
    description:
      'Every week Jatinder reviews your training logs, nutrition adherence, biofeedback, and recovery metrics to calibrate macros and training intensity.',
  },
  {
    id: 'resources',
    number: '06',
    title: 'Additional Resources',
    subtitle: 'Education, Guides & Community Accountability',
    description:
      'Access grocery guides, dining-out strategies, mobility protocols, and direct support so you build knowledge you keep for life.',
  },
];

export const STRATEGY_ASSESSMENT_AGENDA = [
  'Comprehensive Health, Injury & Training History Review',
  'Goal Clarification & Realistic Transformation Timeline Mapping',
  'Baseline Body Composition & Measurement Benchmark',
  'Movement Screen & Posture / Mobility Evaluation',
  'Current Nutrition Audit & Daily Caloric Demand Estimate',
  'Lifestyle, Sleep, Stress & Schedule Feasibility Analysis',
  'Live Coaching Floor Walkthrough & Technique Assessment',
  'Custom 12-to-16 Week Transformation Roadmap Presentation',
  'Membership / Coaching Fit Recommendation & Q&A',
];

export const STRATEGY_CREDIT_CARDS = [
  {
    title: 'Coaching Credit',
    description:
      'If you enroll in 1-on-1 or semi-private coaching following your assessment, your $99.99 CAD assessment fee is credited directly toward your coaching package.',
  },
  {
    title: 'Membership Credit',
    description:
      'Decide to start with an open gym membership phase? Apply your $99.99 CAD fee directly as credit toward your membership enrollment in person.',
  },
  {
    title: 'Personalized Roadmap Either Way',
    description:
      'Even if you choose not to enroll right away, you walk away with your complete custom transformation roadmap, macro targets, and training priorities.',
  },
];

export const COACHING_PHILOSOPHY = [
  {
    title: 'Training',
    description:
      'Intentional, progressive strength training built around biomechanics, execution quality, and measurable overload—never random workouts.',
  },
  {
    title: 'Nutrition',
    description:
      'Evidence-based fueling tailored to your culture, work hours, and tastes. No crash diets—just sustainable structure that delivers results.',
  },
  {
    title: 'Lifestyle',
    description:
      'Sleep quality, step counts, hydration, and stress control form the foundation that allows your body to recover and transform.',
  },
  {
    title: 'Education',
    description:
      'You will learn the why behind every macro adjustment and exercise choice so your results stay permanent long after your first goal.',
  },
  {
    title: 'Accountability',
    description:
      'Weekly check-ins, clear non-negotiables, and honest coaching feedback keep you moving forward even on your hardest weeks.',
  },
  {
    title: 'Environment',
    description:
      'A focused, high-standard Calgary NE facility surrounded by driven people who take training, health, and discipline seriously.',
  },
];

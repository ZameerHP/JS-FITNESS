import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  Bell,
  Calendar,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Inbox,
  Layers,
  LogOut,
  MessageSquareQuote,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
  Video,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import { adminFetch, uploadAdminImage } from './adminApi';
import { useSiteContent } from '../context/ContentContext';
import { PhaseStatus, PricingPhase } from '../config/siteConfig';
import { JSLogo } from '../components/ui/JSLogo';
import {
  CertificationItem,
  GalleryItem,
  TestimonialItem,
  TransformationItem,
  VideoItem,
} from '../lib/api';

interface AdminUser {
  id: string;
  email: string;
  totpEnabled: boolean;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface OverviewData {
  settings: Record<string, any>;
  transformations: TransformationItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  certifications: CertificationItem[];
  contacts: ContactSubmission[];
}

type AdminTab =
  | 'phases'
  | 'availability'
  | 'booking'
  | 'transformations'
  | 'gallery'
  | 'videos'
  | 'testimonials'
  | 'certifications'
  | 'announcements'
  | 'settings'
  | 'inbox'
  | 'security';

const TAB_ITEMS: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
  { id: 'phases', label: 'Pricing Phases', icon: <Layers className="w-4 h-4" /> },
  { id: 'availability', label: 'Availability', icon: <Users className="w-4 h-4" /> },
  { id: 'booking', label: 'Booking Links', icon: <Calendar className="w-4 h-4" /> },
  { id: 'transformations', label: 'Transformations', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'gallery', label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'videos', label: 'Videos & Tour', icon: <Video className="w-4 h-4" /> },
  { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote className="w-4 h-4" /> },
  { id: 'certifications', label: 'Certifications', icon: <Award className="w-4 h-4" /> },
  { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
  { id: 'settings', label: 'Site Settings', icon: <Settings className="w-4 h-4" /> },
  { id: 'inbox', label: 'Contact Inbox', icon: <Inbox className="w-4 h-4" /> },
  { id: 'security', label: 'Security / 2FA', icon: <Shield className="w-4 h-4" /> },
];

export const AdminLayout: React.FC = () => {
  const { refreshContent } = useSiteContent();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('phases');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [toast, setToast] = useState('');

  // Login state
  const [email, setEmail] = useState('admin@jsfitness.ca');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 2FA setup state
  const [totpSetup, setTotpSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [verify2faCode, setVerify2faCode] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  // Form states for list entities
  const [newTransform, setNewTransform] = useState({
    name: '',
    timeframe: '16 Weeks',
    category: 'Fat Loss & Muscle',
    story: '',
    beforeImage: '',
    afterImage: '',
    isDemo: false,
    visible: true,
  });
  const [newGallery, setNewGallery] = useState({ title: '', imageUrl: '', category: 'Facility' });
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    isWalkthrough: false,
    visible: true,
  });
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: 'JS FITNESS Member',
    quote: '',
    rating: 5,
    visible: true,
  });
  const [newCert, setNewCert] = useState({
    title: '',
    issuer: '',
    year: '2026',
    visible: true,
  });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const loadOverview = useCallback(async () => {
    const data = await adminFetch<OverviewData>('/api/admin/overview');
    setOverview(data);
  }, []);

  useEffect(() => {
    adminFetch<{ user: AdminUser }>('/api/auth/me')
      .then((res) => {
        setUser(res.user);
        return loadOverview();
      })
      .catch(() => setUser(null))
      .finally(() => setCheckingAuth(false));
  }, [loadOverview]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminFetch<{ requires2FA?: boolean; user?: AdminUser }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password, totpCode: needs2FA ? totpCode : undefined }),
        }
      );
      if (res.requires2FA) {
        setNeeds2FA(true);
        return;
      }
      if (res.user) {
        setUser(res.user);
        await loadOverview();
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = async () => {
    await adminFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOverview(null);
  };

  const saveSetting = async (key: string, value: unknown) => {
    await adminFetch('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
    await Promise.all([loadOverview(), refreshContent()]);
    notify('Saved and published to live site.');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#B6F500]">
        Loading Admin...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-[28px] glass-panel-lime p-8 shadow-lime">
          <div className="mb-6 flex justify-center">
            <JSLogo size="md" />
          </div>
          <h1 className="font-display italic font-black text-3xl uppercase text-center text-white mb-2">
            OWNER ADMIN PORTAL
          </h1>
          <p className="text-center text-xs text-[#8C8C8C] mb-6">
            Sign in to manage phases, transformations, booking URLs, and inquiries.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-white/75 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:border-[#B6F500] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/75 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:border-[#B6F500] focus:outline-none"
              />
            </div>

            {needs2FA && (
              <div>
                <label className="block text-xs font-bold uppercase text-[#B6F500] mb-1.5">
                  2FA Authenticator Code
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full rounded-xl border border-[#B6F500] bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>
            )}

            {loginError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-[#B6F500] text-[#050505] font-extrabold text-xs uppercase tracking-wider hover:bg-[#c8ff29] transition-colors"
            >
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  const settings = overview?.settings || {};

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#B6F500]/20 bg-[#050505]/90 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <JSLogo size="sm" />
          <span className="rounded-full bg-[#B6F500]/15 border border-[#B6F500]/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#B6F500]">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a href="/" className="text-[#C9C9C9] hover:text-[#B6F500]">
            View Live Site →
          </a>
          <span className="hidden sm:inline text-[#8C8C8C]">{user.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 hover:border-[#B6F500] hover:text-[#B6F500]"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#B6F500] px-5 py-2.5 text-xs font-extrabold uppercase text-[#050505] shadow-lime">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-[1380px] px-5 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <aside className="lg:col-span-3 space-y-1.5">
          {TAB_ITEMS.map((tab) => {
            const unreadCount =
              tab.id === 'inbox'
                ? (overview?.contacts || []).filter((c) => !c.read).length
                : 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#B6F500] text-[#050505]'
                    : 'bg-[#0B0B0C] text-[#C9C9C9] border border-white/[0.06] hover:border-[#B6F500]/40'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {tab.icon}
                  {tab.label}
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Tab Workspace */}
        <main className="lg:col-span-9 rounded-[24px] glass-panel border-white/10 p-6 sm:p-8">
          {/* 1. PRICING PHASES */}
          {activeTab === 'phases' && overview && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display italic font-black text-3xl uppercase">
                  Membership Pricing Phases
                </h2>
                <p className="text-xs text-[#8C8C8C] mt-1">
                  Control status per tier (Upcoming, Active, Sold out). Gym prices remain private
                  and are never displayed online.
                </p>
              </div>

              <div className="space-y-4">
                {(settings.pricingPhases as PricingPhase[]).map((phase, idx) => (
                  <div
                    key={phase.tier}
                    className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    <div className="md:col-span-4">
                      <div className="text-xs font-bold text-[#B6F500]">{phase.tier}</div>
                      <input
                        type="text"
                        value={phase.title}
                        onChange={(e) => {
                          const next = [...settings.pricingPhases];
                          next[idx] = { ...phase, title: e.target.value };
                          setOverview({ ...overview, settings: { ...settings, pricingPhases: next } });
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-[10px] uppercase text-[#8C8C8C]">Subtitle</label>
                      <input
                        type="text"
                        value={phase.subtitle}
                        onChange={(e) => {
                          const next = [...settings.pricingPhases];
                          next[idx] = { ...phase, subtitle: e.target.value };
                          setOverview({ ...overview, settings: { ...settings, pricingPhases: next } });
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] uppercase text-[#8C8C8C]">Status</label>
                      <select
                        value={phase.status}
                        onChange={(e) => {
                          const next = [...settings.pricingPhases];
                          next[idx] = { ...phase, status: e.target.value as PhaseStatus };
                          setOverview({ ...overview, settings: { ...settings, pricingPhases: next } });
                        }}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Active">Active</option>
                        <option value="Sold out">Sold out (FILLED)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => saveSetting('pricingPhases', settings.pricingPhases)}
                className="rounded-full bg-[#B6F500] px-6 py-2.5 text-xs font-extrabold uppercase text-[#050505]"
              >
                Save Pricing Phases
              </button>
            </div>
          )}

          {/* 2. MEMBERSHIP AVAILABILITY */}
          {activeTab === 'availability' && overview && (
            <div className="space-y-5 max-w-lg">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Membership Availability
              </h2>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(settings.membershipAvailability?.open)}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        membershipAvailability: {
                          ...settings.membershipAvailability,
                          open: e.target.checked,
                        },
                      },
                    })
                  }
                  className="h-4 w-4 accent-[#B6F500]"
                />
                Enrollment Open
              </label>

              <div>
                <label className="block text-xs uppercase text-[#8C8C8C] mb-1">
                  Spots Remaining
                </label>
                <input
                  type="number"
                  value={settings.membershipAvailability?.spotsRemaining ?? 0}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        membershipAvailability: {
                          ...settings.membershipAvailability,
                          spotsRemaining: Number(e.target.value),
                        },
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#8C8C8C] mb-1">
                  Active Phase Micro-Badge Label
                </label>
                <input
                  type="text"
                  value={settings.membershipAvailability?.label || 'LIMITED SPOTS'}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        membershipAvailability: {
                          ...settings.membershipAvailability,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-2.5 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  saveSetting('membershipAvailability', settings.membershipAvailability)
                }
                className="rounded-full bg-[#B6F500] px-6 py-2.5 text-xs font-extrabold uppercase text-[#050505]"
              >
                Save Availability
              </button>
            </div>
          )}

          {/* 3. BOOKING LINKS */}
          {activeTab === 'booking' && overview && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Calendly Booking Links
              </h2>
              <p className="text-xs text-[#8C8C8C]">
                Leave empty to gracefully route booking buttons to the Contact page form.
              </p>

              <div>
                <label className="block text-xs uppercase text-[#8C8C8C] mb-1">
                  Free Gym Tour Calendly URL (CALENDLY_TOUR_URL)
                </label>
                <input
                  type="url"
                  placeholder="https://calendly.com/your-handle/free-gym-tour"
                  value={settings.booking?.calendlyTourUrl || ''}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        booking: { ...settings.booking, calendlyTourUrl: e.target.value },
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#8C8C8C] mb-1">
                  Strategy Assessment Calendly URL ($99.99 CAD) (CALENDLY_ASSESSMENT_URL)
                </label>
                <input
                  type="url"
                  placeholder="https://calendly.com/your-handle/strategy-assessment"
                  value={settings.booking?.calendlyAssessmentUrl || ''}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        booking: { ...settings.booking, calendlyAssessmentUrl: e.target.value },
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-2.5 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => saveSetting('booking', settings.booking)}
                className="rounded-full bg-[#B6F500] px-6 py-2.5 text-xs font-extrabold uppercase text-[#050505]"
              >
                Save Booking Links
              </button>
            </div>
          )}

          {/* 4. TRANSFORMATIONS */}
          {activeTab === 'transformations' && overview && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display italic font-black text-3xl uppercase">
                  Client Transformations
                </h2>
                <p className="text-xs text-[#8C8C8C]">
                  Hiding all transformations hides the Client Transformations section on the Home
                  page. Demo entries are tagged DEMO.
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 space-y-4">
                <div className="text-xs font-bold uppercase text-[#B6F500]">
                  Add New Transformation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    placeholder="Client Name"
                    value={newTransform.name}
                    onChange={(e) => setNewTransform({ ...newTransform, name: e.target.value })}
                    className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Timeframe (e.g. 16 Weeks)"
                    value={newTransform.timeframe}
                    onChange={(e) =>
                      setNewTransform({ ...newTransform, timeframe: e.target.value })
                    }
                    className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Category"
                    value={newTransform.category}
                    onChange={(e) =>
                      setNewTransform({ ...newTransform, category: e.target.value })
                    }
                    className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  placeholder="Client story / highlights"
                  value={newTransform.story}
                  onChange={(e) => setNewTransform({ ...newTransform, story: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#8C8C8C] mb-1">
                      Before Image (Upload or URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        placeholder="/images/..."
                        value={newTransform.beforeImage}
                        onChange={(e) =>
                          setNewTransform({ ...newTransform, beforeImage: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-white/15 bg-black px-3 py-2 text-xs"
                      />
                      <label className="cursor-pointer rounded-xl border border-[#B6F500]/50 px-3 py-2 text-xs text-[#B6F500] hover:bg-[#B6F500] hover:text-black flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const res = await uploadAdminImage(f);
                            setNewTransform((p) => ({ ...p, beforeImage: res.url }));
                            notify('Before image converted to WebP/AVIF.');
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8C8C8C] mb-1">
                      After Image (Upload or URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        placeholder="/images/..."
                        value={newTransform.afterImage}
                        onChange={(e) =>
                          setNewTransform({ ...newTransform, afterImage: e.target.value })
                        }
                        className="flex-1 rounded-xl border border-white/15 bg-black px-3 py-2 text-xs"
                      />
                      <label className="cursor-pointer rounded-xl border border-[#B6F500]/50 px-3 py-2 text-xs text-[#B6F500] hover:bg-[#B6F500] hover:text-black flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const res = await uploadAdminImage(f);
                            setNewTransform((p) => ({ ...p, afterImage: res.url }));
                            notify('After image converted to WebP/AVIF.');
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await adminFetch('/api/admin/transformations', {
                      method: 'POST',
                      body: JSON.stringify(newTransform),
                    });
                    setNewTransform({
                      name: '',
                      timeframe: '16 Weeks',
                      category: 'Fat Loss & Muscle',
                      story: '',
                      beforeImage: '',
                      afterImage: '',
                      isDemo: false,
                      visible: true,
                    });
                    await Promise.all([loadOverview(), refreshContent()]);
                    notify('Transformation added.');
                  }}
                  className="rounded-full bg-[#B6F500] px-6 py-2 text-xs font-extrabold uppercase text-[#050505]"
                >
                  Add Transformation
                </button>
              </div>

              <div className="space-y-3">
                {overview.transformations.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#0B0B0C] border border-white/10 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.beforeImage}
                        alt=""
                        className="h-14 w-12 rounded-lg object-cover"
                      />
                      <img
                        src={item.afterImage}
                        alt=""
                        className="h-14 w-12 rounded-lg object-cover border border-[#B6F500]/50"
                      />
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          {item.name}
                          {item.isDemo && (
                            <span className="rounded bg-[#B6F500]/20 px-1.5 py-0.5 text-[10px] text-[#B6F500]">
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#8C8C8C]">
                          {item.timeframe} • {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await adminFetch('/api/admin/transformations', {
                            method: 'POST',
                            body: JSON.stringify({ ...item, visible: !item.visible }),
                          });
                          await Promise.all([loadOverview(), refreshContent()]);
                          notify('Visibility updated.');
                        }}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                          item.visible
                            ? 'bg-[#B6F500]/15 text-[#B6F500]'
                            : 'bg-white/10 text-white/50'
                        }`}
                      >
                        {item.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {item.visible ? 'Visible' : 'Hidden'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await adminFetch(`/api/admin/transformations/${item.id}`, {
                            method: 'DELETE',
                          });
                          await Promise.all([loadOverview(), refreshContent()]);
                          notify('Deleted.');
                        }}
                        className="rounded-full p-2 text-red-400 hover:bg-red-500/15"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. GALLERY */}
          {activeTab === 'gallery' && overview && (
            <div className="space-y-6">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Facility Gallery (WebP / AVIF)
              </h2>
              <div className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 flex flex-wrap gap-3 items-center">
                <input
                  placeholder="Photo Title"
                  value={newGallery.title}
                  onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                  className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm flex-1 min-w-[160px]"
                />
                <input
                  placeholder="Image URL (or upload)"
                  value={newGallery.imageUrl}
                  onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
                  className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm flex-1 min-w-[160px]"
                />
                <label className="cursor-pointer rounded-xl border border-[#B6F500]/50 px-3 py-2 text-xs text-[#B6F500]">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const res = await uploadAdminImage(f);
                      setNewGallery((p) => ({ ...p, imageUrl: res.url }));
                      notify('Uploaded & optimized to WebP/AVIF.');
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newGallery.title || !newGallery.imageUrl) return;
                    await adminFetch('/api/admin/gallery', {
                      method: 'POST',
                      body: JSON.stringify({
                        ...newGallery,
                        order: overview.gallery.length,
                      }),
                    });
                    setNewGallery({ title: '', imageUrl: '', category: 'Facility' });
                    await Promise.all([loadOverview(), refreshContent()]);
                    notify('Gallery item added.');
                  }}
                  className="rounded-full bg-[#B6F500] px-5 py-2 text-xs font-extrabold uppercase text-[#050505]"
                >
                  Add Photo
                </button>
              </div>

              <div className="space-y-2.5">
                {overview.gallery.map((g, idx) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-xl bg-[#0B0B0C] border border-white/10 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={g.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      <div>
                        <div className="text-sm font-bold">{g.title}</div>
                        <div className="text-xs text-[#8C8C8C]">{g.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={async () => {
                          const ids = overview.gallery.map((x) => x.id);
                          [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                          await adminFetch('/api/admin/gallery/reorder', {
                            method: 'PUT',
                            body: JSON.stringify({ ids }),
                          });
                          await Promise.all([loadOverview(), refreshContent()]);
                        }}
                        className="p-1.5 rounded bg-white/5 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === overview.gallery.length - 1}
                        onClick={async () => {
                          const ids = overview.gallery.map((x) => x.id);
                          [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
                          await adminFetch('/api/admin/gallery/reorder', {
                            method: 'PUT',
                            body: JSON.stringify({ ids }),
                          });
                          await Promise.all([loadOverview(), refreshContent()]);
                        }}
                        className="p-1.5 rounded bg-white/5 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await adminFetch(`/api/admin/gallery/${g.id}`, { method: 'DELETE' });
                          await Promise.all([loadOverview(), refreshContent()]);
                        }}
                        className="p-1.5 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. VIDEOS */}
          {activeTab === 'videos' && overview && (
            <div className="space-y-6">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Videos &amp; Gym Walkthrough
              </h2>
              <div className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 space-y-3">
                <input
                  placeholder="Video Title"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <input
                  placeholder="YouTube URL or MP4 URL"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-xs text-[#C9C9C9]">
                  <input
                    type="checkbox"
                    checked={newVideo.isWalkthrough}
                    onChange={(e) =>
                      setNewVideo({ ...newVideo, isWalkthrough: e.target.checked })
                    }
                    className="accent-[#B6F500]"
                  />
                  Use as Primary &ldquo;WATCH OUR GYM&rdquo; Hero Modal Video
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newVideo.title || !newVideo.url) return;
                    await adminFetch('/api/admin/videos', {
                      method: 'POST',
                      body: JSON.stringify(newVideo),
                    });
                    setNewVideo({ title: '', url: '', isWalkthrough: false, visible: true });
                    await Promise.all([loadOverview(), refreshContent()]);
                    notify('Video saved.');
                  }}
                  className="rounded-full bg-[#B6F500] px-6 py-2 text-xs font-extrabold uppercase text-[#050505]"
                >
                  Add Video
                </button>
              </div>
              <div className="space-y-2.5">
                {overview.videos.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-xl bg-[#0B0B0C] border border-white/10 p-4"
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {v.title}
                        {v.isWalkthrough && (
                          <span className="rounded bg-[#B6F500]/20 px-2 py-0.5 text-[10px] text-[#B6F500]">
                            HERO WALKTHROUGH
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#8C8C8C]">{v.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await adminFetch(`/api/admin/videos/${v.id}`, { method: 'DELETE' });
                        await Promise.all([loadOverview(), refreshContent()]);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. TESTIMONIALS */}
          {activeTab === 'testimonials' && overview && (
            <div className="space-y-6">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Client Testimonials
              </h2>
              <div className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Member Name"
                    value={newTestimonial.name}
                    onChange={(e) =>
                      setNewTestimonial({ ...newTestimonial, name: e.target.value })
                    }
                    className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Role / Program"
                    value={newTestimonial.role}
                    onChange={(e) =>
                      setNewTestimonial({ ...newTestimonial, role: e.target.value })
                    }
                    className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  placeholder="Testimonial quote..."
                  value={newTestimonial.quote}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, quote: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newTestimonial.name || !newTestimonial.quote) return;
                    await adminFetch('/api/admin/testimonials', {
                      method: 'POST',
                      body: JSON.stringify(newTestimonial),
                    });
                    setNewTestimonial({
                      name: '',
                      role: 'JS FITNESS Member',
                      quote: '',
                      rating: 5,
                      visible: true,
                    });
                    await Promise.all([loadOverview(), refreshContent()]);
                    notify('Testimonial added.');
                  }}
                  className="rounded-full bg-[#B6F500] px-6 py-2 text-xs font-extrabold uppercase text-[#050505]"
                >
                  Add Testimonial
                </button>
              </div>
              <div className="space-y-2.5">
                {overview.testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-[#0B0B0C] border border-white/10 p-4"
                  >
                    <div>
                      <div className="font-bold text-sm">
                        {t.name} <span className="text-xs text-[#8C8C8C]">({t.role})</span>
                      </div>
                      <p className="text-xs text-[#C9C9C9] mt-1">{t.quote}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await adminFetch(`/api/admin/testimonials/${t.id}`, {
                          method: 'DELETE',
                        });
                        await Promise.all([loadOverview(), refreshContent()]);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. CERTIFICATIONS */}
          {activeTab === 'certifications' && overview && (
            <div className="space-y-6">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Founder Certifications
              </h2>
              <div className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  placeholder="Certification Title"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <input
                  placeholder="Issuing Body"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <input
                  placeholder="Year"
                  value={newCert.year}
                  onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                  className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCert.title || !newCert.issuer) return;
                    await adminFetch('/api/admin/certifications', {
                      method: 'POST',
                      body: JSON.stringify(newCert),
                    });
                    setNewCert({ title: '', issuer: '', year: '2026', visible: true });
                    await Promise.all([loadOverview(), refreshContent()]);
                    notify('Certification saved.');
                  }}
                  className="sm:col-span-3 w-fit rounded-full bg-[#B6F500] px-6 py-2 text-xs font-extrabold uppercase text-[#050505]"
                >
                  Add Certification
                </button>
              </div>
              <div className="space-y-2.5">
                {overview.certifications.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl bg-[#0B0B0C] border border-white/10 p-4"
                  >
                    <div>
                      <div className="font-bold text-sm">{c.title}</div>
                      <div className="text-xs text-[#8C8C8C]">
                        {c.issuer} • {c.year}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await adminFetch(`/api/admin/certifications/${c.id}`, {
                          method: 'DELETE',
                        });
                        await Promise.all([loadOverview(), refreshContent()]);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. ANNOUNCEMENTS */}
          {activeTab === 'announcements' && overview && (
            <div className="space-y-5 max-w-xl">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Top Announcement Bar
              </h2>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(settings.announcement?.enabled)}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        announcement: { ...settings.announcement, enabled: e.target.checked },
                      },
                    })
                  }
                  className="h-4 w-4 accent-[#B6F500]"
                />
                Show Announcement Bar across site
              </label>
              <div>
                <label className="block text-xs uppercase text-[#8C8C8C] mb-1">Banner Text</label>
                <input
                  type="text"
                  value={settings.announcement?.text || ''}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        announcement: { ...settings.announcement, text: e.target.value },
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-[#8C8C8C] mb-1">Target Link</label>
                <input
                  type="text"
                  value={settings.announcement?.link || '/membership'}
                  onChange={(e) =>
                    setOverview({
                      ...overview,
                      settings: {
                        ...settings,
                        announcement: { ...settings.announcement, link: e.target.value },
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-2.5 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => saveSetting('announcement', settings.announcement)}
                className="rounded-full bg-[#B6F500] px-6 py-2.5 text-xs font-extrabold uppercase text-[#050505]"
              >
                Save Announcement
              </button>
            </div>
          )}

          {/* 10. SITE SETTINGS */}
          {activeTab === 'settings' && overview && (
            <div className="space-y-6">
              <h2 className="font-display italic font-black text-3xl uppercase">
                Site Settings &amp; Contact Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-[#8C8C8C] mb-1">Address</label>
                  <input
                    value={settings.contact?.address || ''}
                    onChange={(e) =>
                      setOverview({
                        ...overview,
                        settings: {
                          ...settings,
                          contact: { ...settings.contact, address: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-[#8C8C8C] mb-1">Phone</label>
                  <input
                    value={settings.contact?.phone || ''}
                    onChange={(e) =>
                      setOverview({
                        ...overview,
                        settings: {
                          ...settings,
                          contact: { ...settings.contact, phone: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-[#8C8C8C] mb-1">Email</label>
                  <input
                    value={settings.contact?.email || ''}
                    onChange={(e) =>
                      setOverview({
                        ...overview,
                        settings: {
                          ...settings,
                          contact: { ...settings.contact, email: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-[#8C8C8C] mb-1">
                    WhatsApp URL
                  </label>
                  <input
                    value={settings.contact?.whatsappUrl || ''}
                    onChange={(e) =>
                      setOverview({
                        ...overview,
                        settings: {
                          ...settings,
                          contact: { ...settings.contact, whatsappUrl: e.target.value },
                        },
                      })
                    }
                    className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await saveSetting('contact', settings.contact);
                  await saveSetting('hours', settings.hours);
                  await saveSetting('socials', settings.socials);
                  await saveSetting('seo', settings.seo);
                }}
                className="rounded-full bg-[#B6F500] px-6 py-2.5 text-xs font-extrabold uppercase text-[#050505]"
              >
                Save All Site Settings
              </button>
            </div>
          )}

          {/* 11. CONTACT INBOX */}
          {activeTab === 'inbox' && overview && (
            <div className="space-y-4">
              <h2 className="font-display italic font-black text-3xl uppercase">Contact Inbox</h2>
              {overview.contacts.length === 0 ? (
                <p className="text-sm text-[#8C8C8C]">No contact submissions yet.</p>
              ) : (
                overview.contacts.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-2xl p-5 border ${
                      c.read
                        ? 'bg-[#0B0B0C] border-white/10'
                        : 'bg-[#B6F500]/[0.05] border-[#B6F500]/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="ml-2 text-xs text-[#B6F500]">{c.interest}</span>
                        <div className="text-xs text-[#8C8C8C]">
                          {c.email} • {c.phone || 'No phone'} •{' '}
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await adminFetch(`/api/admin/contacts/${c.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ read: !c.read }),
                            });
                            await loadOverview();
                          }}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs"
                        >
                          {c.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await adminFetch(`/api/admin/contacts/${c.id}`, { method: 'DELETE' });
                            await loadOverview();
                          }}
                          className="text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-[#C9C9C9] whitespace-pre-wrap">{c.message}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 12. SECURITY & 2FA */}
          {activeTab === 'security' && (
            <div className="space-y-8 max-w-lg">
              <div>
                <h2 className="font-display italic font-black text-3xl uppercase">
                  Security &amp; Optional TOTP 2FA
                </h2>
                <p className="text-xs text-[#8C8C8C] mt-1">
                  2FA Status: {user.totpEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              {!user.totpEnabled ? (
                <div className="space-y-3 rounded-2xl bg-[#0B0B0C] border border-white/10 p-5">
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await adminFetch<{ secret: string; otpauthUrl: string }>(
                        '/api/auth/2fa/setup',
                        { method: 'POST' }
                      );
                      setTotpSetup(res);
                    }}
                    className="rounded-full border border-[#B6F500] px-5 py-2 text-xs font-bold uppercase text-[#B6F500]"
                  >
                    Generate 2FA Secret
                  </button>

                  {totpSetup && (
                    <div className="space-y-2 text-xs">
                      <p className="text-[#C9C9C9]">
                        Add this secret key to Google Authenticator / 1Password:
                      </p>
                      <code className="block rounded bg-black p-2 text-[#B6F500] break-all">
                        {totpSetup.secret}
                      </code>
                      <div className="flex gap-2">
                        <input
                          placeholder="Enter 6-digit code"
                          value={verify2faCode}
                          onChange={(e) => setVerify2faCode(e.target.value)}
                          className="rounded-xl border border-white/15 bg-black px-3 py-2 text-sm flex-1"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await adminFetch('/api/auth/2fa/verify', {
                              method: 'POST',
                              body: JSON.stringify({ code: verify2faCode }),
                            });
                            setUser({ ...user, totpEnabled: true });
                            setTotpSetup(null);
                            notify('2FA Enabled!');
                          }}
                          className="rounded-full bg-[#B6F500] px-5 py-2 text-xs font-extrabold text-black"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await adminFetch('/api/auth/2fa/disable', { method: 'POST' });
                    setUser({ ...user, totpEnabled: false });
                    notify('2FA Disabled.');
                  }}
                  className="rounded-full border border-red-400 px-5 py-2 text-xs font-bold text-red-400"
                >
                  Disable 2FA
                </button>
              )}

              <div className="rounded-2xl bg-[#0B0B0C] border border-white/10 p-5 space-y-3">
                <div className="text-xs font-bold uppercase text-[#B6F500]">Update Password</div>
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/15 bg-black px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await adminFetch('/api/auth/password', {
                      method: 'POST',
                      body: JSON.stringify(passwordForm),
                    });
                    setPasswordForm({ currentPassword: '', newPassword: '' });
                    notify('Password updated.');
                  }}
                  className="rounded-full bg-[#B6F500] px-6 py-2 text-xs font-extrabold uppercase text-[#050505]"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

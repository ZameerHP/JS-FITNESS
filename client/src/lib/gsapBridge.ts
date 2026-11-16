import type gsapModule from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export type GsapModule = {
  gsap: typeof gsapModule;
  ScrollTrigger: typeof ScrollTriggerType;
};

let cachedGsap: GsapModule | null = null;
let loadingPromise: Promise<GsapModule> | null = null;

export function loadGsap(): Promise<GsapModule> {
  if (cachedGsap) return Promise.resolve(cachedGsap);
  if (!loadingPromise) {
    loadingPromise = import('./gsap').then((m) => {
      cachedGsap = m;
      return m;
    });
  }
  return loadingPromise;
}

export function getLoadedGsap(): GsapModule | null {
  return cachedGsap;
}

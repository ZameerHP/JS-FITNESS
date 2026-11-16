import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({
  ignoreMobileResize: true,
  limitCallbacks: true,
});

if (typeof window !== 'undefined') {
  (window as Window & { __scrollTriggerRefresh?: () => void }).__scrollTriggerRefresh = () =>
    ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };

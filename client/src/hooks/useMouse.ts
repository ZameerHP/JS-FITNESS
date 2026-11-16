import { useEffect, useRef, useState } from 'react';

export interface MouseState {
  x: number;
  y: number;
  normX: number; // -1 to 1
  normY: number; // -1 to 1
}

export function useMouse() {
  const [mouse, setMouse] = useState<MouseState>({ x: 0, y: 0, normX: 0, normY: 0 });
  const targetRef = useRef<MouseState>({ x: 0, y: 0, normX: 0, normY: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      const next = { x: e.clientX, y: e.clientY, normX, normY };
      targetRef.current = next;
      setMouse(next);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return { mouse, targetRef };
}

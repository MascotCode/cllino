import { useEffect, useRef, useState } from 'react';

export type Phase = 'search' | 'show';

export function useStaggerReveal<T>(items: T[], searchMs: number, staggerMs: number) {
  const [phase, setPhase] = useState<Phase>('search');
  const [visible, setVisible] = useState<T[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setPhase('search');
    setVisible([]);

    let mounted = true;

    const startReveal = () => {
      if (!mounted) {
        return;
      }
      setPhase('show');
      let index = 0;
      const revealNext = () => {
        if (!mounted) {
          return;
        }
        setVisible((prev) => {
          const nextItem = items[index];
          if (nextItem === undefined) {
            return prev;
          }
          index += 1;
          return prev.concat(nextItem);
        });
        if (index < items.length) {
          const timer = setTimeout(revealNext, staggerMs);
          timersRef.current.push(timer);
        }
      };
      revealNext();
    };

    const timer = setTimeout(startReveal, searchMs);
    timersRef.current.push(timer);

    return () => {
      mounted = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [items, searchMs, staggerMs]);

  return { phase, visible };
}

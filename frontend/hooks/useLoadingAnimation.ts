import { useEffect, useRef, useState } from "react";

const ITEMS_PER_SECOND_BASE = 3;

export function useLoadingAnimation(totalCount: number) {
  const [visibleCount, setVisibleCount] = useState(totalCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);

  useEffect(() => {
    setVisibleCount(totalCount);
  }, [totalCount]);

  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const tick = (time: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      accumulatorRef.current += dt * ITEMS_PER_SECOND_BASE * speed;

      if (accumulatorRef.current >= 1) {
        const step = Math.floor(accumulatorRef.current);
        accumulatorRef.current -= step;
        setVisibleCount((prev) => {
          const next = Math.min(totalCount, prev + step);
          if (next >= totalCount) setIsPlaying(false);
          return next;
        });
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, speed, totalCount]);

  const play = () => {
    if (visibleCount >= totalCount) setVisibleCount(0);
    setIsPlaying(true);
  };
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setVisibleCount(0);
  };

  return { visibleCount, isPlaying, play, pause, reset, speed, setSpeed };
}

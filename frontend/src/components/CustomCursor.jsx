import React, { useEffect, useRef } from 'react';

export function CustomCursor() {
  const haloRef = useRef(null);
  const dotRef = useRef(null);
  const frameRef = useRef(null);
  const pointerRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const root = haloRef.current?.parentElement;
    const pointer = pointerRef.current;
    let active = false;
    let hovering = false;
    let pressing = false;

    const setVisibility = (visible) => {
      active = visible;
      if (root) root.style.opacity = visible ? '1' : '0';
    };

    const updateInteractiveState = (target) => {
      const nextHover = Boolean(target.closest('button, a, input, select, textarea, [role="button"], .magnetic-btn'));
      if (nextHover === hovering) return;
      hovering = nextHover;
      if (haloRef.current) haloRef.current.dataset.hovering = String(hovering);
      if (dotRef.current) dotRef.current.dataset.hovering = String(hovering);
    };

    const handleMove = (event) => {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      updateInteractiveState(event.target);
      setVisibility(true);
    };

    const handleDown = () => {
      pressing = true;
      if (haloRef.current) haloRef.current.dataset.pressing = 'true';
    };

    const handleUp = () => {
      pressing = false;
      if (haloRef.current) haloRef.current.dataset.pressing = 'false';
    };

    const handleLeave = () => setVisibility(false);
    const handleEnter = () => setVisibility(true);

    const animate = () => {
      pointer.x += (pointer.targetX - pointer.x) * 0.2;
      pointer.y += (pointer.targetY - pointer.y) * 0.2;
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%) scale(${pressing ? 0.82 : 1})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pointer.targetX}px, ${pointer.targetY}px, 0) translate(-50%, -50%)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);
    setVisibility(false);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="custom-cursor pointer-events-none fixed inset-0 z-[9999] opacity-0" aria-hidden="true">
      <span ref={haloRef} className="custom-cursor-halo" />
      <span ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}

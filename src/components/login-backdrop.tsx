"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; lit: number };

const GREEN = "62, 207, 142";
const NODE_COUNT = 46;
const LINK_DISTANCE = 130;
const SWEEP_SECONDS = 5;

// Animated radar sweep over a drifting node network, drawn on a canvas so the
// sign-in brand panel needs no video asset. Static under reduced motion.
export default function LoginBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    let last = performance.now();
    let angle = -Math.PI / 2;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0) {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          lit: 0,
        }));
      }
      if (reduced) draw(0);
    };

    const draw = (dt: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.46;
      ctx.clearRect(0, 0, width, height);

      // Nodes drift and wrap around the panel edges.
      for (const n of nodes) {
        n.x = (n.x + n.vx * dt + width) % width;
        n.y = (n.y + n.vy * dt + height) % height;
        n.lit = Math.max(0, n.lit - dt * 0.45);
      }

      // Links between nearby nodes.
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > LINK_DISTANCE) continue;
          const fade = 1 - d / LINK_DISTANCE;
          const glow = Math.max(a.lit, b.lit);
          ctx.strokeStyle = glow
            ? `rgba(${GREEN}, ${fade * (0.08 + glow * 0.4)})`
            : `rgba(255, 255, 255, ${fade * 0.07})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Concentric radar rings and crosshair.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
      for (const r of [0.5, 0.75, 1]) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Rotating sweep with a trailing conic glow.
      const prev = angle;
      angle += (dt / SWEEP_SECONDS) * Math.PI * 2;
      const trail = ctx.createConicGradient(angle - Math.PI / 2, cx, cy);
      trail.addColorStop(0.75, `rgba(${GREEN}, 0)`);
      trail.addColorStop(1, `rgba(${GREEN}, 0.16)`);
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${GREEN}, 0.55)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();

      // Nodes light up when the sweep passes over them.
      const tau = Math.PI * 2;
      const span = (((angle - prev) % tau) + tau) % tau;
      for (const n of nodes) {
        const dx = n.x - cx;
        const dy = n.y - cy;
        if (Math.hypot(dx, dy) > radius) continue;
        const offset = (((Math.atan2(dy, dx) - prev) % tau) + tau) % tau;
        if (offset <= span) n.lit = 1;
      }
      for (const n of nodes) {
        if (n.lit > 0) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14);
          halo.addColorStop(0, `rgba(${GREEN}, ${n.lit * 0.5})`);
          halo.addColorStop(1, `rgba(${GREEN}, 0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = n.lit
          ? `rgba(${GREEN}, ${0.35 + n.lit * 0.65})`
          : "rgba(255, 255, 255, 0.28)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.lit ? 2.2 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(dt);
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (!reduced) frame = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return <canvas ref={canvasRef} className="admin-login-canvas" />;
}

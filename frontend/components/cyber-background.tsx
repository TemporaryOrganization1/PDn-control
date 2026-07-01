"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let scanLineY = 0;
    let scanDirection = 1;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = Math.min(
        60,
        Math.floor((canvas.width * canvas.height) / 20000)
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3 - 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 264 : 290,
      }));
    };

    resize();
    initParticles();

    const drawGrid = () => {
      const spacing = 48;
      ctx.strokeStyle = "oklch(0.6 0.18 264 / 0.04)";
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawParticles = () => {
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.6 0.18 ${p.hue} / ${p.opacity})`;
        ctx.fill();
      }
    };

    const drawScanLine = () => {
      const gradient = ctx.createLinearGradient(
        0,
        scanLineY - 60,
        0,
        scanLineY + 60
      );
      gradient.addColorStop(0, "oklch(0.6 0.18 264 / 0)");
      gradient.addColorStop(0.5, "oklch(0.6 0.18 264 / 0.08)");
      gradient.addColorStop(1, "oklch(0.6 0.18 264 / 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanLineY - 60, canvas.width, 120);

      ctx.strokeStyle = "oklch(0.6 0.18 264 / 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(canvas.width, scanLineY);
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid();
      drawParticles();
      drawScanLine();

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += (Math.random() - 0.5) * 0.02;
        p.opacity = Math.max(0.05, Math.min(0.8, p.opacity));

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      scanLineY += scanDirection * 0.8;
      if (scanLineY > canvas.height || scanLineY < 0) {
        scanDirection *= -1;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

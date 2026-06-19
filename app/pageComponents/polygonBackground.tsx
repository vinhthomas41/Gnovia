"use client";
import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function PolygonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const POINT_COUNT = 80;
    const CONNECTION_DIST = 160;
    const SPEED = 0.25;

    const BASE_COLOR = { r: 100, g: 130, b: 200 };

    let width = 0;
    let height = 0;
    let points: Point[] = [];
    let animId: number;

    function resize() {
      width = canvas!.offsetWidth;
      height = canvas!.offsetHeight;
      canvas!.width = width * devicePixelRatio;
      canvas!.height = height * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }

    function initPoints() {
      points = Array.from({ length: POINT_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.35;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(q.x, q.y);
            ctx!.strokeStyle = `rgba(${BASE_COLOR.r},${BASE_COLOR.g},${BASE_COLOR.b},${alpha})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();

            for (let k = j + 1; k < points.length; k++) {
              const r = points[k];
              const dx2 = p.x - r.x;
              const dy2 = p.y - r.y;
              const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
              const dx3 = q.x - r.x;
              const dy3 = q.y - r.y;
              const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);

              if (dist2 < CONNECTION_DIST * 0.75 && dist3 < CONNECTION_DIST * 0.75) {
                const triAlpha =
                  (1 - dist / CONNECTION_DIST) *
                  (1 - dist2 / (CONNECTION_DIST * 0.75)) *
                  (1 - dist3 / (CONNECTION_DIST * 0.75)) *
                  0.06;

                ctx!.beginPath();
                ctx!.moveTo(p.x, p.y);
                ctx!.lineTo(q.x, q.y);
                ctx!.lineTo(r.x, r.y);
                ctx!.closePath();
                ctx!.fillStyle = `rgba(${BASE_COLOR.r},${BASE_COLOR.g},${BASE_COLOR.b},${triAlpha})`;
                ctx!.fill();
              }
            }
          }
        }

        const dotAlpha = 0.5;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${BASE_COLOR.r},${BASE_COLOR.g},${BASE_COLOR.b},${dotAlpha})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);

    resize();
    initPoints();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulseOffset: number;
}

interface GlowOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  phase: number;
}

interface NeonLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  speed: number;
  color: string;
  opacity: number;
  width: number;
}

const PARTICLE_COLORS = ['#00d4ff', '#00b8e6', '#4dd9ff', '#ffd700', '#00e676', '#80d4ff'];
const ORB_COLORS = [
  'rgba(0,212,255,0.08)',
  'rgba(0,180,230,0.06)',
  'rgba(0,230,118,0.05)',
  'rgba(255,215,0,0.04)',
  'rgba(64,196,255,0.07)',
];
const LINE_COLORS = ['#00d4ff', '#00e676', '#ffd700', '#4dd9ff'];

function createParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: Math.random() * 2.2 + 0.6,
    opacity: Math.random() * 0.55 + 0.15,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]!,
    pulseOffset: Math.random() * Math.PI * 2,
  }));
}

function createOrbs(count: number, w: number, h: number): GlowOrb[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    radius: Math.random() * 180 + 80,
    color: ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)]!,
    opacity: Math.random() * 0.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
  }));
}

function createNeonLines(count: number, w: number, h: number): NeonLine[] {
  return Array.from({ length: count }, () => {
    const horizontal = Math.random() > 0.5;
    const pos = Math.random() * (horizontal ? h : w);
    return {
      x1: horizontal ? 0 : pos,
      y1: horizontal ? pos : 0,
      x2: horizontal ? w : pos,
      y2: horizontal ? pos : h,
      progress: Math.random(),
      speed: Math.random() * 0.0008 + 0.0003,
      color: LINE_COLORS[Math.floor(Math.random() * LINE_COLORS.length)]!,
      opacity: Math.random() * 0.12 + 0.04,
      width: Math.random() * 1.2 + 0.3,
    };
  });
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const isMobile = w < 600;
    const particleCount = isMobile ? 35 : 70;
    const orbCount = isMobile ? 4 : 7;
    const lineCount = isMobile ? 4 : 8;

    let particles = createParticles(particleCount, w, h);
    let orbs = createOrbs(orbCount, w, h);
    let neonLines = createNeonLines(lineCount, w, h);

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      particles = createParticles(particleCount, w, h);
      orbs = createOrbs(orbCount, w, h);
      neonLines = createNeonLines(lineCount, w, h);
    };
    window.addEventListener('resize', onResize);

    const GRID_SIZE = isMobile ? 60 : 80;

    function drawGrid(t: number) {
      const shift = (t * 0.4) % GRID_SIZE;
      ctx!.save();
      ctx!.strokeStyle = 'rgba(0,212,255,0.04)';
      ctx!.lineWidth = 0.5;
      for (let x = -GRID_SIZE + shift; x < w + GRID_SIZE; x += GRID_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = -GRID_SIZE + shift * 0.6; y < h + GRID_SIZE; y += GRID_SIZE) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawOrbs(t: number) {
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        const pulse = 0.85 + Math.sin(t * 0.0008 + orb.phase) * 0.15;
        const gradient = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * pulse);
        gradient.addColorStop(0, orb.color.replace(')', `, ${orb.opacity})`).replace('rgba', 'rgba'));
        gradient.addColorStop(0.4, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(orb.x, orb.y, orb.radius * pulse, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawParticles(t: number) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const pulseFactor = 0.7 + Math.sin(t * 0.002 + p.pulseOffset) * 0.3;
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        glow.addColorStop(0, p.color + 'cc');
        glow.addColorStop(0.4, p.color + '55');
        glow.addColorStop(1, 'transparent');
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.opacity * pulseFactor;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }

      ctx!.strokeStyle = 'rgba(0,212,255,0.06)';
      ctx!.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i]!;
          const pj = particles[j]!;
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.globalAlpha = (1 - dist / 100) * 0.25;
            ctx!.beginPath();
            ctx!.moveTo(pi.x, pi.y);
            ctx!.lineTo(pj.x, pj.y);
            ctx!.stroke();
          }
        }
      }
      ctx!.globalAlpha = 1;
    }

    function drawNeonLines(_t: number) {
      for (const line of neonLines) {
        line.progress = (line.progress + line.speed) % 1;
        const segLen = 0.3;
        const head = line.progress;
        const tail = Math.max(0, head - segLen);
        const lx = line.x2 - line.x1;
        const ly = line.y2 - line.y1;
        const sx = line.x1 + lx * tail;
        const sy = line.y1 + ly * tail;
        const ex = line.x1 + lx * head;
        const ey = line.y1 + ly * head;

        const grad = ctx!.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, line.color + Math.round(line.opacity * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(1, line.color + 'ff');
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = line.width;
        ctx!.shadowColor = line.color;
        ctx!.shadowBlur = 6;
        ctx!.beginPath();
        ctx!.moveTo(sx, sy);
        ctx!.lineTo(ex, ey);
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      }
    }

    function drawWaves(t: number) {
      for (let i = 0; i < 3; i++) {
        ctx!.save();
        ctx!.globalAlpha = 0.025 - i * 0.007;
        ctx!.strokeStyle = i === 0 ? '#00d4ff' : i === 1 ? '#00e676' : '#ffd700';
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = h * 0.5
            + Math.sin(x * 0.008 + t * 0.0012 + i * 1.2) * 60
            + Math.sin(x * 0.004 + t * 0.0008 + i * 0.8) * 40;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
        ctx!.restore();
      }
    }

    function drawCornerAccents(_t?: number) {
      const accents = [
        { x: 0, y: 0, angle: 0 },
        { x: w, y: 0, angle: Math.PI / 2 },
        { x: w, y: h, angle: Math.PI },
        { x: 0, y: h, angle: -Math.PI / 2 },
      ];
      for (const accent of accents) {
        ctx!.save();
        ctx!.translate(accent.x, accent.y);
        ctx!.rotate(accent.angle);
        ctx!.strokeStyle = 'rgba(0,212,255,0.2)';
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(60, 0);
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(0, 60);
        ctx!.stroke();
        ctx!.restore();
      }
    }

    function animate(timestamp: number) {
      timeRef.current = timestamp;
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = '#070e18';
      ctx!.fillRect(0, 0, w, h);

      drawGrid(timestamp);
      drawOrbs(timestamp);
      drawWaves(timestamp);
      drawNeonLines(timestamp);
      drawParticles(timestamp);
      drawCornerAccents();

      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 50% at 20% 20%, rgba(0,100,180,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,180,140,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,0,0,0.15) 0%, transparent 70%)
          `,
        }}
      />
    </Box>
  );
}

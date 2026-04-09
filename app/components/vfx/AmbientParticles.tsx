'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';
import { useVfxStore } from '../../store/vfxStore';

const particleOptions: ISourceOptions = {
  fullScreen: { enable: true, zIndex: 0 },
  fpsLimit: 60,
  particles: {
    number: { value: 40, density: { enable: true } },
    color: { value: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#a855f7'] },
    opacity: {
      value: { min: 0.1, max: 0.35 },
      animation: { enable: true, speed: 0.4, startValue: 'random', sync: false },
    },
    size: {
      value: { min: 1, max: 3 },
      animation: { enable: true, speed: 1, startValue: 'random', sync: false },
    },
    move: {
      enable: true,
      speed: { min: 0.2, max: 0.6 },
      direction: 'none' as const,
      random: true,
      straight: false,
      outModes: { default: 'out' as const },
    },
    links: {
      enable: true,
      distance: 120,
      color: '#6366f1',
      opacity: 0.1,
      width: 1,
    },
    shape: { type: 'circle' },
  },
  detectRetina: true,
};

export default function AmbientParticles() {
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  const options = useMemo(() => particleOptions, []);

  if (!vfxEnabled || !engineReady) return null;

  return (
    <Particles
      id="jflow-ambient-particles"
      options={options}
    />
  );
}

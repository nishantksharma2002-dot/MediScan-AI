import React from 'react';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-[var(--bg-main)] transition-colors duration-500" />
      
      {/* Floating Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] animate-bounce-slow" />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-blueTest text-white min-h-screen font-mono h-screen flex flex-col">
      <nav className="border-b border-white/20 px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-widest uppercase">GenshinDB</h1>
      </nav>
      <div className="grid grid-cols-3 border-b border-white/20 flex-3">
        <div className="col-span-2 border-r border-white/20 p-8">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Database</p>
          <h2 className="text-5xl font-black leading-tight mb-4">The Complete Genshin Impact Character Index</h2>
          <p className="text-white/60 text-sm max-w-lg">Stats, talents, and material requirements for every character</p>
        </div>
        <div className="p-8 flex flex-col justify-between">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">Quick Access</p>
          <Link href="/characters" className="mt-auto border border-white/20 p-4 hover:bg-white/10 transition-colors">
            <p className="text-xs text-white/50 uppercase mb-1">Browse</p>
            <p className="text-lg font-bold">Characters →</p>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/20  flex-1">
        {["Characters", "Placeholder", "Materials"].map((item) => (
          <div key={item} className="p-6 hover:bg-white/5 transition-colors cursor-pointer">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Feature</p>
            <p className="font-bold">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
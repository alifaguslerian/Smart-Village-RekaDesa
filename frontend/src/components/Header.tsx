import React from 'react';
import { Landmark, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeSection?: string;
  villageName?: string;
}

export const Header: React.FC<HeaderProps> = ({ villageName = 'Desa Suka Maju' }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fdfcf8]/95 backdrop-blur-md border-t-[3px] border-t-teal-800 border-b border-b-stone-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Stempel */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-800 text-[#fdfcf8] flex items-center justify-center shadow-xs border border-teal-900">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-xl tracking-tight text-stone-900">RekaDesa</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-300">
                  <ShieldCheck className="w-3 h-3 mr-1 text-teal-700" />
                  SPK Deterministik
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Prioritas & Alokasi Anggaran Pembangunan Desa • <span className="text-stone-700 font-medium">{villageName}</span>
              </p>
            </div>
          </div>

          {/* Navigation Steps (Clickable Anchor Rail) */}
          <nav className="hidden md:flex xl:hidden items-center space-x-1 text-xs font-medium text-stone-600">
            <button
              onClick={() => scrollTo('section-profile')}
              className="px-3 py-1.5 rounded-md hover:bg-stone-200/60 hover:text-stone-900 transition-colors"
            >
                <span className="text-teal-800 font-bold mr-1">1.</span> Profil
            </button>
            <button
              onClick={() => scrollTo('section-simulator')}
              className="px-3 py-1.5 rounded-md hover:bg-stone-200/60 hover:text-stone-900 transition-colors"
            >
                <span className="text-teal-800 font-bold mr-1">2.</span> Simulasi
            </button>
            <button
              onClick={() => scrollTo('section-why')}
              className="px-3 py-1.5 rounded-md hover:bg-stone-200/60 hover:text-stone-900 transition-colors"
            >
                <span className="text-teal-800 font-bold mr-1">3.</span> Perhitungan
            </button>
            <button
              onClick={() => scrollTo('section-presets')}
              className="px-3 py-1.5 rounded-md hover:bg-stone-200/60 hover:text-stone-900 transition-colors"
            >
                <span className="text-teal-800 font-bold mr-1">4.</span> Perbandingan
            </button>
          </nav>

          {/* Action Link to Public View */}
          <div className="flex items-center space-x-3">
            <Link
              to="/public/1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3.5 py-1.5 rounded-md text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 shadow-2xs transition-all hover:border-stone-400 group"
              title="Buka portal transparansi publik warga (route /public/:id)"
            >
              <span>Portal Warga</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-stone-500 group-hover:text-teal-700 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

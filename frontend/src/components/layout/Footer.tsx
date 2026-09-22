import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#5a6857] text-slate-200 text-xs pt-8 pb-28 md:pb-8 border-t border-[#485645]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-[#6c7d69]">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span>Vidya-Vrtti Portal</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              Single Digital Window for End-to-End Management of MoTA Scholarships & Fellowships for ST Students.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-2">MoTA Schemes</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-200">
              <li className="hover:text-amber-200 transition-colors cursor-pointer">National Fellowship for ST Students (NFST)</li>
              <li className="hover:text-amber-200 transition-colors cursor-pointer">National Overseas Scholarship (NOS)</li>
              <li className="hover:text-amber-200 transition-colors cursor-pointer">Top Class Education Scheme (TCES)</li>
              <li className="hover:text-amber-200 transition-colors cursor-pointer">Pre-Matric & Post-Matric ST Schemes</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-2">Quick Links</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-200">
              <li>
                <a href="https://tribal.nic.in/ScholarshiP.aspx" target="_blank" rel="noreferrer" className="hover:text-amber-200 transition-colors underline">
                  MoTA Official Website
                </a>
              </li>
              <li>
                <a href="https://dbttribal.gov.in/AllScheme.aspx" target="_blank" rel="noreferrer" className="hover:text-amber-200 transition-colors underline">
                  DBT Tribal Portal
                </a>
              </li>
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-200 transition-colors underline">
                  National Scholarship Portal (NSP)
                </a>
              </li>
              <li>
                <a href="https://www.digilocker.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-200 transition-colors underline">
                  DigiLocker Integration
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-2">Helpline & Support</h4>
            <p className="text-[11px] text-slate-100 font-medium">Toll-Free Helpline: 1800-11-7788</p>
            <p className="text-[11px] text-slate-100 font-medium mt-1">Email: support-stsetu@mota.gov.in</p>
            <p className="text-[11px] text-amber-200/90 mt-2 font-medium">Ministry of Tribal Affairs, Shastri Bhawan, New Delhi</p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-100 gap-2">
          <p className="text-slate-100 font-semibold tracking-wide text-center sm:text-left">
            © 2026 Ministry of Tribal Affairs, Government of India.
          </p>
          <p className="flex items-center text-amber-200 font-bold mt-1 sm:mt-0 text-center sm:text-right">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-400 mx-1.5 fill-rose-500 shrink-0" /> by Null Exploiters
          </p>
        </div>
      </div>
    </footer>
  );
};

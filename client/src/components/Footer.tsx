import React from 'react';
import { Activity, Shield, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-teal-500 p-2 rounded-xl text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">HealthBridge Diagnostics</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Your Complete Diagnostic Journey, Connected." Connecting patients, laboratories, radiologists, and physicians across India.
            </p>
          </div>

          <div>
            <h5 className="text-white text-sm font-semibold mb-3">Quick Navigation</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="/tests" className="hover:text-teal-400 transition-colors">Find Diagnostic Tests</a></li>
              <li><a href="/tests?category=packages" className="hover:text-teal-400 transition-colors">Preventive Health Checkups</a></li>
              <li><a href="/labs" className="hover:text-teal-400 transition-colors">Partner Laboratories</a></li>
              <li><a href="/journey/HB-2026-000123" className="hover:text-teal-400 transition-colors">Live Journey Tracker</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white text-sm font-semibold mb-3">Security & Compliance</h5>
            <div className="space-y-2 text-xs">
              <p className="flex items-center space-x-1 text-slate-300">
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Indian DPDP Act & HIPAA Principles</span>
              </p>
              <p className="text-slate-400">
                Medical reports are protected via short-lived authenticated streams. Raw card details are never stored.
              </p>
            </div>
          </div>

          <div>
            <h5 className="text-white text-sm font-semibold mb-3">Contact & Support</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
                <span>1800-200-HEALTH (India Toll-Free)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>support@healthbridge.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Mumbai • Delhi • Bengaluru • Hyderabad</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 HealthBridge Diagnostics Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-slate-400 italic">
            Disclaimer: Diagnostic information is provided for informational purposes and does not replace professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
};

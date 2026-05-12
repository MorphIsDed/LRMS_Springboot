import React from 'react';
import { usePrivacyShield } from '../hooks/usePrivacyShield';
import { ShieldAlert } from 'lucide-react';

export const PrivacyOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isObscured = usePrivacyShield(30000); // 30 seconds of inactivity

  return (
    <div className="relative w-full h-full min-h-screen">
      <div
        className={`transition-all duration-700 ease-in-out w-full h-full ${
          isObscured ? 'blur-md grayscale-[50%] opacity-40 pointer-events-none select-none' : 'blur-0 opacity-100'
        }`}
      >
        {children}
      </div>

      {isObscured && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm">
          <div className="bg-white/80 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
               <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Privacy Shield Active</h2>
            <p className="text-gray-500 mt-2 text-center max-w-sm leading-relaxed">
              Session secured due to inactivity or backgrounding. <br/>
              <span className="font-medium text-gray-700 mt-2 inline-block">Move your mouse or press any key to resume.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, SignalHigh } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface PhoneSimulatorFrameProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const PhoneSimulatorFrame: React.FC<PhoneSimulatorFrameProps> = ({
  children,
  enabled,
}) => {
  const [timeStr, setTimeStr] = useState('12:45');
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!enabled) {
    return (
      <div className={`min-h-screen w-full transition-colors duration-200 ${
        isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#07090E] text-slate-100'
      }`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-4 px-2 flex items-center justify-center transition-colors duration-200 ${
      isLight ? 'bg-slate-200/90' : 'bg-neutral-950'
    }`}>
      {/* Outer Phone Hardware Chassis */}
      <div className={`relative w-full max-w-[430px] h-[890px] max-h-[96vh] rounded-[48px] p-[10px] shadow-2xl transition-all duration-200 border-[3px] flex flex-col overflow-hidden ${
        isLight
          ? 'bg-slate-300 border-slate-400/80 shadow-slate-400/30'
          : 'bg-[#121624] border-slate-700/80 shadow-amber-500/10'
      }`}>
        {/* Antenna band accents */}
        <div className={`absolute top-24 -left-1 w-1 h-6 rounded-r ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`} />
        <div className={`absolute top-36 -left-1 w-1 h-12 rounded-r ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`} />
        <div className={`absolute top-28 -right-1 w-1 h-10 rounded-l ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`} />

        {/* Inner Phone Display Bezel */}
        <div className={`relative w-full h-full rounded-[38px] overflow-hidden flex flex-col transition-colors duration-200 border ${
          isLight
            ? 'bg-[#F8FAFC] border-slate-300 shadow-inner'
            : 'bg-[#090D16] border-slate-800/80'
        }`}>
          {/* Android Status Bar */}
          <div className={`h-7 px-6 flex items-center justify-between text-xs shrink-0 z-30 select-none transition-colors ${
            isLight
              ? 'bg-white text-slate-700 border-b border-slate-200/80'
              : 'bg-[#0A0E1A] text-slate-300'
          }`}>
            <span className="font-semibold text-[11px] tabular-nums tracking-wide">{timeStr}</span>
            {/* Center Camera Punch Hole */}
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
              isLight ? 'bg-black border-slate-300' : 'bg-black border-slate-800'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
            {/* Status Icons */}
            <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <span className={`text-[9px] font-bold tracking-tighter ${isLight ? 'text-amber-600' : 'text-amber-400/90'}`}>5G</span>
              <SignalHigh className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Phone Screen Scrollable Area */}
          <div className={`flex-1 overflow-y-auto relative flex flex-col ${
            isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#07090E] text-slate-100'
          }`}>
            {children}
          </div>

          {/* Android Bottom Gesture Bar */}
          <div className={`h-5 flex items-center justify-center shrink-0 z-40 select-none transition-colors ${
            isLight ? 'bg-white border-t border-slate-200/80' : 'bg-[#0A0E1A]'
          }`}>
            <div className={`w-32 h-1 rounded-full ${isLight ? 'bg-slate-400' : 'bg-slate-600/80'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const Pomodoro: React.FC = () => {
  const { t } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  
  // Refs for drift-proof timing
  const endTimeRef = useRef<number | null>(null);

  const toggleTimer = () => {
    if (!isActive) {
      // Request notification permission on first interaction
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
      
      // Set end time relative to current timeLeft
      endTimeRef.current = Date.now() + timeLeft * 1000;
    } else {
      endTimeRef.current = null;
    }
    setIsActive(!isActive);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    endTimeRef.current = null;
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    endTimeRef.current = null;
  }, [mode]);

  // Web Audio API Beep
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Sound configuration (Pleasant electronic chime)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Slide to A4
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Handle Timer Logic (Drift-proof)
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        if (!endTimeRef.current) return;
        
        const now = Date.now();
        const diff = Math.ceil((endTimeRef.current - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          endTimeRef.current = null;
          handleTimerComplete();
        } else {
          setTimeLeft(diff);
        }
      }, 200); // Check more frequently than 1s for better UI responsiveness

      return () => clearInterval(interval);
    }
  }, [isActive]);

  const handleTimerComplete = () => {
    // 1. Play Sound (Web Audio API - No external assets)
    playNotificationSound();

    // 2. Send Browser Notification
    if ("Notification" in window) {
       // Determine text based on mode that JUST finished
       const titleKey = mode === 'focus' ? 'pomo_done_focus_title' : 'pomo_done_break_title';
       const bodyKey = mode === 'focus' ? 'pomo_done_focus_msg' : 'pomo_done_break_msg';
       
       const title = t(titleKey);
       const body = t(bodyKey);

       if (Notification.permission === "granted") {
         new Notification(title, { 
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3209/3209978.png'
         });
       } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(title, { body });
            }
          });
       }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine current status message key
  const getStatusMessage = () => {
    if (isActive) {
      return mode === 'focus' ? 'pomo_status_focus_active' : 'pomo_status_break_active';
    }
    return mode === 'focus' ? 'pomo_status_focus_idle' : 'pomo_status_break_idle';
  };

  return (
    <div className={`
      relative overflow-hidden
      rounded-2xl p-8 shadow-lg transition-all duration-500
      ${mode === 'focus' ? 'bg-primary text-white shadow-primary/30' : 'bg-secondary text-white shadow-secondary/30'}
    `}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        {mode === 'focus' ? <Zap size={100} /> : <Coffee size={100} />}
      </div>

      {/* Header / Mode Switcher */}
      <div className="relative z-10 flex justify-center gap-2 mb-8 bg-black/10 p-1 rounded-xl w-fit mx-auto backdrop-blur-sm">
        <button
          onClick={() => switchMode('focus')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            mode === 'focus' ? 'bg-white text-primary shadow-sm' : 'text-white/70 hover:text-white'
          }`}
        >
          {t('pomo_focus')}
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            mode === 'break' ? 'bg-white text-secondary shadow-sm' : 'text-white/70 hover:text-white'
          }`}
        >
          {t('pomo_break')}
        </button>
      </div>

      {/* Timer Display */}
      <div className="relative z-10 text-center mb-8">
        <div className="text-7xl md:text-8xl font-bold tracking-tight font-mono tabular-nums">
          {formatTime(timeLeft)}
        </div>
        <p className="mt-2 text-white/80 font-light text-sm">
          {t(getStatusMessage())}
        </p>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-6">
        <button
          onClick={toggleTimer}
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          {isActive ? (
            <Pause size={28} className={mode === 'focus' ? 'text-primary fill-primary' : 'text-secondary fill-secondary'} />
          ) : (
            <Play size={28} className={`ml-1 ${mode === 'focus' ? 'text-primary fill-primary' : 'text-secondary fill-secondary'}`} />
          )}
        </button>
        
        <button
          onClick={resetTimer}
          className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all text-white backdrop-blur-sm"
          title="Reset Timer"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pomodoro;
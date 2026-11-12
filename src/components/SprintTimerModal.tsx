import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SprintTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSprintCompleted: (conceptTitle: string, minutes: number, category: string) => void;
  activeTracks?: string[];
}

export const SprintTimerModal: React.FC<SprintTimerModalProps> = ({
  isOpen,
  onClose,
  onSprintCompleted,
  activeTracks = ['DSA', 'Python', 'AI/ML', 'Django', 'SQL'],
}) => {
  const [targetMinutes, setTargetMinutes] = useState(15);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isActive, setIsActive] = useState(true);
  const [conceptTitle, setConceptTitle] = useState(`${activeTracks[0] || 'Engineering'}: Focus Sprint`);
  const [category, setCategory] = useState(activeTracks[0] || 'DSA');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reset timer when opened
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(targetMinutes * 60);
      setIsActive(true);
    }
  }, [isOpen, targetMinutes]);

  // Tick down
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      handleFinish(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isActive, secondsRemaining]);

  if (!isOpen) return null;

  const totalSeconds = targetMinutes * 60;
  const elapsedSeconds = totalSeconds - secondsRemaining;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Rich 4-tone harmonic focus completion chime (C-major ascending bell)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();

      const tones = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.9);
      });
    } catch {
      // AudioContext policy fallback
    }
  };

  const handleFinish = (isAuto: boolean = false) => {
    const loggedMinutes = isAuto ? targetMinutes : Math.max(5, Math.ceil(elapsedSeconds / 60));
    playChime();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f5a0', '#10b981', '#34d399', '#ffffff']
    });

    onSprintCompleted(conceptTitle, loggedMinutes, category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131821] border border-[#2a3240] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222a36] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f5a0] animate-ping" />
            <h3 className="text-[1.125rem] font-semibold">Live Focus Sprint</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-2 py-1 rounded-md border text-[0.6875rem] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-[#00f5a0]/10 border-[#00f5a0]/30 text-[#00f5a0]'
                  : 'bg-[#181f2a] border-[#2a3240] text-slate-400'
              }`}
              title={soundEnabled ? 'Chime sound on' : 'Chime muted'}
            >
              <span className="material-symbols-outlined text-[14px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span>{soundEnabled ? 'Chime' : 'Muted'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#181f2a] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Focus Target Title */}
        <div className="space-y-1">
          <label className="text-[0.6875rem] uppercase font-mono text-slate-400 tracking-wider">
            Active Study Target
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={conceptTitle}
              onChange={e => setConceptTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-white text-[0.875rem] focus:border-[#00f5a0]/60 focus:outline-none"
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0e141b] border border-[#222a36] text-[#00f5a0] text-[0.8125rem] font-mono focus:outline-none"
            >
              {activeTracks.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Digital Clock Display */}
        <div className="my-2 p-6 rounded-xl bg-[#0b0d11] border border-[#222a36] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#00f5a0]/[0.02] pointer-events-none" />

          {/* Time text */}
          <div className="text-[3.5rem] font-bold font-mono text-[#00f5a0] tracking-tight leading-none drop-shadow-[0_0_20px_rgba(0,245,160,0.3)]">
            {formatTime(secondsRemaining)}
          </div>

          <span className="text-[0.75rem] text-slate-400 font-mono mt-2">
            {isActive ? '⚡ Sprint in progress • Deep Focus' : 'Paused'}
          </span>

          {/* Progress Bar inside box */}
          <div className="w-full h-1.5 rounded-full bg-[#181f2a] mt-4 overflow-hidden">
            <div
              className="h-full bg-[#00f5a0] transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(0,245,160,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Duration selector presets */}
        <div className="flex items-center justify-between text-[0.75rem] font-mono text-slate-400">
          <span>Set Sprint:</span>
          <div className="flex items-center gap-1.5">
            {[10, 15, 25, 30].map(m => (
              <button
                key={m}
                onClick={() => {
                  setTargetMinutes(m);
                  setSecondsRemaining(m * 60);
                }}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  targetMinutes === m
                    ? 'bg-[#00f5a0] text-black font-bold'
                    : 'bg-[#181f2a] text-slate-300 hover:bg-[#222a36]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#181f2a] hover:bg-[#222a36] border border-[#2a3240] text-white text-[0.875rem] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isActive ? 'pause' : 'play_arrow'}
            </span>
            <span>{isActive ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={() => handleFinish(false)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#00f5a0] text-black text-[0.875rem] font-bold shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Finish & Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

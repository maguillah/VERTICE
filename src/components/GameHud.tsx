import React from 'react';
import { Volume2, VolumeX, Pause } from 'lucide-react';
import { HudSnapshot, ResonanceState } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onSelectState: (state: ResonanceState) => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  muted,
  onToggleMute,
  onPause,
  onSelectState,
}) => {
  const states: Array<{ id: ResonanceState; keyNum: string; label: string; unlocked: boolean }> = [
    { id: 'PRESENTE', keyNum: '1', label: 'Presente', unlocked: true },
    { id: 'ECO', keyNum: '2', label: 'Eco', unlocked: hud.unlockedEcho },
    { id: 'RUPTURA', keyNum: '3', label: 'Ruptura', unlocked: hud.unlockedRuptura },
  ];

  const showAnchorCounter = hud.puzzleTotal > 0 && (hud.chapterNumber >= 2 || hud.areaId === 4);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C96A6]">
            <span className="text-[#E59838] font-medium">{hud.chapterTitle}</span>
            <span aria-hidden="true">·</span>
            <span>{hud.areaSubtitle}</span>
            <span aria-hidden="true">·</span>
            <span className="font-display text-sm text-[#E6EAF0] tracking-wide">
              {hud.areaTitle}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            {states.map((st) => {
              if (!st.unlocked) return null;
              const active = hud.resonanceState === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectState(st.id)}
                  className={`flex items-center gap-1.5 min-h-[36px] px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? st.id === 'PRESENTE'
                        ? 'bg-[#1D222B]/90 border-[#9AA6B8] text-[#F1F5F9]'
                        : 'bg-[#2C1F12]/90 border-[#E59838] text-[#FFD08A]'
                      : 'bg-[#0A0C10]/75 border-[#252B36] text-[#848E9E] hover:text-[#D5DCE6]'
                  }`}
                >
                  <span className="font-mono-tabular text-[11px] opacity-70">{st.keyNum}</span>
                  <span className="font-medium">{st.label}</span>
                </button>
              );
            })}
          </div>

          {(hud.unlockedEcho || hud.unlockedRuptura) && (
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9BA4B4]">
              {hud.unlockedRuptura && (
                <div className="flex items-center gap-2">
                  <span>Estabilidade</span>
                  <div className="w-24 h-1.5 bg-[#161A22] rounded-sm overflow-hidden border border-[#282F3B]">
                    <div
                      className="h-full bg-[#E59838] transition-[width] duration-100"
                      style={{ width: `${Math.round(hud.rupturaEnergy * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {hud.unlockedEcho && (
                <>
                  {hud.unlockedRuptura && <span aria-hidden="true">·</span>}
                  <span className="font-mono-tabular text-[#D5DCE6]">
                    Memórias {hud.memoriesFound}/{hud.memoriesTotal}
                  </span>
                </>
              )}
              {showAnchorCounter && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular text-[#E59838]">
                    Âncoras {hud.puzzleCount}/{hud.puzzleTotal}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="flex items-center justify-center w-11 h-11 rounded border border-[#262C37] bg-[#0B0D12]/80 text-[#B8C0CC] hover:border-[#E59838] hover:text-[#FFD08A] transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onPause}
            aria-label="Pausar jogo"
            className="flex items-center gap-2 min-h-[44px] px-3.5 rounded border border-[#262C37] bg-[#0B0D12]/80 text-xs font-medium text-[#D2D8E2] hover:border-[#E59838] hover:text-[#FFD08A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pausa</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 mb-6">
        {hud.resonanceNotice && (
          <div className="px-4 py-1.5 bg-[#1B0E0A]/90 border border-[#FF7B42]/60 rounded text-xs tracking-wide text-[#FFC4A8] font-medium text-center">
            {hud.resonanceNotice}
          </div>
        )}
        {hud.bannerNotice && (
          <div className="px-4 py-1.5 bg-[#090B0E]/85 border border-[#E59838]/40 rounded text-xs tracking-[0.18em] text-[#FFD79A] font-medium text-center">
            {hud.bannerNotice}
          </div>
        )}
        {hud.nearbyPrompt && (
          <div className="px-4 py-2 bg-[#0B0D12]/90 border border-[#E59838]/60 rounded text-xs sm:text-sm text-[#F4E6CE] tracking-wide">
            {hud.nearbyPrompt}
          </div>
        )}
      </div>
    </div>
  );
};

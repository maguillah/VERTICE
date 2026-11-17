import React from 'react';
import { X } from 'lucide-react';
import { GameSettings, QualityLevel, TouchMode } from '../game/types';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdate: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdate,
  onClose,
}) => {
  const qualities: Array<{ id: QualityLevel; label: string }> = [
    { id: 'low', label: 'Baixa (OPPO A5 · 30 FPS)' },
    { id: 'medium', label: 'Média (Equilibrada)' },
    { id: 'high', label: 'Alta (60 FPS)' },
  ];

  const touchModes: Array<{ id: TouchMode; label: string }> = [
    { id: 'auto', label: 'Automático' },
    { id: 'always', label: 'Sempre Visível' },
    { id: 'hidden', label: 'Oculto' },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#040507]/85 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#282E3A] bg-[#0B0D12] p-6 text-[#E6EAF0]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E232D]">
          <h2 className="font-display text-lg tracking-wider text-[#F2F4F8]">
            Configurações
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="flex items-center justify-center w-10 h-10 rounded text-[#8C95A6] hover:text-[#E6EAF0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5 text-sm">
          {/* Audio Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="vol-slider" className="text-[#C3CAD6]">
                Volume Geral
              </label>
              <span className="font-mono-tabular text-xs text-[#E59838]">
                {settings.muted ? 'Silenciado' : `${Math.round(settings.volume * 100)}%`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="vol-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) =>
                  onUpdate({ ...settings, volume: parseFloat(e.target.value), muted: false })
                }
                className="flex-1 accent-[#E59838] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => onUpdate({ ...settings, muted: !settings.muted })}
                className="min-h-[36px] px-3 text-xs rounded border border-[#2C3340] bg-[#12161E] hover:border-[#E59838] cursor-pointer whitespace-nowrap"
              >
                {settings.muted ? 'Ativar' : 'Mutar'}
              </button>
            </div>
          </div>

          {/* Touch Sensitivity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="sens-slider" className="text-[#C3CAD6]">
                Sensibilidade dos Controles
              </label>
              <span className="font-mono-tabular text-xs text-[#E59838]">
                {settings.touchSensitivity.toFixed(1)}x
              </span>
            </div>
            <input
              id="sens-slider"
              type="range"
              min={0.6}
              max={1.8}
              step={0.1}
              value={settings.touchSensitivity}
              onChange={(e) =>
                onUpdate({ ...settings, touchSensitivity: parseFloat(e.target.value) })
              }
              className="w-full accent-[#E59838] cursor-pointer"
            />
          </div>

          {/* Touch Overlay Mode */}
          <div>
            <span className="block mb-2 text-[#C3CAD6]">Controles Touchscreen (Android)</span>
            <div className="grid grid-cols-3 gap-2">
              {touchModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onUpdate({ ...settings, touchMode: m.id })}
                  className={`min-h-[38px] px-2 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    settings.touchMode === m.id
                      ? 'bg-[#2A1F13] border-[#E59838] text-[#FFD08A]'
                      : 'bg-[#11141B] border-[#252B36] text-[#929BAC] hover:text-[#E6EAF0]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Graphics Quality */}
          <div>
            <span className="block mb-2 text-[#C3CAD6]">Qualidade Gráfica</span>
            <div className="flex flex-col gap-2">
              {qualities.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onUpdate({ ...settings, quality: q.id })}
                  className={`min-h-[40px] px-3 text-left text-xs rounded border transition-colors cursor-pointer ${
                    settings.quality === q.id
                      ? 'bg-[#2A1F13] border-[#E59838] text-[#FFD08A]'
                      : 'bg-[#11141B] border-[#252B36] text-[#929BAC] hover:text-[#E6EAF0]'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-5 bg-[#E59838] text-[#07080A] text-sm font-semibold rounded hover:bg-[#F3AA4E] transition-colors cursor-pointer"
          >
            Aplicar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

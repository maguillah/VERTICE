import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Zap, Sparkles } from 'lucide-react';
import { TouchInputState } from '../game/types';

interface TouchControlsOverlayProps {
  visible: boolean;
  hasNearbyInteractable: boolean;
  onTouchChange: (partial: Partial<TouchInputState>) => void;
}

export const TouchControlsOverlay: React.FC<TouchControlsOverlayProps> = ({
  visible,
  hasNearbyInteractable,
  onTouchChange,
}) => {
  if (!visible) return null;

  const btnBase =
    'flex items-center justify-center rounded-lg border border-[#353D4B]/80 bg-[#0A0C10]/65 text-[#D8DEE8] active:bg-[#E59838]/25 active:border-[#E59838] touch-none select-none';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-15 flex items-end justify-between p-4 sm:p-6">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Mover para esquerda"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onTouchChange({ left: true });
          }}
          onPointerUp={() => onTouchChange({ left: false })}
          onPointerCancel={() => onTouchChange({ left: false })}
          className={`${btnBase} w-14 h-14`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Mover para direita"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onTouchChange({ right: true });
          }}
          onPointerUp={() => onTouchChange({ right: false })}
          onPointerCancel={() => onTouchChange({ right: false })}
          className={`${btnBase} w-14 h-14`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          type="button"
          aria-label="Agachar ou descer"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onTouchChange({ down: true });
          }}
          onPointerUp={() => onTouchChange({ down: false })}
          onPointerCancel={() => onTouchChange({ down: false })}
          className={`${btnBase} w-12 h-12`}
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          type="button"
          aria-label="Correr"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onTouchChange({ run: true });
          }}
          onPointerUp={() => onTouchChange({ run: false })}
          onPointerCancel={() => onTouchChange({ run: false })}
          className={`${btnBase} px-3.5 h-12 text-xs font-medium tracking-wide whitespace-nowrap`}
        >
          <Zap className="w-4 h-4 mr-1" />
          <span>Correr</span>
        </button>
      </div>

      <div className="pointer-events-auto flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Subir ou escalar"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onTouchChange({ up: true });
          }}
          onPointerUp={() => onTouchChange({ up: false })}
          onPointerCancel={() => onTouchChange({ up: false })}
          className={`${btnBase} px-3 h-12 text-xs font-medium whitespace-nowrap`}
        >
          <span>Escalar</span>
        </button>

        <button
          type="button"
          aria-label="Interagir"
          onPointerDown={(e) => {
            e.preventDefault();
            onTouchChange({ interactJustPressed: true });
          }}
          className={`${btnBase} h-13 px-4 text-xs font-medium whitespace-nowrap ${
            hasNearbyInteractable ? 'border-[#E59838] text-[#FFD08A]' : 'opacity-65'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          <span>Interagir</span>
        </button>

        <button
          type="button"
          aria-label="Pular"
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            onTouchChange({ jumpJustPressed: true, jumpHeld: true });
          }}
          onPointerUp={() => onTouchChange({ jumpHeld: false })}
          onPointerCancel={() => onTouchChange({ jumpHeld: false })}
          className={`${btnBase} w-16 h-16 border-[#E59838]/60`}
        >
          <ArrowUp className="w-6 h-6 text-[#FFB85C]" />
        </button>
      </div>
    </div>
  );
};

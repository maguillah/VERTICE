import React from 'react';
import { ChapterNumber } from '../game/types';
import { CHAPTER_CATALOG } from '../game/worldData';

interface PauseModalProps {
  chapterNumber: ChapterNumber;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenGodotProject: () => void;
  onExitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  chapterNumber,
  onResume,
  onRestart,
  onOpenSettings,
  onOpenGodotProject,
  onExitToTitle,
}) => {
  const info = CHAPTER_CATALOG[chapterNumber];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#040507]/82 p-4">
      <div className="w-full max-w-sm rounded-lg border border-[#282E3A] bg-[#0B0D12] p-6 text-center">
        <h2 className="font-display text-xl tracking-[0.2em] text-[#F2F4F8] mb-1">
          PAUSA
        </h2>
        <p className="text-xs text-[#8891A2] mb-6">
          Capítulo {info.roman} · {info.title}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="min-h-[44px] w-full bg-[#E59838] text-[#07080A] text-sm font-semibold rounded hover:bg-[#F3AA4E] transition-colors cursor-pointer whitespace-nowrap"
          >
            Retomar
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-[42px] w-full border border-[#2C3340] bg-[#11141B] text-[#E6EAF0] text-sm rounded hover:border-[#E59838] transition-colors cursor-pointer whitespace-nowrap"
          >
            Reiniciar Capítulo {info.roman}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="min-h-[42px] w-full border border-[#2C3340] bg-[#11141B] text-[#E6EAF0] text-sm rounded hover:border-[#E59838] transition-colors cursor-pointer whitespace-nowrap"
          >
            Configurações
          </button>
          <button
            type="button"
            onClick={onOpenGodotProject}
            className="min-h-[42px] w-full border border-[#E59838]/35 bg-[#15120D] text-[#FFB85C] text-sm rounded hover:border-[#E59838] transition-colors cursor-pointer whitespace-nowrap"
          >
            Projeto Godot 4 · Baixar ZIP
          </button>
          <button
            type="button"
            onClick={onExitToTitle}
            className="min-h-[40px] w-full text-xs text-[#8C95A6] hover:text-[#E6EAF0] transition-colors cursor-pointer mt-1 whitespace-nowrap"
          >
            Voltar ao Menu Inicial
          </button>
        </div>
      </div>
    </div>
  );
};

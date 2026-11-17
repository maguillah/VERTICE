import React from 'react';
import { ChapterNumber } from '../game/types';
import { CHAPTER_CATALOG } from '../game/worldData';

interface ChapterEndModalProps {
  chapterNumber: ChapterNumber;
  memoriesFound: number;
  memoriesTotal: number;
  onAdvanceChapter: () => void;
  onReplayCurrent: () => void;
  onExitToTitle: () => void;
  onOpenGodotProject: () => void;
}

export const ChapterEndModal: React.FC<ChapterEndModalProps> = ({
  chapterNumber,
  memoriesFound,
  memoriesTotal,
  onAdvanceChapter,
  onReplayCurrent,
  onExitToTitle,
  onOpenGodotProject,
}) => {
  const info = CHAPTER_CATALOG[chapterNumber];
  const isFinale = chapterNumber === 6;
  const nextInfo = !isFinale ? CHAPTER_CATALOG[(chapterNumber + 1) as ChapterNumber] : null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#040507]/90 p-6">
      <div className="w-full max-w-lg rounded-lg border border-[#323A48] bg-[#0B0D12] p-8 text-center">
        <p className="text-xs tracking-[0.28em] uppercase text-[#E59838] mb-2">
          {isFinale ? 'Fim da Campanha · VÉRTICE' : `Capítulo ${info.roman} Concluído`}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl tracking-[0.14em] text-[#F2F4F8] mb-4">
          {info.title.toUpperCase()}
        </h2>
        <p className="text-sm text-[#A8B1C0] leading-relaxed mb-4">
          {info.closingQuote}
        </p>
        <p className="text-xs font-mono-tabular text-[#D7A258] mb-6">
          Memórias Eco Despertadas: {memoriesFound}/{memoriesTotal}
          {nextInfo ? ` · Capítulo ${nextInfo.roman} (${nextInfo.title}) desbloqueado` : ' · Campanha integralmente concluída'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onAdvanceChapter}
            className="min-h-[44px] px-6 bg-[#E59838] text-[#07080A] text-sm font-semibold rounded hover:bg-[#F3AA4E] transition-colors cursor-pointer whitespace-nowrap"
          >
            {nextInfo
              ? `Avançar · Cap. ${nextInfo.roman} (${nextInfo.title})`
              : 'Recomeçar Campanha (Cap. I)'}
          </button>
          <button
            type="button"
            onClick={onReplayCurrent}
            className="min-h-[44px] px-5 border border-[#2C3340] bg-[#11141B] text-[#E6EAF0] text-sm rounded hover:border-[#E59838] transition-colors cursor-pointer whitespace-nowrap"
          >
            Jogar Cap. {info.roman} Novamente
          </button>
          <button
            type="button"
            onClick={onOpenGodotProject}
            className="min-h-[44px] px-5 border border-[#E59838]/45 bg-[#15120D] text-[#FFB85C] text-sm rounded hover:border-[#E59838] transition-colors cursor-pointer whitespace-nowrap"
          >
            Baixar Projeto Godot 4 (.zip)
          </button>
          <button
            type="button"
            onClick={onExitToTitle}
            className="min-h-[44px] px-4 text-sm text-[#8E97A8] hover:text-[#E6EAF0] transition-colors cursor-pointer whitespace-nowrap"
          >
            Menu Inicial
          </button>
        </div>
      </div>
    </div>
  );
};

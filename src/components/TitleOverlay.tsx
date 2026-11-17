import React from 'react';
import keyArtUrl from '../assets/images/vertice_key_art_1794714145130.jpg';
import { ChapterNumber } from '../game/types';
import { CHAPTER_CATALOG } from '../game/worldData';

interface TitleOverlayProps {
  hasSave: boolean;
  unlockedChapter: ChapterNumber;
  onStart: () => void;
  onContinue: () => void;
  onSelectChapter: (chapter: ChapterNumber) => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenGodotProject: () => void;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  hasSave,
  unlockedChapter,
  onStart,
  onContinue,
  onSelectChapter,
  onOpenSettings,
  onOpenCredits,
  onOpenGodotProject,
}) => {
  const allChapters: ChapterNumber[] = [1, 2, 3, 4, 5, 6];

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={keyArtUrl}
          alt="VÉRTICE — Monólitos suspensos e o protagonista no limiar"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-55 mix-blend-lighten"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060709]/95 via-[#060709]/70 to-[#060709]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060709]/90 via-transparent to-[#060709]/50" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-8 sm:px-14 md:px-20 max-w-3xl">
        <div className="mb-8">
          <svg
            viewBox="0 0 420 96"
            className="w-72 sm:w-96 h-auto overflow-visible"
            role="img"
            aria-label="VÉRTICE"
          >
            <polygon
              points="24,14 44,48 24,82 4,48"
              fill="none"
              stroke="#4B5565"
              strokeWidth="1.75"
            />
            <polygon points="24,30 34,48 24,66 14,48" fill="#E59838" />
            <circle cx="24" cy="48" r="3" fill="#FFF2D6" />
            <text
              x="64"
              y="62"
              fill="#ECEFF4"
              fontFamily="Cinzel, Georgia, serif"
              fontSize="48"
              fontWeight="600"
              letterSpacing="10"
            >
              VÉRTICE
            </text>
          </svg>
          <p className="mt-2 pl-1 text-sm sm:text-base tracking-[0.26em] uppercase text-[#E59838] font-medium">
            O Limiar da Existência
          </p>
        </div>

        <nav className="flex flex-col items-start gap-3" aria-label="Menu principal">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onStart}
              className="group flex items-center gap-3 min-h-[44px] px-6 py-2.5 bg-[#E59838] text-[#07080A] font-semibold tracking-wide text-sm rounded hover:bg-[#F3AA4E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Iniciar Campanha</span>
              <span className="text-xs opacity-75 font-mono-tabular">Cap. I</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              disabled={!hasSave}
              className={`min-h-[44px] px-5 py-2 text-sm tracking-wide rounded border transition-colors whitespace-nowrap shrink-0 ${
                hasSave
                  ? 'border-[#333B48] bg-[#0D1016]/85 text-[#E6EAF0] hover:border-[#E59838] hover:text-[#FFB85C] cursor-pointer'
                  : 'border-[#1B2028] bg-[#0A0C10]/40 text-[#4B5362] cursor-not-allowed'
              }`}
            >
              Continuar
            </button>
          </div>

          {unlockedChapter > 1 && (
            <div className="mt-1 flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8E98A8]">
                Capítulos Desbloqueados
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {allChapters.map((ch) => {
                  const unlocked = ch <= unlockedChapter;
                  const info = CHAPTER_CATALOG[ch];
                  return (
                    <button
                      key={ch}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => onSelectChapter(ch)}
                      className={`min-h-[40px] px-3 py-1.5 text-xs rounded border transition-colors whitespace-nowrap shrink-0 ${
                        unlocked
                          ? 'border-[#E59838]/45 bg-[#14110C]/85 text-[#FFD79A] hover:border-[#E59838] cursor-pointer'
                          : 'border-[#1B2028] bg-[#0A0C10]/45 text-[#4B5362] cursor-not-allowed'
                      }`}
                    >
                      {info.roman} · {info.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-[#9AA3B2]">
            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[44px] py-1.5 hover:text-[#E6EAF0] transition-colors cursor-pointer whitespace-nowrap"
            >
              Configurações
            </button>
            <button
              type="button"
              onClick={onOpenCredits}
              className="min-h-[44px] py-1.5 hover:text-[#E6EAF0] transition-colors cursor-pointer whitespace-nowrap"
            >
              Créditos
            </button>
            <button
              type="button"
              onClick={onOpenGodotProject}
              className="min-h-[44px] py-1.5 text-[#E59838] hover:text-[#FFB85C] transition-colors cursor-pointer whitespace-nowrap"
            >
              Projeto Godot 4 · Exportar ZIP
            </button>
          </div>
        </nav>
      </div>

      <div className="relative z-10 px-8 sm:px-14 md:px-20 pb-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#7B8494]">
        <p className="font-mono-tabular tracking-wide">
          A / D Mover · S Agachar · W/S Escalar · Shift Correr · Espaço Pular · E Interagir · 1 / 2 / 3 Ressonância · Esc Pausar
        </p>
        <span className="text-[#697282]">Campanha Completa · Capítulos I–VI</span>
      </div>
    </div>
  );
};

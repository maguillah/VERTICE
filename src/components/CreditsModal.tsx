import React from 'react';
import { X } from 'lucide-react';
import iconUrl from '../assets/images/vertice_icon_1794714144302.jpg';

interface CreditsModalProps {
  onClose: () => void;
  onOpenGodotProject: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  onClose,
  onOpenGodotProject,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#040507]/85 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#282E3A] bg-[#0B0D12] p-6 text-[#E6EAF0]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E232D]">
          <div className="flex items-center gap-3">
            <img
              src={iconUrl}
              alt="Emblema VÉRTICE"
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded border border-[#323A49] object-cover"
            />
            <div>
              <h2 className="font-display text-lg tracking-wider text-[#F2F4F8]">
                VÉRTICE
              </h2>
              <p className="text-xs text-[#E59838]">O Limiar da Existência</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar créditos"
            className="flex items-center justify-center w-10 h-10 rounded text-[#8C95A6] hover:text-[#E6EAF0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-[#B7C0CE] leading-relaxed">
          <p>
            Projeto original de aventura cinematográfica 2D e quebra-cabeças existenciais, construído com arquitetura modular para Godot Engine 4.3 (Android) e versão jogável interativa no navegador.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1B2029] text-xs">
            <div>
              <span className="block text-[#757F91]">Campanha Completa</span>
              <span className="text-[#E6EAF0] font-medium">Capítulos I–VI · 100% 2D</span>
            </div>
            <div>
              <span className="block text-[#757F91]">Dispositivo Alvo</span>
              <span className="text-[#E6EAF0] font-medium">OPPO A5 · Adreno 619</span>
            </div>
            <div>
              <span className="block text-[#757F91]">Mecânica Central</span>
              <span className="text-[#E59838] font-medium">Ressonância (3 Estados)</span>
            </div>
            <div>
              <span className="block text-[#757F91]">Meta de Desempenho</span>
              <span className="font-mono-tabular text-[#E6EAF0]">30 FPS Estáveis</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[#1E232D]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGodotProject();
            }}
            className="min-h-[40px] px-4 text-xs font-medium text-[#E59838] border border-[#E59838]/40 rounded hover:bg-[#E59838]/10 transition-colors cursor-pointer"
          >
            Inspecionar Projeto Godot 4 & ZIP
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 bg-[#1B2029] text-[#E6EAF0] text-xs font-medium rounded hover:bg-[#252C38] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

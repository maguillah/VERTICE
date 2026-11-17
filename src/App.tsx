import { useCallback, useEffect, useRef, useState } from 'react';
import { ChapterEndModal } from './components/ChapterEndModal';
import { CreditsModal } from './components/CreditsModal';
import { GameHud } from './components/GameHud';
import { GodotProjectModal } from './components/GodotProjectModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { TitleOverlay } from './components/TitleOverlay';
import { TouchControlsOverlay } from './components/TouchControlsOverlay';
import { loadSaveData, VerticeGameEngine } from './game/engine';
import {
  ChapterNumber,
  GameScreen,
  GameSettings,
  HudSnapshot,
  ResonanceState,
  TouchInputState,
} from './game/types';

const SETTINGS_KEY = 'vertice_settings_v1';

function loadInitialSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw) as GameSettings;
    }
  } catch {
    // ignore storage read error
  }
  return {
    volume: 0.85,
    muted: false,
    touchSensitivity: 1.0,
    quality: 'medium',
    touchMode: 'auto',
  };
}

const INITIAL_HUD: HudSnapshot = {
  chapterNumber: 1,
  chapterTitle: 'Cap. I · O Despertar',
  unlockedChapter: 1,
  campaignCompleted: false,
  areaId: 1,
  areaTitle: 'O Primeiro Silêncio',
  areaSubtitle: 'Área I · Despertar',
  areaWhisper: 'Um núcleo desperta sobre águas imóveis.',
  resonanceState: 'PRESENTE',
  unlockedEcho: false,
  unlockedRuptura: false,
  rupturaEnergy: 1,
  puzzleCount: 0,
  puzzleTotal: 2,
  memoriesFound: 0,
  memoriesTotal: 4,
  nearbyPrompt: null,
  bannerNotice: null,
  resonanceNotice: null,
  isCrouching: false,
  isClimbing: false,
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<VerticeGameEngine | null>(null);

  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [settings, setSettings] = useState<GameSettings>(() => loadInitialSettings());
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [hasSave, setHasSave] = useState<boolean>(() => loadSaveData().hasSave);
  const [unlockedChapter, setUnlockedChapter] = useState<ChapterNumber>(
    () => loadSaveData().unlockedChapter
  );

  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showGodotModal, setShowGodotModal] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new VerticeGameEngine(canvas, settings, {
      onHudUpdate: (snapshot) => {
        setHud(snapshot);
        const s = loadSaveData();
        setHasSave(s.hasSave);
        setUnlockedChapter(s.unlockedChapter);
      },
      onChapterComplete: () => {
        const s = loadSaveData();
        setUnlockedChapter(s.unlockedChapter);
        setScreen('CHAPTER_END');
      },
      onReturnToTitle: () => {
        engineRef.current?.returnToTitle();
        const s = loadSaveData();
        setHasSave(s.hasSave);
        setUnlockedChapter(s.unlockedChapter);
        setScreen('TITLE');
      },
      onAutoQualityStepDown: (newQuality) => {
        setSettings((prev) => ({ ...prev, quality: newQuality }));
      },
    });
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // Mount once; settings updates flow via applySettings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage write error
    }
    engineRef.current?.applySettings(next);
  }, []);

  const handleStart = useCallback(() => {
    engineRef.current?.startNewGame();
    setScreen('PLAYING');
  }, []);

  const handleContinue = useCallback(() => {
    engineRef.current?.continueGame();
    setScreen('PLAYING');
  }, []);

  const handleSelectChapter = useCallback((ch: ChapterNumber) => {
    engineRef.current?.startChapter(ch, false);
    setScreen('PLAYING');
  }, []);

  const handleAdvanceChapter = useCallback(() => {
    engineRef.current?.advanceToNextChapter();
    setScreen('PLAYING');
  }, []);

  const handleReplayCurrent = useCallback(() => {
    engineRef.current?.startChapter(hud.chapterNumber, false);
    setScreen('PLAYING');
  }, [hud.chapterNumber]);

  const handleTogglePause = useCallback(() => {
    setScreen((prev) => {
      if (prev === 'PLAYING') {
        engineRef.current?.setPaused(true);
        return 'PAUSED';
      }
      if (prev === 'PAUSED') {
        engineRef.current?.setPaused(false);
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  const handleExitToTitle = useCallback(() => {
    engineRef.current?.returnToTitle();
    const s = loadSaveData();
    setHasSave(s.hasSave);
    setUnlockedChapter(s.unlockedChapter);
    setScreen('TITLE');
  }, []);

  const handleSelectState = useCallback((state: ResonanceState) => {
    engineRef.current?.setResonanceState(state);
  }, []);

  const handleTouchChange = useCallback((partial: Partial<TouchInputState>) => {
    engineRef.current?.setTouchInput(partial);
  }, []);

  const handleToggleMute = useCallback(() => {
    handleUpdateSettings({ ...settings, muted: !settings.muted });
  }, [handleUpdateSettings, settings]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showCredits || showGodotModal) {
        if (e.code === 'Escape') {
          setShowSettings(false);
          setShowCredits(false);
          setShowGodotModal(false);
        }
        return;
      }

      if (screen === 'TITLE' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        handleStart();
      } else if ((screen === 'PLAYING' || screen === 'PAUSED') && e.code === 'Escape') {
        e.preventDefault();
        handleTogglePause();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, showSettings, showCredits, showGodotModal, handleStart, handleTogglePause]);

  const showTouchControls =
    screen === 'PLAYING' &&
    (settings.touchMode === 'always' || (settings.touchMode === 'auto' && isTouchDevice));

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#060709] select-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        aria-label="Área de jogo 2D VÉRTICE"
      />

      {screen === 'TITLE' && (
        <TitleOverlay
          hasSave={hasSave}
          unlockedChapter={unlockedChapter}
          onStart={handleStart}
          onContinue={handleContinue}
          onSelectChapter={handleSelectChapter}
          onOpenSettings={() => setShowSettings(true)}
          onOpenCredits={() => setShowCredits(true)}
          onOpenGodotProject={() => setShowGodotModal(true)}
        />
      )}

      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <GameHud
          hud={hud}
          muted={settings.muted}
          onToggleMute={handleToggleMute}
          onPause={handleTogglePause}
          onSelectState={handleSelectState}
        />
      )}

      <TouchControlsOverlay
        visible={showTouchControls}
        hasNearbyInteractable={Boolean(hud.nearbyPrompt)}
        onTouchChange={handleTouchChange}
      />

      {screen === 'PAUSED' && !showSettings && !showGodotModal && (
        <PauseModal
          chapterNumber={hud.chapterNumber}
          onResume={handleTogglePause}
          onRestart={handleReplayCurrent}
          onOpenSettings={() => setShowSettings(true)}
          onOpenGodotProject={() => setShowGodotModal(true)}
          onExitToTitle={handleExitToTitle}
        />
      )}

      {screen === 'CHAPTER_END' && !showGodotModal && (
        <ChapterEndModal
          chapterNumber={hud.chapterNumber}
          memoriesFound={hud.memoriesFound}
          memoriesTotal={hud.memoriesTotal}
          onAdvanceChapter={handleAdvanceChapter}
          onReplayCurrent={handleReplayCurrent}
          onExitToTitle={handleExitToTitle}
          onOpenGodotProject={() => setShowGodotModal(true)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCredits && (
        <CreditsModal
          onClose={() => setShowCredits(false)}
          onOpenGodotProject={() => setShowGodotModal(true)}
        />
      )}

      {showGodotModal && (
        <GodotProjectModal onClose={() => setShowGodotModal(false)} />
      )}
    </main>
  );
}

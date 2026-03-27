import { useEffect, useRef, useState, useCallback } from "react";
import { ParticleEngine, type ParticleConfig } from "@/lib/particles/engine";

interface ParticleCanvasProps {
  config: Partial<ParticleConfig>;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
  /** If true, shows FPS counter and particle count overlay */
  showStats?: boolean;
  /** Global opacity override for transitions (0-1) */
  globalOpacity?: number;
  /** Callback with engine ref for external control */
  onEngineReady?: (engine: ParticleEngine) => void;
}

export function ParticleCanvas({
  config,
  backgroundColor = "#000000",
  className = "",
  style,
  showStats = false,
  globalOpacity = 1,
  onEngineReady,
}: ParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const configRef = useRef<Partial<ParticleConfig>>(config);
  const initializedRef = useRef(false);
  const [fps, setFps] = useState(0);
  const fpsFrames = useRef(0);
  const fpsTime = useRef(performance.now());

  // Initialize engine once
  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const engine = new ParticleEngine(containerRef.current, config);
    engineRef.current = engine;
    configRef.current = config;
    onEngineReady?.(engine);

    // FPS tracking
    if (showStats) {
      const originalAnimate = engine.animate;
      engine.animate = () => {
        fpsFrames.current++;
        const now = performance.now();
        if (now - fpsTime.current >= 1000) {
          setFps(fpsFrames.current);
          fpsFrames.current = 0;
          fpsTime.current = now;
        }
        originalAnimate();
      };
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []); // Only run once on mount

  // Incrementally update config when it changes
  useEffect(() => {
    if (!engineRef.current) return;

    // Diff the configs and only send what changed
    const prev = configRef.current as Record<string, any>;
    const next = config as Record<string, any>;
    const changes: Record<string, any> = {};
    let hasChanges = false;

    for (const key of Object.keys(next)) {
      const prevVal = prev[key];
      const nextVal = next[key];
      if (typeof nextVal === "object" && nextVal !== null && typeof prevVal === "object" && prevVal !== null) {
        if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
          changes[key] = nextVal;
          hasChanges = true;
        }
      } else if (prevVal !== nextVal) {
        changes[key] = nextVal;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      engineRef.current.updateConfig(changes as Partial<ParticleConfig>);
      configRef.current = { ...config };
    }
  }, [config]);

  // Update renderer opacity for transitions
  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector("canvas");
    if (canvas) {
      canvas.style.opacity = String(globalOpacity);
      canvas.style.transition = "opacity 0.3s ease";
    }
  }, [globalOpacity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundColor,
        ...style,
      }}
      data-testid="particle-canvas"
    >
      {showStats && engineRef.current && (
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 font-mono text-xs space-y-0.5 pointer-events-none">
          <div className="text-green-400">{fps} FPS</div>
          <div className="text-cyan-400">
            {(config as ParticleConfig).count?.toLocaleString() ?? "—"} particles
          </div>
          <div className="text-white/40">
            {(config as ParticleConfig).pattern ?? "random"}
          </div>
        </div>
      )}
    </div>
  );
}

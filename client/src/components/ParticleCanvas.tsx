import { useEffect, useRef, useCallback } from "react";
import { ParticleEngine, type ParticleConfig } from "@/lib/particles/engine";

interface ParticleCanvasProps {
  config: Partial<ParticleConfig>;
  backgroundColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ParticleCanvas({ config, backgroundColor = "#000000", className = "", style }: ParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up old engine
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    engineRef.current = new ParticleEngine(containerRef.current, config);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [config]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundColor,
        ...style,
      }}
      data-testid="particle-canvas"
    />
  );
}

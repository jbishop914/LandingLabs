import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { DEMO_PRESETS } from "@/lib/particles/presets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles, ArrowRight, Layers, Zap, Code } from "lucide-react";

export default function LandingPage() {
  const [selectedPreset, setSelectedPreset] = useState(DEMO_PRESETS[0].id);
  const [, navigate] = useLocation();

  const currentPreset = useMemo(
    () => DEMO_PRESETS.find((p) => p.id === selectedPreset) || DEMO_PRESETS[0],
    [selectedPreset]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden" data-testid="landing-page">
      {/* Particle Background — keyed to force remount on change */}
      <ParticleCanvas
        key={currentPreset.id}
        config={currentPreset.config}
        backgroundColor={currentPreset.backgroundColor}
      />

      {/* Top bar with dropdown */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold text-lg tracking-tight">LandingLabs</span>
          </div>
        </div>

        {/* Preset selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedPreset} onValueChange={setSelectedPreset}>
            <SelectTrigger
              className="w-[220px] bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-colors"
              data-testid="preset-selector"
            >
              <SelectValue placeholder="Choose a style" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 backdrop-blur-md border-white/20">
              {DEMO_PRESETS.map((preset) => (
                <SelectItem
                  key={preset.id}
                  value={preset.id}
                  className="text-white/90 hover:text-white focus:text-white focus:bg-white/10"
                  data-testid={`preset-option-${preset.id}`}
                >
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/login")}
            data-testid="login-button"
          >
            Log in
          </Button>
          <Button
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
            onClick={() => navigate("/signup")}
            data-testid="signup-button"
          >
            Start free trial
          </Button>
        </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="text-center max-w-2xl px-6 pointer-events-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Particle backgrounds
            <br />
            <span className="text-cyan-400">for any landing page</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Build stunning Three.js particle animations visually.
            No code required. Export and integrate in minutes.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Button
              size="lg"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold gap-2 px-8"
              onClick={() => navigate("/signup")}
              data-testid="cta-start-building"
            >
              Start building
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-2"
              onClick={() => {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="cta-learn-more"
            >
              Learn more
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preset indicator */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-6 py-3 border border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm">Viewing:</span>
            <span className="text-white font-medium text-sm">{currentPreset.name}</span>
            <span className="text-white/30">—</span>
            <span className="text-white/50 text-sm">{currentPreset.description}</span>
          </div>
        </div>
      </div>

      {/* Scrollable content below the fold */}
      <div className="absolute top-full w-full z-10" id="features">
        <div className="bg-gray-950 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-4">How it works</h2>
            <p className="text-white/50 text-center mb-16 max-w-xl mx-auto">
              Go from idea to stunning particle background in minutes. 
              Our visual builder makes Three.js accessible to everyone.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Layers className="w-6 h-6" />}
                title="Import your page"
                description="Paste your existing landing page URL. We'll clone it and give you a clean canvas to work with."
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Build your animation"
                description="Choose from patterns, adjust particles, colors, gravity, wind, and more. Chain animations into sequences."
              />
              <FeatureCard
                icon={<Code className="w-6 h-6" />}
                title="Export the code"
                description="Get clean, commented Three.js code ready to paste into your project. Or use our auto-integration."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors" data-testid={`feature-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="text-cyan-400 mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LandingLabs logo"
    >
      {/* Solid white L — bold, clean, geometric */}
      <path d="M4 8 H20 V72 H40 V86 H4 Z" fill="white" />

      {/* Second L — multicolor particle explosion */}
      {/* Dense core particles tracing the vertical stroke */}
      <circle cx="54" cy="18" r="4.5" fill="#00cfff" />
      <circle cx="56" cy="28" r="5" fill="#38bdf8" />
      <circle cx="54" cy="38" r="5.5" fill="#818cf8" />
      <circle cx="55" cy="48" r="5" fill="#a855f7" />
      <circle cx="54" cy="58" r="5.5" fill="#e879f9" />
      <circle cx="56" cy="68" r="5" fill="#f472b6" />
      <circle cx="55" cy="77" r="4.5" fill="#fb923c" />

      {/* Dense core particles tracing the horizontal stroke */}
      <circle cx="65" cy="79" r="5" fill="#f59e0b" />
      <circle cx="76" cy="78" r="5.5" fill="#f97316" />
      <circle cx="87" cy="79" r="4.5" fill="#ef4444" />
      <circle cx="96" cy="78" r="3.5" fill="#fb7185" />

      {/* Medium scatter — right side of vertical */}
      <circle cx="63" cy="14" r="3" fill="#22d3ee" opacity="0.9" />
      <circle cx="64" cy="24" r="3.5" fill="#60a5fa" opacity="0.85" />
      <circle cx="65" cy="34" r="3.2" fill="#8b5cf6" opacity="0.85" />
      <circle cx="64" cy="44" r="3" fill="#c084fc" opacity="0.8" />
      <circle cx="63" cy="54" r="3.5" fill="#e879f9" opacity="0.8" />
      <circle cx="65" cy="64" r="3" fill="#f472b6" opacity="0.8" />
      <circle cx="64" cy="73" r="2.8" fill="#fb923c" opacity="0.8" />

      {/* Left side fill of vertical */}
      <circle cx="47" cy="22" r="2.5" fill="#06b6d4" opacity="0.8" />
      <circle cx="46" cy="35" r="3" fill="#6366f1" opacity="0.7" />
      <circle cx="47" cy="50" r="2.5" fill="#a855f7" opacity="0.7" />
      <circle cx="46" cy="63" r="3" fill="#ec4899" opacity="0.7" />
      <circle cx="47" cy="76" r="2.5" fill="#f97316" opacity="0.7" />

      {/* Dispersing outer particles — flying away from edges */}
      {/* Top scatter */}
      <circle cx="68" cy="8" r="2.2" fill="#00e5ff" opacity="0.75" />
      <circle cx="75" cy="5" r="1.8" fill="#22d3ee" opacity="0.55" />
      <circle cx="60" cy="6" r="1.5" fill="#06b6d4" opacity="0.6" />
      <circle cx="82" cy="10" r="1.3" fill="#38bdf8" opacity="0.4" />
      <circle cx="72" cy="13" r="1.6" fill="#0ea5e9" opacity="0.5" />
      <circle cx="88" cy="6" r="1" fill="#22d3ee" opacity="0.25" />
      <circle cx="80" cy="2" r="0.8" fill="#00e5ff" opacity="0.2" />

      {/* Right scatter — upper */}
      <circle cx="73" cy="19" r="2" fill="#60a5fa" opacity="0.65" />
      <circle cx="80" cy="16" r="1.5" fill="#3b82f6" opacity="0.45" />
      <circle cx="74" cy="28" r="2.2" fill="#818cf8" opacity="0.6" />
      <circle cx="82" cy="24" r="1.3" fill="#6366f1" opacity="0.35" />
      <circle cx="88" cy="20" r="1" fill="#3b82f6" opacity="0.25" />

      {/* Right scatter — mid */}
      <circle cx="73" cy="40" r="2" fill="#a78bfa" opacity="0.6" />
      <circle cx="81" cy="36" r="1.5" fill="#8b5cf6" opacity="0.4" />
      <circle cx="74" cy="51" r="1.8" fill="#d946ef" opacity="0.55" />
      <circle cx="82" cy="47" r="1.3" fill="#c026d3" opacity="0.35" />
      <circle cx="89" cy="42" r="1" fill="#a855f7" opacity="0.2" />

      {/* Right scatter — lower */}
      <circle cx="73" cy="61" r="1.8" fill="#f472b6" opacity="0.55" />
      <circle cx="80" cy="57" r="1.5" fill="#ec4899" opacity="0.4" />
      <circle cx="72" cy="71" r="1.6" fill="#fb923c" opacity="0.5" />
      <circle cx="80" cy="68" r="1.2" fill="#f97316" opacity="0.35" />

      {/* Bottom-right scatter */}
      <circle cx="103" cy="75" r="2" fill="#ef4444" opacity="0.6" />
      <circle cx="110" cy="78" r="1.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="100" cy="83" r="1.8" fill="#f59e0b" opacity="0.5" />
      <circle cx="108" cy="85" r="1.3" fill="#fb923c" opacity="0.35" />
      <circle cx="114" cy="73" r="1" fill="#ef4444" opacity="0.25" />
      <circle cx="93" cy="85" r="1.5" fill="#eab308" opacity="0.45" />
      <circle cx="85" cy="86" r="1.2" fill="#f59e0b" opacity="0.4" />
      <circle cx="116" cy="82" r="0.8" fill="#fb7185" opacity="0.2" />

      {/* Tiny far-flung particles */}
      <circle cx="93" cy="3" r="0.7" fill="#22d3ee" opacity="0.18" />
      <circle cx="92" cy="14" r="0.8" fill="#60a5fa" opacity="0.18" />
      <circle cx="91" cy="30" r="0.7" fill="#818cf8" opacity="0.18" />
      <circle cx="93" cy="50" r="0.6" fill="#d946ef" opacity="0.15" />
      <circle cx="88" cy="62" r="0.7" fill="#f472b6" opacity="0.18" />
    </svg>
  );
}

import * as THREE from "three";

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  gradientEnd?: string;
  pattern: "random" | "array" | "vortex" | "orbit" | "linear" | "burst" | "fireworks" | "radiate" | "rain" | "snow";
  // Movement
  speed: number;
  gravity: number;
  noiseIntensity: number;
  windDirection: { x: number; y: number; z: number };
  windPower: number;
  // Array-specific
  gridSpacing?: number;
  gridConfinement?: number;
  // Lifecycle
  regenerate: boolean;
  regenerationRate?: number;
  loopBack?: boolean;
  // Orbit (whole-scene rotation)
  orbitEnabled?: boolean;
  orbitSpeed?: number;
  orbitAxis?: { x: number; y: number; z: number };
  // Opacity
  opacity: number;
  // Blend mode
  blending?: "additive" | "normal";
}

export const DEFAULT_CONFIG: ParticleConfig = {
  count: 2000,
  size: 2,
  color: "#00d4ff",
  gradientEnd: "#8b5cf6",
  pattern: "random",
  speed: 0.3,
  gravity: 0,
  noiseIntensity: 0.5,
  windDirection: { x: 0, y: 0, z: 0 },
  windPower: 0,
  gridSpacing: 2,
  gridConfinement: 0.5,
  regenerate: true,
  regenerationRate: 0.01,
  loopBack: false,
  orbitEnabled: false,
  orbitSpeed: 0.2,
  orbitAxis: { x: 0, y: 1, z: 0 },
  opacity: 0.85,
  blending: "additive",
};

// Simplex-like noise function
function pseudoNoise(x: number, y: number, z: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

export class ParticleEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  particles: THREE.Points | null = null;
  config: ParticleConfig;
  velocities: Float32Array | null = null;
  initialPositions: Float32Array | null = null;
  time: number = 0;
  animationId: number = 0;
  container: HTMLElement;
  orbitGroup: THREE.Group;

  constructor(container: HTMLElement, config: Partial<ParticleConfig> = {}) {
    this.container = container;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.scene = new THREE.Scene();
    this.orbitGroup = new THREE.Group();
    this.scene.add(this.orbitGroup);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.z = 50;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.createParticles();
    this.animate();
    this.handleResize();
  }

  handleResize() {
    const onResize = () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
  }

  createParticles() {
    if (this.particles) {
      this.orbitGroup.remove(this.particles);
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }

    const { count, size, color, gradientEnd, pattern, opacity, blending } = this.config;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.initialPositions = new Float32Array(count * 3);

    const c1 = new THREE.Color(color);
    const c2 = gradientEnd ? new THREE.Color(gradientEnd) : c1.clone();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;

      switch (pattern) {
        case "array": {
          const cols = Math.ceil(Math.sqrt(count));
          const row = Math.floor(i / cols);
          const col = i % cols;
          const spacing = this.config.gridSpacing || 2;
          positions[i3] = (col - cols / 2) * spacing;
          positions[i3 + 1] = (row - cols / 2) * spacing;
          positions[i3 + 2] = 0;
          break;
        }
        case "vortex": {
          const angle = t * Math.PI * 20;
          const radius = t * 30;
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 1] = (t - 0.5) * 40;
          positions[i3 + 2] = Math.sin(angle) * radius;
          break;
        }
        case "orbit": {
          const a = Math.random() * Math.PI * 2;
          const r = 10 + Math.random() * 25;
          positions[i3] = Math.cos(a) * r;
          positions[i3 + 1] = (Math.random() - 0.5) * 10;
          positions[i3 + 2] = Math.sin(a) * r;
          break;
        }
        case "linear": {
          positions[i3] = (Math.random() - 0.5) * 80;
          positions[i3 + 1] = (Math.random() - 0.5) * 60;
          positions[i3 + 2] = (Math.random() - 0.5) * 20;
          break;
        }
        case "burst": {
          const dir = new THREE.Vector3().randomDirection();
          const dist = Math.random() * 5;
          positions[i3] = dir.x * dist;
          positions[i3 + 1] = dir.y * dist;
          positions[i3 + 2] = dir.z * dist;
          break;
        }
        case "fireworks": {
          const cluster = Math.floor(Math.random() * 5);
          const cx = (cluster - 2) * 15;
          const cy = Math.random() * 30 - 5;
          const d = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 8);
          positions[i3] = cx + d.x;
          positions[i3 + 1] = cy + d.y;
          positions[i3 + 2] = d.z;
          break;
        }
        case "radiate": {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.pow(Math.random(), 0.5) * 35;
          positions[i3] = Math.cos(ang) * rad;
          positions[i3 + 1] = -25 + Math.random() * 50;
          positions[i3 + 2] = Math.sin(ang) * rad * 0.3;
          break;
        }
        case "rain": {
          positions[i3] = (Math.random() - 0.5) * 80;
          positions[i3 + 1] = Math.random() * 60 - 10;
          positions[i3 + 2] = (Math.random() - 0.5) * 40;
          break;
        }
        case "snow": {
          positions[i3] = (Math.random() - 0.5) * 80;
          positions[i3 + 1] = Math.random() * 60 - 10;
          positions[i3 + 2] = (Math.random() - 0.5) * 40;
          break;
        }
        default: {
          positions[i3] = (Math.random() - 0.5) * 60;
          positions[i3 + 1] = (Math.random() - 0.5) * 60;
          positions[i3 + 2] = (Math.random() - 0.5) * 40;
          break;
        }
      }

      this.initialPositions[i3] = positions[i3];
      this.initialPositions[i3 + 1] = positions[i3 + 1];
      this.initialPositions[i3 + 2] = positions[i3 + 2];

      // Initial velocity
      this.velocities[i3] = (Math.random() - 0.5) * 0.02;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Gradient color
      const lerpColor = c1.clone().lerp(c2, t + (Math.random() - 0.5) * 0.3);
      colors[i3] = lerpColor.r;
      colors[i3 + 1] = lerpColor.g;
      colors[i3 + 2] = lerpColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Create circular particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.2)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity,
      blending: blending === "additive" ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.orbitGroup.add(this.particles);
  }

  animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.time += 0.016;

    if (!this.particles || !this.velocities || !this.initialPositions) return;

    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const { count, speed, gravity, noiseIntensity, windDirection, windPower, pattern, gridConfinement, loopBack } = this.config;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Noise-based movement
      const nx = pseudoNoise(positions[i3] * 0.02, this.time * 0.3, 0) * noiseIntensity;
      const ny = pseudoNoise(0, positions[i3 + 1] * 0.02, this.time * 0.3) * noiseIntensity;
      const nz = pseudoNoise(this.time * 0.3, 0, positions[i3 + 2] * 0.02) * noiseIntensity;

      this.velocities[i3] += nx * 0.001 * speed;
      this.velocities[i3 + 1] += ny * 0.001 * speed - gravity * 0.0001;
      this.velocities[i3 + 2] += nz * 0.001 * speed;

      // Wind
      this.velocities[i3] += windDirection.x * windPower * 0.0001;
      this.velocities[i3 + 1] += windDirection.y * windPower * 0.0001;
      this.velocities[i3 + 2] += windDirection.z * windPower * 0.0001;

      // Pattern-specific behavior
      if (pattern === "array" && gridConfinement) {
        const dx = this.initialPositions[i3] - positions[i3];
        const dy = this.initialPositions[i3 + 1] - positions[i3 + 1];
        const dz = this.initialPositions[i3 + 2] - positions[i3 + 2];
        this.velocities[i3] += dx * gridConfinement * 0.01;
        this.velocities[i3 + 1] += dy * gridConfinement * 0.01;
        this.velocities[i3 + 2] += dz * gridConfinement * 0.01;
      }

      if (pattern === "orbit") {
        const cx = 0, cz = 0;
        const ax = positions[i3] - cx;
        const az = positions[i3 + 2] - cz;
        const dist = Math.sqrt(ax * ax + az * az);
        const angle = Math.atan2(az, ax) + speed * 0.002;
        this.velocities[i3] += (Math.cos(angle) * dist - positions[i3]) * 0.001;
        this.velocities[i3 + 2] += (Math.sin(angle) * dist - positions[i3 + 2]) * 0.001;
      }

      if (pattern === "vortex") {
        const ax = positions[i3];
        const az = positions[i3 + 2];
        const angle = Math.atan2(az, ax) + speed * 0.003;
        const dist = Math.sqrt(ax * ax + az * az);
        this.velocities[i3] += (Math.cos(angle) * dist - positions[i3]) * 0.002;
        this.velocities[i3 + 2] += (Math.sin(angle) * dist - positions[i3 + 2]) * 0.002;
        this.velocities[i3 + 1] += speed * 0.003;
      }

      if (pattern === "rain") {
        this.velocities[i3 + 1] = -speed * 0.15;
        this.velocities[i3] *= 0.98;
      }

      if (pattern === "snow") {
        this.velocities[i3 + 1] = -speed * 0.03;
        this.velocities[i3] += Math.sin(this.time + i) * 0.0005;
      }

      if (pattern === "radiate") {
        const dx = positions[i3];
        const dist = Math.sqrt(dx * dx + positions[i3 + 2] * positions[i3 + 2]) + 0.01;
        this.velocities[i3] += (dx / dist) * speed * 0.001;
        this.velocities[i3 + 1] += speed * 0.005;
        this.velocities[i3 + 2] += (positions[i3 + 2] / dist) * speed * 0.001;
      }

      // Damping
      this.velocities[i3] *= 0.995;
      this.velocities[i3 + 1] *= 0.995;
      this.velocities[i3 + 2] *= 0.995;

      // Update positions
      positions[i3] += this.velocities[i3];
      positions[i3 + 1] += this.velocities[i3 + 1];
      positions[i3 + 2] += this.velocities[i3 + 2];

      // Boundary check & regeneration
      const bounds = 50;
      const outOfBounds =
        Math.abs(positions[i3]) > bounds ||
        Math.abs(positions[i3 + 1]) > bounds ||
        Math.abs(positions[i3 + 2]) > bounds;

      if (outOfBounds && this.config.regenerate) {
        if (loopBack) {
          positions[i3] = this.initialPositions[i3];
          positions[i3 + 1] = this.initialPositions[i3 + 1];
          positions[i3 + 2] = this.initialPositions[i3 + 2];
        } else {
          // Re-enter from opposite side
          if (pattern === "rain" || pattern === "snow") {
            positions[i3] = (Math.random() - 0.5) * 80;
            positions[i3 + 1] = 40;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
          } else {
            positions[i3] = (Math.random() - 0.5) * 60;
            positions[i3 + 1] = (Math.random() - 0.5) * 60;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
          }
        }
        this.velocities[i3] = 0;
        this.velocities[i3 + 1] = 0;
        this.velocities[i3 + 2] = 0;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;

    // Orbit (whole scene rotation)
    if (this.config.orbitEnabled) {
      const axis = this.config.orbitAxis || { x: 0, y: 1, z: 0 };
      this.orbitGroup.rotation.x += axis.x * (this.config.orbitSpeed || 0.2) * 0.005;
      this.orbitGroup.rotation.y += axis.y * (this.config.orbitSpeed || 0.2) * 0.005;
      this.orbitGroup.rotation.z += axis.z * (this.config.orbitSpeed || 0.2) * 0.005;
    }

    this.renderer.render(this.scene, this.camera);
  };

  updateConfig(newConfig: Partial<ParticleConfig>) {
    const needsRecreate =
      newConfig.count !== undefined && newConfig.count !== this.config.count ||
      newConfig.pattern !== undefined && newConfig.pattern !== this.config.pattern ||
      newConfig.blending !== undefined && newConfig.blending !== this.config.blending;

    this.config = { ...this.config, ...newConfig };

    if (needsRecreate) {
      this.createParticles();
    } else if (this.particles) {
      const mat = this.particles.material as THREE.PointsMaterial;
      if (newConfig.size !== undefined) mat.size = newConfig.size;
      if (newConfig.opacity !== undefined) mat.opacity = newConfig.opacity;
      if (newConfig.color || newConfig.gradientEnd) {
        this.updateColors();
      }
    }
  }

  updateColors() {
    if (!this.particles) return;
    const colors = this.particles.geometry.attributes.color.array as Float32Array;
    const c1 = new THREE.Color(this.config.color);
    const c2 = this.config.gradientEnd ? new THREE.Color(this.config.gradientEnd) : c1.clone();
    for (let i = 0; i < this.config.count; i++) {
      const t = i / this.config.count;
      const lerpColor = c1.clone().lerp(c2, t + (Math.random() - 0.5) * 0.3);
      colors[i * 3] = lerpColor.r;
      colors[i * 3 + 1] = lerpColor.g;
      colors[i * 3 + 2] = lerpColor.b;
    }
    this.particles.geometry.attributes.color.needsUpdate = true;
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

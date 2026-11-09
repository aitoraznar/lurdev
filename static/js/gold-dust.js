// Gold dust background: soft golden particles drifting over deep blue.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bgCanvas');

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  } catch (e) {
    canvas.style.display = 'none';
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 800;
  const COUNT = isMobile ? 1000 : 2500;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a3560, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 10;

  // Particle attributes: position in a box, random seed, size and colour mix.
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);
  const tints = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    seeds[i] = Math.random() * 100;
    sizes[i] = 0.4 + Math.pow(Math.random(), 3) * 2.2; // mostly small, a few large
    tints[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uGold: { value: new THREE.Color('#f0c244') },
    uChampagne: { value: new THREE.Color('#fff1c9') },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSeed;
      attribute float aSize;
      attribute float aTint;
      varying float vTwinkle;
      varying float vTint;
      varying float vDepth;

      void main() {
        vec3 p = position;
        // Slow upward drift, wrapped inside the box height (20 units).
        p.y = mod(p.y + uTime * (0.15 + fract(aSeed) * 0.25) + 10.0, 20.0) - 10.0;
        // Gentle sideways sway.
        p.x += sin(uTime * 0.3 + aSeed) * 0.6;
        p.z += cos(uTime * 0.2 + aSeed * 1.3) * 0.4;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * 22.0 * uPixelRatio / -mv.z;

        vTwinkle = 0.55 + 0.45 * sin(uTime * (1.0 + fract(aSeed * 7.0) * 2.0) + aSeed * 3.0);
        vTint = aTint;
        vDepth = clamp((mv.z + 22.0) / 16.0, 0.25, 1.0); // fade far particles
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uGold;
      uniform vec3 uChampagne;
      varying float vTwinkle;
      varying float vTint;
      varying float vDepth;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = smoothstep(0.5, 0.0, d);
        glow = pow(glow, 2.2);
        vec3 color = mix(uGold, uChampagne, step(0.8, vTint) * 0.7);
        float alpha = glow * vTwinkle * vDepth * 0.85;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(color * alpha, alpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse parallax (pointer devices only).
  const target = { x: 0, y: 0 };
  if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  if (reducedMotion) {
    uniforms.uTime.value = 12;
    renderer.render(scene, camera);
    window.addEventListener('resize', () => renderer.render(scene, camera));
    return;
  }

  const clock = new THREE.Clock();
  let running = true;

  function frame() {
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();
    camera.position.x += (target.x * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (-target.y * 0.8 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    points.rotation.y = uniforms.uTime.value * 0.01;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
      clock.stop();
    } else if (!running) {
      running = true;
      clock.start();
      requestAnimationFrame(frame);
    }
  });

  requestAnimationFrame(frame);
}

if (canvas) init();

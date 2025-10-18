/**
 * render.js - Three.js helpers (module imports use CDN)
 */
import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.148.0/examples/jsm/controls/OrbitControls.js';

export function initThreeJS() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 1e15);
  camera.position.set(0, 5e11, 2e12);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  // lights
  const ambient = new THREE.AmbientLight(0x999999, 0.6);
  scene.add(ambient);
  const sunLight = new THREE.PointLight(0xffffff, 2.0, 0);
  sunLight.position.set(0,0,0);
  scene.add(sunLight);

  window.addEventListener('resize', ()=> {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}

/**
 * Create a planet mesh. radius is visual; not to scale realistically for viewing.
 */
export function createPlanetMesh(radiusMeters, colorHex=0xffffff) {
  // convert radiusMeters to a display radius (cube root scaling) for visibility
  const display = Math.cbrt(radiusMeters) * 2e-5 + 1.2;
  const geom = new THREE.SphereGeometry(display, 24, 16);
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, metalness:0.1, roughness:0.8 });
  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}

export function updatePlanetMesh(mesh, body) {
  mesh.position.copy(body.position);
}

export function createArrow(color=0x00ff00) {
  const dir = new THREE.Vector3(1,0,0);
  const origin = new THREE.Vector3(0,0,0);
  const length = 0.1;
  const arrow = new THREE.ArrowHelper(dir, origin, length, color);
  arrow.visible = false;
  return arrow;
}

export function updateArrow(arrow, position, vector, scale=1) {
  const len = vector.length();
  if (len < 1e-6) { arrow.visible = false; return; }
  arrow.visible = true;
  arrow.position.copy(position);
  arrow.setDirection(vector.clone().normalize());
  arrow.setLength(len * scale, Math.max(len*scale*0.2, 0.1), Math.max(len*scale*0.2,0.1));
}

export function createOrbitLine(color=0xffffff) {
  const geom = new THREE.BufferGeometry();
  const mat = new THREE.LineBasicMaterial({ color: color });
  const line = new THREE.Line(geom, mat);
  line.frustumCulled = false;
  return line;
}

export function updateOrbitLine(line, points) {
  if (!points || points.length < 2) { line.visible = false; return; }
  line.visible = true;
  const positions = new Float32Array(points.length * 3);
  for (let i=0;i<points.length;i++){
    positions[i*3] = points[i].x;
    positions[i*3+1] = points[i].y;
    positions[i*3+2] = points[i].z;
  }
  line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  line.geometry.computeBoundingSphere();
}

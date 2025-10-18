/**
 * main.js - wires everything together and adds default 9-body solar system
 */
import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';
import { Body, integrate, G } from './physics.js';
import { initThreeJS, createPlanetMesh, updatePlanetMesh, createArrow, updateArrow, createOrbitLine, updateOrbitLine } from './render.js';
import { initUI, updateDebugTable } from './ui.js';

const { scene, camera, renderer, controls } = initThreeJS();

const bodies = [];
const meshes = [];
const velArrows = [];
const accArrows = [];
const trails = [];
const orbitLines = [];

let debugMode = false;

// helper to add body and visuals
function addBody(name, mass, radiusVisual, position, velocity) {
  const body = new Body(name, mass, position, velocity);
  bodies.push(body);
  // visual mesh
  const color = Math.floor(Math.random()*0xffffff);
  const mesh = createPlanetMesh(radiusVisual, color);
  mesh.position.copy(position);
  scene.add(mesh);
  meshes.push(mesh);
  // arrows
  const va = createArrow(0x00ff00);
  const aa = createArrow(0xff0000);
  scene.add(va); scene.add(aa);
  velArrows.push(va); accArrows.push(aa);
  // trail and line
  trails.push([]);
  const line = createOrbitLine(color);
  scene.add(line);
  orbitLines.push(line);
}

// Clear all except Sun (index 0)
function clearAllExceptSun() {
  // remove meshes from scene
  for (let i = 1; i < meshes.length; i++) {
    scene.remove(meshes[i]);
    scene.remove(velArrows[i]);
    scene.remove(accArrows[i]);
    scene.remove(orbitLines[i]);
  }
  // keep arrays to only Sun
  if (bodies.length > 1) {
    const keep = bodies[0];
    bodies.length = 1;
    meshes.length = 1;
    velArrows.length = 1;
    accArrows.length = 1;
    trails.length = 1;
    orbitLines.length = 1;
  }
}

// wire UI
initUI((nameOrCmd, mass, radiusVisual, pos, vel) => {
  if (nameOrCmd === '__CLEAR__') { clearAllExceptSun(); return; }
  addBody(nameOrCmd, mass, radiusVisual, pos, vel);
}, (on) => { debugMode = on; });

// Add default Sun + 8 planets
function addDefaultSolarSystem() {
  // masses (kg) and radius (m visual hint); distances in meters
  const AU = 1.495978707e11;
  const sunMass = 1.98847e30;
  addBody('Sun', sunMass, 6.9634e8, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
  const planets = [
    {name:'Mercury', mass:3.3011e23, a:0.387*AU},
    {name:'Venus',   mass:4.8675e24, a:0.723*AU},
    {name:'Earth',   mass:5.97237e24,a:1.0*AU},
    {name:'Mars',    mass:6.4171e23, a:1.524*AU},
    {name:'Jupiter', mass:1.8982e27, a:5.204*AU},
    {name:'Saturn',  mass:5.6834e26, a:9.582*AU},
    {name:'Uranus',  mass:8.6810e25, a:19.201*AU},
    {name:'Neptune', mass:1.02413e26,a:30.047*AU}
  ];
  for (let p of planets) {
    // position at +x axis
    const pos = new THREE.Vector3(p.a, 0, 0);
    // approximate circular velocity around Sun: v = sqrt(G*M_sun / r)
    const vMag = Math.sqrt(G * sunMass / p.a);
    const vel = new THREE.Vector3(0, vMag, 0); // along +y
    addBody(p.name, p.mass, Math.max(p.a*1e-6, 6e6), pos, vel);
  }
}
addDefaultSolarSystem();

// simulation timestep (seconds). Use scaled step so simulation is visible.
const timeStep = 60 * 60 * 6; // 6 hours per simulation step

function animate() {
  requestAnimationFrame(animate);
  // integrate physics
  integrate(bodies, timeStep);
  // update visuals
  for (let i=0;i<bodies.length;i++){
    const b = bodies[i];
    updatePlanetMesh(meshes[i], b);
    // arrows
    if (debugMode) {
      updateArrow(velArrows[i], b.position, b.velocity, 1e-7);
      updateArrow(accArrows[i], b.position, b.acceleration, 1e6);
    } else {
      velArrows[i].visible = false;
      accArrows[i].visible = false;
    }
    // trail
    trails[i].push(b.position.clone());
    if (trails[i].length > 600) trails[i].shift();
    updateOrbitLine(orbitLines[i], trails[i]);
  }
  // debug table
  if (debugMode) {
    // pick largest mass as central
    let central = bodies[0];
    for (let bb of bodies) if (bb.mass > central.mass) central = bb;
    const data = [];
    for (let bb of bodies) {
      if (bb === central) continue;
      const dist = bb.position.distanceTo(central.position);
      const T = 2*Math.PI*Math.sqrt(Math.pow(dist,3) / (G * (central.mass + bb.mass)));
      const yrs = T / (3600*24*365);
      data.push({name: bb.name, distance: dist.toExponential(3), period: yrs.toFixed(2)});
    }
    updateDebugTable(data);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

/**
 * physics.js
 * N-body gravitational physics using velocity-Verlet (leapfrog) integration.
 * Units: meters, kilograms, seconds (SI)
 */
import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';

export const G = 6.67430e-11; // gravitational constant

export class Body {
  static nextId = 1;
  constructor(name, mass, position, velocity) {
    this.id = Body.nextId++;
    this.name = name || ('Body ' + this.id);
    this.mass = mass; // kg
    this.position = position.clone(); // THREE.Vector3 (m)
    this.velocity = velocity.clone(); // THREE.Vector3 (m/s)
    this.acceleration = new THREE.Vector3(); // m/s^2
  }
  distanceTo(other) { return this.position.distanceTo(other.position); }
}

export function computeAccelerations(bodies) {
  // reset accelerations
  for (let b of bodies) b.acceleration.set(0,0,0);
  const n = bodies.length;
  for (let i=0;i<n;i++){
    for (let j=i+1;j<n;j++){
      const bi = bodies[i], bj = bodies[j];
      const r = new THREE.Vector3().subVectors(bj.position, bi.position);
      const distSq = r.lengthSq();
      if (distSq === 0) continue;
      const dist = Math.sqrt(distSq);
      const forceMag = G * bi.mass * bj.mass / distSq;
      const forceDir = r.clone().divideScalar(dist); // unit vector
      // a = F/m
      bi.acceleration.add(forceDir.clone().multiplyScalar(forceMag / bi.mass));
      bj.acceleration.add(forceDir.clone().multiplyScalar(-forceMag / bj.mass));
    }
  }
}

export function integrate(bodies, dt) {
  if (bodies.length === 0) return;
  // initial accelerations
  computeAccelerations(bodies);
  // half kick and drift
  for (let b of bodies) {
    // v += a * (dt/2)
    const half = b.acceleration.clone().multiplyScalar(dt * 0.5);
    b.velocity.add(half);
    // r += v * dt
    b.position.add(b.velocity.clone().multiplyScalar(dt));
  }
  // recompute accelerations
  computeAccelerations(bodies);
  // finish velocity
  for (let b of bodies) {
    const half = b.acceleration.clone().multiplyScalar(dt * 0.5);
    b.velocity.add(half);
  }
}

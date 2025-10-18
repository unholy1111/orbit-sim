/**
 * ui.js - builds the left-hand editor & debug UI
 */
import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';

export function initUI(onAddPlanet, onToggleDebug) {
  const ui = document.getElementById('ui');
  ui.innerHTML = `
    <h3>Orbit Simulator — Editor</h3>
    <div class="small">Units: meters (m), kilograms (kg), meters/sec (m/s)</div>
    <label> Name: <input id="nameInput" type="text" value="New"></label>
    <label> Mass (kg): <input id="massInput" type="number" value="5.97237e24" step="1e22"></label>
    <label> Radius (m, visual): <input id="radiusInput" type="number" value="6.371e6" step="1e5"></label>
    <label> Position X (m): <input id="posX" type="number" value="1.496e11"></label>
    <label> Position Y (m): <input id="posY" type="number" value="0"></label>
    <label> Position Z (m): <input id="posZ" type="number" value="0"></label>
    <label> Velocity VX (m/s): <input id="velX" type="number" value="0"></label>
    <label> Velocity VY (m/s): <input id="velY" type="number" value="29780"></label>
    <label> Velocity VZ (m/s): <input id="velZ" type="number" value="0"></label>
    <button id="addBtn">Add Planet</button>
    <button id="clearBtn" class="secondary">Clear All (keeps Sun)</button>
    <label style="margin-top:8px;"><input id="debugToggle" type="checkbox"> Debug Mode (vectors & table)</label>
    <h3>Debug Info</h3>
    <div id="debugInfo" style="display:none;">
      <table id="debugTable">
        <thead><tr><th>Body</th><th>Dist (m)</th><th>Period (yr)</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="footer">Tip: drag to rotate the view. Use editor to add planets.</div>
  `;
  // handlers
  document.getElementById('addBtn').addEventListener('click', ()=> {
    const name = document.getElementById('nameInput').value || 'New';
    const mass = parseFloat(document.getElementById('massInput').value);
    const radius = parseFloat(document.getElementById('radiusInput').value);
    const px = parseFloat(document.getElementById('posX').value);
    const py = parseFloat(document.getElementById('posY').value);
    const pz = parseFloat(document.getElementById('posZ').value);
    const vx = parseFloat(document.getElementById('velX').value);
    const vy = parseFloat(document.getElementById('velY').value);
    const vz = parseFloat(document.getElementById('velZ').value);
    if (!isFinite(mass) || mass <= 0) { alert('Enter a valid mass > 0'); return; }
    const pos = new THREE.Vector3(px,py,pz);
    const vel = new THREE.Vector3(vx,vy,vz);
    onAddPlanet(name, mass, radius, pos, vel);
  });
  document.getElementById('clearBtn').addEventListener('click', ()=> {
    if (!confirm('Clear all planets except the Sun?')) return;
    // signal with special call
    onAddPlanet('__CLEAR__');
  });

  document.getElementById('debugToggle').addEventListener('change', (e)=> {
    const on = e.target.checked;
    document.getElementById('debugInfo').style.display = on ? 'block' : 'none';
    onToggleDebug(on);
  });
}

export function updateDebugTable(list) {
  const tbody = document.querySelector('#debugTable tbody');
  tbody.innerHTML = '';
  for (let item of list) {
    const tr = document.createElement('tr');
    const a = document.createElement('td'); a.textContent = item.name;
    const b = document.createElement('td'); b.textContent = item.distance;
    const c = document.createElement('td'); c.textContent = item.period;
    tr.appendChild(a); tr.appendChild(b); tr.appendChild(c);
    tbody.appendChild(tr);
  }
}

Orbit Simulator - Ready to Deploy

Files included:
- index.html
- style.css
- main.js
- physics.js
- render.js
- ui.js

How to run:
1) Locally: start a simple HTTP server in the folder (python -m http.server 8000) and open http://localhost:8000
2) Deploy: upload the entire folder to GitHub Pages, Netlify (drop), or Vercel.
   The app uses Three.js from a CDN so no build step is required.

Notes:
- The default scene contains the Sun + 8 planets (Mercury->Neptune) with approximate masses and circular initial velocities.
- Toggle 'Debug Mode' in the left panel to view velocity/acceleration vectors and orbital period estimates.

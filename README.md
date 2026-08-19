# Pong — munni-team

A simple Pong game built with HTML, CSS and JavaScript.

Files
- `index.html` — game page with a canvas element.
- `style.css` — styles and layout.
- `script.js` — game logic: ball, paddles, input handling, AI, scoring.

How to play
- Open index.html in a browser (double-click or host with a local server).
- Controls:
  - Move your mouse over the canvas to control the left paddle.
  - Or use the Up / Down arrow keys to move the left paddle.
  - Click the canvas (or press Space) to start or resume the game.
- The right paddle is controlled by a simple AI.
- The scoreboard above the canvas shows Player : Computer scores.

Run locally (recommended)
1. Clone the repo:
   ```bash
   git clone https://github.com/munni-techie-21/munni-team.git
   cd munni-team
   ```
2. Open `index.html` in your browser or start a simple HTTP server (recommended for some browsers):
   ```bash
   # Python 3
   python -m http.server 8000
   # then open http://localhost:8000
   ```

Notes and ideas
- The code is intentionally small and easy to modify. You can tweak paddle sizes, ball speed, or AI difficulty in `script.js`.
- Possible enhancements: add sound effects, mobile touch controls, a start screen, or game settings.

License
This repository is provided as-is. You can use or modify the code freely. If you want a specific license added (MIT, Apache-2.0, etc.), tell me and I will add it.

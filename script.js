// Simple Pong implementation
// Controls: mouse over canvas or ArrowUp/ArrowDown to move left paddle
// Click canvas to start/restart game

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const playerScoreEl = document.getElementById('playerScore');
  const computerScoreEl = document.getElementById('computerScore');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  // Paddle settings
  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 90;
  const PADDLE_PADDING = 10;
  const PLAYER_X = PADDLE_PADDING;
  const COMPUTER_X = WIDTH - PADDLE_PADDING - PADDLE_WIDTH;

  // Ball settings
  const BALL_SIZE = 12;
  const BALL_SPEED = 5; // base speed (will increase slightly over time)

  // Game state
  let playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
  let computerY = (HEIGHT - PADDLE_HEIGHT) / 2;

  let upPressed = false;
  let downPressed = false;

  let ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: (Math.random() * 4 - 2),
    size: BALL_SIZE
  };

  let playerScore = 0;
  let computerScore = 0;

  let running = false; // paused until player clicks
  let lastTime = null;

  // Reset ball to center and give it a random direction towards the last scorer or random
  function resetBall(toPlayer = null) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    const speed = BALL_SPEED;
    // If toPlayer === 'player', send ball to player (computer just scored), otherwise to computer or random
    let dir = Math.random() > 0.5 ? 1 : -1;
    if (toPlayer === 'player') dir = -1;
    if (toPlayer === 'computer') dir = 1;
    ball.vx = speed * dir;
    ball.vy = (Math.random() * 4 - 2);
  }

  function drawRect(x, y, w, h, color = '#00e5ff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawBall() {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawNet() {
    const segment = 12;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    let y = 0;
    while (y < HEIGHT) {
      ctx.fillRect((WIDTH - 2) / 2, y, 2, segment);
      y += segment * 2;
    }
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  // Paddle collision detection: returns true if ball collides with paddle
  function paddleCollision(px, py, pw, ph) {
    const bx = ball.x;
    const by = ball.y;
    const r = ball.size / 2;
    // AABB-circle overlap (approx)
    const closestX = clamp(bx, px, px + pw);
    const closestY = clamp(by, py, py + ph);
    const dx = bx - closestX;
    const dy = by - closestY;
    return dx * dx + dy * dy <= r * r;
  }

  function update(dt) {
    // Move player paddle by keyboard
    const PADDLE_SPEED = 6; // px per frame approx
    if (upPressed) playerY -= PADDLE_SPEED;
    if (downPressed) playerY += PADDLE_SPEED;

    // Keep player paddle on screen
    playerY = clamp(playerY, 0, HEIGHT - PADDLE_HEIGHT);

    // Simple AI: move computer paddle toward ball with limited speed
    const COMPUTER_SPEED = 4.2;
    // center of paddles
    const compCenter = computerY + PADDLE_HEIGHT / 2;
    if (ball.y < compCenter - 8) {
      computerY -= COMPUTER_SPEED;
    } else if (ball.y > compCenter + 8) {
      computerY += COMPUTER_SPEED;
    }
    computerY = clamp(computerY, 0, HEIGHT - PADDLE_HEIGHT);

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom collision
    if (ball.y - ball.size / 2 <= 0) {
      ball.y = ball.size / 2;
      ball.vy = -ball.vy;
    } else if (ball.y + ball.size / 2 >= HEIGHT) {
      ball.y = HEIGHT - ball.size / 2;
      ball.vy = -ball.vy;
    }

    // Left paddle collision
    if (ball.vx < 0 && paddleCollision(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
      // reflect
      ball.x = PLAYER_X + PADDLE_WIDTH + ball.size / 2; // push out
      // Compute hit position relative to paddle center (-1 .. 1)
      const relativeY = (ball.y - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const bounceAngle = relativeY * (Math.PI / 4); // max 45 degrees
      const speed = Math.hypot(ball.vx, ball.vy) * 1.03; // slight speed up
      ball.vx = Math.abs(Math.cos(bounceAngle) * speed); // send right
      ball.vy = Math.sin(bounceAngle) * speed;
    }

    // Right paddle collision
    if (ball.vx > 0 && paddleCollision(COMPUTER_X, computerY, PADDLE_WIDTH, PADDLE_HEIGHT)) {
      ball.x = COMPUTER_X - ball.size / 2; // push out
      const relativeY = (ball.y - (computerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
      const bounceAngle = relativeY * (Math.PI / 4);
      const speed = Math.hypot(ball.vx, ball.vy) * 1.03;
      ball.vx = -Math.abs(Math.cos(bounceAngle) * speed); // send left
      ball.vy = Math.sin(bounceAngle) * speed;
    }

    // Score: left edge (computer scores), right edge (player scores)
    if (ball.x - ball.size / 2 <= 0) {
      computerScore++;
      computerScoreEl.textContent = computerScore;
      running = false;
      resetBall('player'); // send to player on restart
    } else if (ball.x + ball.size / 2 >= WIDTH) {
      playerScore++;
      playerScoreEl.textContent = playerScore;
      running = false;
      resetBall('computer');
    }
  }

  function render() {
    // clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // background (subtle)
    ctx.fillStyle = 'rgba(2,6,23,0.45)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawNet();

    // paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#00e5ff');
    drawRect(COMPUTER_X, computerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#ff7a7a');

    // ball
    drawBall();
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (running) {
      update(dt);
    }

    render();
    requestAnimationFrame(loop);
  }

  // Input handlers
  // Mouse: track mouse y relative to canvas and center paddle at that position
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    // center paddle on mouse
    playerY = clamp(y - PADDLE_HEIGHT / 2, 0, HEIGHT - PADDLE_HEIGHT);
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'Up') {
      upPressed = true;
      e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
      downPressed = true;
      e.preventDefault();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      // space toggles running
      running = !running;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'Up') {
      upPressed = false;
    } else if (e.key === 'ArrowDown' || e.key === 'Down') {
      downPressed = false;
    }
  });

  // Click canvas to start / restart
  canvas.addEventListener('click', () => {
    running = true;
    // only set lastTime on resuming so animation time delta is okay
    lastTime = performance.now();
  });

  // Initialize scoreboard
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;

  // Kick off the render loop (paused until click)
  requestAnimationFrame(loop);

  // Expose a resize helper in case you want to adapt canvas size to CSS later
  window.pong = {
    reset: () => {
      playerScore = 0;
      computerScore = 0;
      playerScoreEl.textContent = playerScore;
      computerScoreEl.textContent = computerScore;
      resetBall();
    }
  };

})();

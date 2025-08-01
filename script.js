class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.setupCanvas();

    this.gameState = "start"; // start, playing, paused, gameOver
    this.score = 0;
    this.lives = 3;
    this.level = 1;

    this.player = new Player(this.canvas.width / 2, this.canvas.height - 60);
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.stars = [];
    this.powerUps = [];

    this.keys = {};
    this.lastTime = 0;
    this.enemySpawnTimer = 0;
    this.enemySpawnRate = 2000; // milliseconds
    this.powerUpSpawnTimer = 0;
    this.powerUpSpawnRate = 15000; // 15 seconds

    // Level up system
    this.levelUpMessage = null;
    this.levelUpTimer = 0;
    this.levelUpDuration = 3000; // 3 seconds

    this.setupEventListeners();
    this.createStarField();
    this.gameLoop();
  }

  setupCanvas() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: Use much more of the screen space
      const availableWidth = window.innerWidth - 10; // Minimal margin
      const availableHeight = window.innerHeight - 120; // Account for UI and browser chrome

      // Use most of the available space while maintaining playability
      this.canvas.width = Math.max(320, Math.min(availableWidth, 500));
      this.canvas.height = Math.max(
        500,
        Math.min(availableHeight, availableWidth * 1.4)
      );

      // Ensure we don't exceed screen bounds
      if (this.canvas.height > availableHeight) {
        this.canvas.height = availableHeight;
        this.canvas.width = Math.min(
          this.canvas.width,
          this.canvas.height * 0.8
        );
      }
    } else {
      // Desktop: Keep original sizing
      const maxWidth = Math.min(800, window.innerWidth - 40);
      const maxHeight = Math.min(600, window.innerHeight - 40);

      this.canvas.width = Math.max(320, maxWidth);
      this.canvas.height = Math.max(400, maxHeight);
    }
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "Space") {
        e.preventDefault();
      }
      if (e.code === "Escape") {
        e.preventDefault();
        // Check if developer modal is open first
        if (
          !document
            .getElementById("developerModal")
            .classList.contains("hidden")
        ) {
          this.hideDeveloperModal();
        } else if (this.gameState === "playing") {
          this.pauseGame();
        } else if (this.gameState === "paused") {
          this.resumeGame();
        }
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // UI events
    document.getElementById("startBtn").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("restartBtn").addEventListener("click", () => {
      this.restartGame();
    });

    document.getElementById("resumeBtn").addEventListener("click", () => {
      this.resumeGame();
    });

    document
      .getElementById("restartFromPauseBtn")
      .addEventListener("click", () => {
        this.restartFromPause();
      });

    document.getElementById("mainMenuBtn").addEventListener("click", () => {
      this.goToMainMenu();
    });

    // Developer button events - using a more direct approach
    this.setupDeveloperModal();

    // Touch controls for mobile
    this.setupTouchControls();

    // Resize handler
    window.addEventListener("resize", () => {
      this.setupCanvas();
    });
  }

  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;
    let useDirectControl = false; // Flag for direct vs relative control

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      touchStartX = touchX;
      touchStartY = touchY;
      isTouching = true;

      // Check if touch is near the player (within 100px) for relative control
      const distanceToPlayer = Math.sqrt(
        Math.pow(touchX - this.player.x, 2) +
          Math.pow(touchY - this.player.y, 2)
      );

      useDirectControl = distanceToPlayer > 100;

      // Auto-fire when touching
      if (this.gameState === "playing") {
        this.keys["Space"] = true;
      }
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!isTouching || this.gameState !== "playing") return;

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const currentX = touch.clientX - rect.left;
      const currentY = touch.clientY - rect.top;

      if (useDirectControl) {
        // Direct control: Move player towards touch position with smooth interpolation
        const targetX = Math.max(
          this.player.size,
          Math.min(this.canvas.width - this.player.size, currentX)
        );
        const targetY = Math.max(
          this.player.size,
          Math.min(this.canvas.height - this.player.size, currentY)
        );

        // Smooth movement towards touch position
        const lerpFactor = 0.2; // Adjust for smoothness (0.1 = smooth, 0.5 = snappy)
        this.player.x += (targetX - this.player.x) * lerpFactor;
        this.player.y += (targetY - this.player.y) * lerpFactor;
      } else {
        // Relative control: Move based on touch movement with very high sensitivity
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;

        // Very high sensitivity for responsive control
        const sensitivity = 1.5;

        if (Math.abs(deltaX) > 1) {
          this.player.x = Math.max(
            this.player.size,
            Math.min(
              this.canvas.width - this.player.size,
              this.player.x + deltaX * sensitivity
            )
          );
          touchStartX = currentX;
        }

        if (Math.abs(deltaY) > 1) {
          this.player.y = Math.max(
            this.player.size,
            Math.min(
              this.canvas.height - this.player.size,
              this.player.y + deltaY * sensitivity
            )
          );
          touchStartY = currentY;
        }
      }
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      isTouching = false;
      this.keys["Space"] = false;
    });

    // Prevent scrolling on mobile
    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.target === this.canvas) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  createStarField() {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
  }

  startGame() {
    this.gameState = "playing";
    document.getElementById("startScreen").classList.add("hidden");
    this.resetGame();
  }

  restartGame() {
    this.gameState = "playing";
    document.getElementById("gameOver").classList.add("hidden");
    this.resetGame();
  }

  pauseGame() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      document.getElementById("pauseMenu").classList.remove("hidden");
    }
  }

  resumeGame() {
    this.gameState = "playing";
    document.getElementById("pauseMenu").classList.add("hidden");
  }

  restartFromPause() {
    this.gameState = "playing";
    document.getElementById("pauseMenu").classList.add("hidden");
    this.resetGame();
  }

  goToMainMenu() {
    this.gameState = "start";
    document.getElementById("pauseMenu").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
  }

  setupDeveloperModal() {
    const developerBtn = document.getElementById("developerBtn");
    const modal = document.getElementById("developerModal");
    const closeBtn = document.getElementById("closeModal");
    const modalContent = document.getElementById("modalContent");

    if (developerBtn) {
      developerBtn.onclick = () => {
        console.log("Developer button clicked");
        this.showDeveloperModal();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        console.log("Close button clicked");
        this.hideDeveloperModal();
      };
    }

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          console.log("Modal background clicked");
          this.hideDeveloperModal();
        }
      };
    }

    if (modalContent) {
      modalContent.onclick = (e) => {
        e.stopPropagation();
      };
    }
  }

  showDeveloperModal() {
    console.log("Showing developer modal");
    const modal = document.getElementById("developerModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.style.display = "flex";
    }
  }

  hideDeveloperModal() {
    console.log("Hiding developer modal");
    const modal = document.getElementById("developerModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
  }

  resetGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.powerUps = [];
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 60);
    this.enemySpawnTimer = 0;
    this.powerUpSpawnTimer = 0;
    this.levelUpMessage = null;
    this.levelUpTimer = 0;
    this.updateUI();
  }

  levelUp() {
    this.level++;

    // Progressive difficulty increases
    this.increaseDifficulty();

    // Show level up message
    this.levelUpMessage = `LEVEL ${this.level}!`;
    this.levelUpTimer = this.levelUpDuration;

    // Give special level up rewards
    this.giveLevelUpRewards();

    // Create celebration particles
    this.createLevelUpEffects();

    this.updateUI();
  }

  increaseDifficulty() {
    // Faster enemy spawning
    this.enemySpawnRate = Math.max(400, this.enemySpawnRate - 150);

    // Every few levels, make additional changes
    if (this.level % 2 === 0) {
      // Slightly reduce power-up spawn rate to increase challenge
      this.powerUpSpawnRate = Math.min(25000, this.powerUpSpawnRate + 1000);
    }

    // Special difficulty spikes at milestone levels
    if (this.level % 10 === 0) {
      this.enemySpawnRate = Math.max(300, this.enemySpawnRate - 100);
      this.levelUpMessage = `LEVEL ${this.level}! INTENSE MODE!`;
    }
  }

  giveLevelUpRewards() {
    // Give player a random power-up
    const powerUpTypes = ["rapidFire", "shield", "multiShot", "speedBoost"];
    const randomPowerUp =
      powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    this.player.applyPowerUp(randomPowerUp);

    // Bonus points for leveling up
    this.score += 200;

    // Special rewards for milestone levels
    if (this.level % 5 === 0) {
      // Every 5 levels: Extra life
      this.lives++;
      this.levelUpMessage = `LEVEL ${this.level}! BONUS LIFE!`;
    } else if (this.level % 3 === 0) {
      // Every 3 levels: Multiple power-ups
      const secondPowerUp =
        powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      this.player.applyPowerUp(secondPowerUp);
      this.levelUpMessage = `LEVEL ${this.level}! DOUBLE POWER!`;
    }
  }

  createLevelUpEffects() {
    // Create celebration particles around the player
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      const x = this.player.x + Math.cos(angle) * distance;
      const y = this.player.y + Math.sin(angle) * distance;

      // Create golden celebration particles
      this.particles.push(new Particle(x, y, "#ffaa00"));
    }
  }

  updateUI() {
    document.getElementById("scoreValue").textContent = this.score;
    document.getElementById("livesValue").textContent = this.lives;
    document.getElementById("levelValue").textContent = this.level;
  }

  gameLoop(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    // Always update stars for background animation
    this.stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    });

    if (this.gameState !== "playing") return;

    // Handle input
    this.handleInput();

    // Update player
    this.player.update(deltaTime);

    // Update bullets
    this.bullets.forEach((bullet, index) => {
      bullet.update(deltaTime);
      if (bullet.y < 0) {
        this.bullets.splice(index, 1);
      }
    });

    // Spawn enemies
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer > this.enemySpawnRate) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // Update enemies
    this.enemies.forEach((enemy, index) => {
      enemy.update(deltaTime);
      if (enemy.y > this.canvas.height + 50) {
        this.enemies.splice(index, 1);
      }
    });

    // Spawn power-ups
    this.powerUpSpawnTimer += deltaTime;
    if (this.powerUpSpawnTimer > this.powerUpSpawnRate) {
      this.spawnPowerUp();
      this.powerUpSpawnTimer = 0;
      // Randomize next spawn time (10-20 seconds)
      this.powerUpSpawnRate = 10000 + Math.random() * 10000;
    }

    // Update power-ups
    this.powerUps.forEach((powerUp, index) => {
      powerUp.update(deltaTime);
      if (powerUp.y > this.canvas.height + 50) {
        this.powerUps.splice(index, 1);
      }
    });

    // Update particles
    this.particles.forEach((particle, index) => {
      particle.update(deltaTime);
      if (particle.life <= 0) {
        this.particles.splice(index, 1);
      }
    });

    // Check collisions
    this.checkCollisions();

    // Check level progression
    if (
      this.score > 0 &&
      this.score % 1000 === 0 &&
      this.score / 1000 > this.level - 1
    ) {
      this.levelUp();
    }

    // Update level up message timer
    if (this.levelUpMessage) {
      this.levelUpTimer -= deltaTime;
      if (this.levelUpTimer <= 0) {
        this.levelUpMessage = null;
      }
    }
  }

  handleInput() {
    const speed = this.player.hasSpeedBoost ? 8 : 5;

    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) {
      this.player.x = Math.max(this.player.size, this.player.x - speed);
    }
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) {
      this.player.x = Math.min(
        this.canvas.width - this.player.size,
        this.player.x + speed
      );
    }
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) {
      this.player.y = Math.max(this.player.size, this.player.y - speed);
    }
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) {
      this.player.y = Math.min(
        this.canvas.height - this.player.size,
        this.player.y + speed
      );
    }

    // Hold to fire
    if (this.keys["Space"]) {
      this.player.shoot(this.bullets);
    }
  }

  spawnEnemy() {
    const x = Math.random() * (this.canvas.width - 40) + 20;
    this.enemies.push(new Enemy(x, -30));
  }

  spawnPowerUp() {
    const x = Math.random() * (this.canvas.width - 60) + 30;
    const types = ["rapidFire", "shield", "multiShot", "speedBoost"];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push(new PowerUp(x, -30, type));
  }

  checkCollisions() {
    // Bullet-Enemy collisions
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.isColliding(bullet, enemy)) {
          // Create explosion particles
          this.createExplosion(enemy.x, enemy.y, "#ff4444");

          // Remove bullet and enemy
          this.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);

          // Increase score
          this.score += 100;
          this.updateUI();
        }
      });
    });

    // Player-Enemy collisions
    this.enemies.forEach((enemy, index) => {
      if (this.isColliding(this.player, enemy)) {
        // Create explosion
        this.createExplosion(enemy.x, enemy.y, "#ffff00");

        // Remove enemy
        this.enemies.splice(index, 1);

        // Decrease lives (unless player has shield)
        if (!this.player.hasShield) {
          this.lives--;
          this.updateUI();

          if (this.lives <= 0) {
            this.gameOver();
          }
        }
      }
    });

    // Player-PowerUp collisions
    this.powerUps.forEach((powerUp, index) => {
      if (this.isColliding(this.player, powerUp)) {
        // Create pickup particles
        this.createExplosion(powerUp.x, powerUp.y, powerUp.color);

        // Apply power-up effect
        this.player.applyPowerUp(powerUp.type);

        // Remove power-up
        this.powerUps.splice(index, 1);

        // Increase score
        this.score += 50;
        this.updateUI();
      }
    });
  }

  isColliding(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.size + obj2.size;
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  gameOver() {
    this.gameState = "gameOver";
    document.getElementById("finalScore").textContent = this.score;
    document.getElementById("gameOver").classList.remove("hidden");
  }

  render() {
    // Clear canvas properly to prevent color accumulation
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // Reduced opacity for subtle trail effect
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars
    this.stars.forEach((star) => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    if (this.gameState !== "playing" && this.gameState !== "paused") return;

    // Draw player
    this.player.draw(this.ctx);

    // Draw bullets
    this.bullets.forEach((bullet) => bullet.draw(this.ctx));

    // Draw enemies
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));

    // Draw power-ups
    this.powerUps.forEach((powerUp) => powerUp.draw(this.ctx));

    // Draw particles
    this.particles.forEach((particle) => particle.draw(this.ctx));

    // Draw level up message
    if (this.levelUpMessage && this.gameState === "playing") {
      this.drawLevelUpMessage();
    }

    // Draw pause overlay
    if (this.gameState === "paused") {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawLevelUpMessage() {
    this.ctx.save();

    // Calculate animation progress (0 to 1)
    const progress = 1 - this.levelUpTimer / this.levelUpDuration;
    const fadeProgress = this.levelUpTimer < 500 ? this.levelUpTimer / 500 : 1;

    // Animated scale and position
    const scale = 0.5 + progress * 0.5; // Grows from 0.5 to 1
    const y = this.canvas.height * 0.3 + (1 - progress) * 50; // Slides up

    // Set up text styling
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = `bold ${Math.floor(48 * scale)}px Orbitron`;

    // Glowing effect
    this.ctx.shadowColor = "#ffaa00";
    this.ctx.shadowBlur = 20;
    this.ctx.globalAlpha = fadeProgress;

    // Draw main text
    this.ctx.fillStyle = "#ffaa00";
    this.ctx.fillText(this.levelUpMessage, this.canvas.width / 2, y);

    // Draw outline
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeText(this.levelUpMessage, this.canvas.width / 2, y);

    // Draw subtitle if it's a special level
    if (this.level % 5 === 0 || this.level % 3 === 0) {
      this.ctx.font = `bold ${Math.floor(24 * scale)}px Orbitron`;
      this.ctx.fillStyle = "#00ffff";
      this.ctx.shadowColor = "#00ffff";
      this.ctx.shadowBlur = 15;

      let subtitle = "";
      if (this.level % 5 === 0) {
        subtitle = "+1 LIFE AWARDED!";
      } else if (this.level % 3 === 0) {
        subtitle = "DOUBLE POWER-UP!";
      }

      this.ctx.fillText(subtitle, this.canvas.width / 2, y + 60 * scale);
      this.ctx.strokeText(subtitle, this.canvas.width / 2, y + 60 * scale);
    }

    this.ctx.restore();
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 18; // Slightly larger for better rocket details
    this.shootCooldown = 0;
    this.shootRate = 150; // milliseconds - faster for hold-to-fire

    // Power-up states
    this.hasRapidFire = false;
    this.hasShield = false;
    this.hasMultiShot = false;
    this.hasSpeedBoost = false;
    this.powerUpTimers = {};
  }

  update(deltaTime) {
    this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);

    // Update power-up timers
    Object.keys(this.powerUpTimers).forEach((powerUp) => {
      this.powerUpTimers[powerUp] -= deltaTime;
      if (this.powerUpTimers[powerUp] <= 0) {
        this.removePowerUp(powerUp);
      }
    });
  }

  shoot(bullets) {
    const currentShootRate = this.hasRapidFire
      ? this.shootRate * 0.3
      : this.shootRate;

    if (this.shootCooldown <= 0) {
      if (this.hasMultiShot) {
        // Triple shot
        bullets.push(new Bullet(this.x - 10, this.y - this.size));
        bullets.push(new Bullet(this.x, this.y - this.size));
        bullets.push(new Bullet(this.x + 10, this.y - this.size));
      } else {
        bullets.push(new Bullet(this.x, this.y - this.size));
      }
      this.shootCooldown = currentShootRate;
    }
  }

  applyPowerUp(type) {
    const duration = 8000; // 8 seconds

    switch (type) {
      case "rapidFire":
        this.hasRapidFire = true;
        this.powerUpTimers.rapidFire = duration;
        break;
      case "shield":
        this.hasShield = true;
        this.powerUpTimers.shield = duration;
        break;
      case "multiShot":
        this.hasMultiShot = true;
        this.powerUpTimers.multiShot = duration;
        break;
      case "speedBoost":
        this.hasSpeedBoost = true;
        this.powerUpTimers.speedBoost = duration;
        break;
    }
  }

  removePowerUp(type) {
    switch (type) {
      case "rapidFire":
        this.hasRapidFire = false;
        break;
      case "shield":
        this.hasShield = false;
        break;
      case "multiShot":
        this.hasMultiShot = false;
        break;
      case "speedBoost":
        this.hasSpeedBoost = false;
        break;
    }
    delete this.powerUpTimers[type];
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Rocket exhaust/flames
    ctx.fillStyle = "#ff4400";
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.3, this.size * 0.8);
    ctx.lineTo(0, this.size * 1.5);
    ctx.lineTo(this.size * 0.3, this.size * 0.8);
    ctx.closePath();
    ctx.fill();

    // Inner flame
    ctx.fillStyle = "#ffaa00";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.2, this.size * 0.8);
    ctx.lineTo(0, this.size * 1.2);
    ctx.lineTo(this.size * 0.2, this.size * 0.8);
    ctx.closePath();
    ctx.fill();

    // Rocket body (main cylinder)
    ctx.fillStyle = "#cccccc";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 8;
    ctx.fillRect(
      -this.size * 0.4,
      -this.size * 0.2,
      this.size * 0.8,
      this.size * 1.2
    );

    // Rocket nose cone
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(-this.size * 0.4, -this.size * 0.2);
    ctx.lineTo(this.size * 0.4, -this.size * 0.2);
    ctx.closePath();
    ctx.fill();

    // Rocket fins
    ctx.fillStyle = "#888888";
    ctx.shadowBlur = 5;
    // Left fin
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.4, this.size * 0.6);
    ctx.lineTo(-this.size * 0.8, this.size * 1.0);
    ctx.lineTo(-this.size * 0.4, this.size * 1.0);
    ctx.closePath();
    ctx.fill();

    // Right fin
    ctx.beginPath();
    ctx.moveTo(this.size * 0.4, this.size * 0.6);
    ctx.lineTo(this.size * 0.8, this.size * 1.0);
    ctx.lineTo(this.size * 0.4, this.size * 1.0);
    ctx.closePath();
    ctx.fill();

    // Rocket details/windows
    ctx.fillStyle = "#0088ff";
    ctx.shadowColor = "#0088ff";
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(0, -this.size * 0.5, this.size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Body stripes
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(
      -this.size * 0.35,
      this.size * 0.1,
      this.size * 0.7,
      this.size * 0.1
    );
    ctx.fillRect(
      -this.size * 0.35,
      this.size * 0.4,
      this.size * 0.7,
      this.size * 0.1
    );

    // Power-up visual effects
    if (this.hasShield) {
      ctx.strokeStyle = "#00ff00";
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.hasRapidFire) {
      ctx.fillStyle = "#ff0000";
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 8;
      ctx.fillRect(
        -this.size * 0.1,
        -this.size * 1.2,
        this.size * 0.2,
        this.size * 0.3
      );
    }

    if (this.hasSpeedBoost) {
      ctx.save();
      ctx.strokeStyle = "#ffff00";
      ctx.shadowColor = "#ffff00";
      ctx.shadowBlur = 3; // Reduced from 10 to 3
      ctx.lineWidth = 1; // Reduced from 2 to 1
      ctx.globalAlpha = 0.6; // Make it semi-transparent
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * (1.2 + i * 0.2), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 3;
    this.speed = 8;
  }

  update(deltaTime) {
    this.y -= this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = "#ffff00";
    ctx.shadowColor = "#ffff00";
    ctx.shadowBlur = 5;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size * 2
    );
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 12;
    this.speed = 2 + Math.random() * 2;
    this.rotation = 0;
  }

  update(deltaTime) {
    this.y += this.speed;
    this.rotation += 0.02;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Enemy body
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(-this.size, this.size);
    ctx.lineTo(0, this.size * 0.5);
    ctx.lineTo(this.size, this.size);
    ctx.closePath();
    ctx.fill();

    // Enemy glow
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 8;
    ctx.stroke();

    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.life = 1;
    this.decay = 0.02;
    this.size = Math.random() * 4 + 2;
    this.color = color;
  }

  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    ctx.restore();
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 12;
    this.speed = 2;
    this.rotation = 0;
    this.pulseTimer = 0;

    // Set color and properties based on type
    switch (type) {
      case "rapidFire":
        this.color = "#ff0000";
        this.symbol = "R";
        break;
      case "shield":
        this.color = "#00ff00";
        this.symbol = "S";
        break;
      case "multiShot":
        this.color = "#ff00ff";
        this.symbol = "M";
        break;
      case "speedBoost":
        this.color = "#ffff00";
        this.symbol = "B";
        break;
    }
  }

  update(deltaTime) {
    this.y += this.speed;
    this.rotation += 0.05;
    this.pulseTimer += deltaTime * 0.005;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Pulsing glow effect
    const pulse = Math.sin(this.pulseTimer) * 0.3 + 0.7;

    // Outer glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8 * pulse; // Reduced from 15 to 8
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.4 * pulse; // Reduced from 0.6 to 0.4

    // Power-up body (hexagon)
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner core
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 3; // Reduced from 5 to 3
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Symbol
    ctx.fillStyle = this.color;
    ctx.font = `bold ${this.size}px Orbitron`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0;
    ctx.fillText(this.symbol, 0, 0);

    ctx.restore();
  }
}

// Initialize game when page loads
window.addEventListener("load", () => {
  new Game();
});

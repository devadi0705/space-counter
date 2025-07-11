const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let lives = 3;

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 5,
    color: '#00ffff'
};

// Game arrays
let bullets = [];
let enemies = [];
let particles = [];
let stars = [];

// Input handling
const keys = {};

// Initialize stars for background
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 2
        });
    }
}

// Create particle effect
function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

// Bullet class
function createBullet(x, y) {
    return {
        x: x,
        y: y,
        width: 4,
        height: 10,
        speed: 8,
        color: '#ffff00'
    };
}

// Enemy class
function createEnemy() {
    return {
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 30,
        height: 30,
        speed: Math.random() * 3 + 2,
        color: '#ff0080',
        health: 1
    };
}

// Draw alien enemies
function drawAlien(x, y) {
    // Main body (green oval)
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + 8, y + 10, 14, 12);
    ctx.fillRect(x + 10, y + 8, 10, 16);

    // Eyes (large black with white highlights)
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6, y + 6, 6, 8);
    ctx.fillRect(x + 18, y + 6, 6, 8);

    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 7, y + 7, 2, 2);
    ctx.fillRect(x + 19, y + 7, 2, 2);

    // Antennae
    ctx.fillStyle = '#00aa00';
    ctx.fillRect(x + 9, y + 4, 1, 4);
    ctx.fillRect(x + 20, y + 4, 1, 4);

    // Antennae tips
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + 8, y + 3, 3, 2);
    ctx.fillRect(x + 19, y + 3, 3, 2);

    // Mouth (small dark line)
    ctx.fillStyle = '#004400';
    ctx.fillRect(x + 13, y + 18, 4, 2);

    // Arms/tentacles
    ctx.fillStyle = '#00cc00';
    ctx.fillRect(x + 4, y + 12, 4, 2);
    ctx.fillRect(x + 22, y + 12, 4, 2);
    ctx.fillRect(x + 3, y + 14, 3, 2);
    ctx.fillRect(x + 24, y + 14, 3, 2);
}

// Draw player jet
function drawJet(x, y) {
    ctx.fillStyle = '#00ffff';

    // Main body
    ctx.fillRect(x + 12, y + 5, 6, 20);

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 13, y + 6, 4, 8);

    // Wings
    ctx.fillStyle = '#00aaaa';
    ctx.fillRect(x + 5, y + 15, 8, 3);
    ctx.fillRect(x + 17, y + 15, 8, 3);

    // Wing tips
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 3, y + 16, 3, 1);
    ctx.fillRect(x + 24, y + 16, 3, 1);

    // Engines
    ctx.fillStyle = '#666666';
    ctx.fillRect(x + 10, y + 22, 3, 5);
    ctx.fillRect(x + 17, y + 22, 3, 5);

    // Engine flames
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(x + 10, y + 27, 3, 3);
    ctx.fillRect(x + 17, y + 27, 3, 3);

    // Nose
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(x + 14, y + 2, 2, 3);
}

// Update game objects
function update() {
    if (!gameRunning) return;

    // Update player movement (keyboard or touch)
    if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchMoveLeft) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchMoveRight) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - player.speed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
    }
    // Touch shoot (fires once per touch)
    if (touchShoot && gameRunning) {
        bullets.push(createBullet(player.x + player.width / 2 - 2, player.y));
        touchShoot = false;
    }

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });

    // Update enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        return enemy.y < canvas.height + 50;
    });

    // Update particles
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.size *= 0.95;
        return particle.life > 0;
    });

    // Update stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = -5;
            star.x = Math.random() * canvas.width;
        }
    });

    // Check bullet-enemy collisions
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                // Create explosion effect
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff0080');

                // Remove bullet and enemy
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);

                // Increase score
                score += 10;
                document.getElementById('score').textContent = score;
            }
        });
    });

    // Check player-enemy collisions
    enemies.forEach((enemy, enemyIndex) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {

            // Create explosion effect
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff0080');
            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#00ffff');

            // Remove enemy and reduce lives
            enemies.splice(enemyIndex, 1);
            lives--;
            document.getElementById('lives').textContent = lives;

            if (lives <= 0) {
                gameOver();
            }
        }
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
        enemies.push(createEnemy());
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw particles
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
    ctx.globalAlpha = 1;

    // Draw player jet
    drawJet(player.x, player.y);

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies (aliens)
    enemies.forEach(enemy => {
        drawAlien(enemy.x, enemy.y);
    });
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('gameOver').style.display = 'block';
}

// Restart game
function restart() {
    gameRunning = true;
    score = 0;
    lives = 3;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('gameOver').style.display = 'none';
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Responsive canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Keep player within bounds after resize
    player.x = Math.min(Math.max(player.x, 0), canvas.width - player.width);
    player.y = Math.min(Math.max(player.y, 0), canvas.height - player.height);

    // Reposition stars within new bounds
    for (let star of stars) {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
    }
}

// Initial setup
resizeCanvas();

// Add resize event listener
window.addEventListener('resize', resizeCanvas);

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && gameRunning) {
        bullets.push(createBullet(player.x + player.width / 2 - 2, player.y));
        e.preventDefault();
    }

    if (e.key === 'r' || e.key === 'R') {
        restart();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Touch controls for mobile
let touchMoveLeft = false;
let touchMoveRight = false;
let touchShoot = false;

// Attach touch event listeners if touch controls exist
window.addEventListener('DOMContentLoaded', () => {
    const leftBtn = document.getElementById('left');
    const rightBtn = document.getElementById('right');
    const shootBtn = document.getElementById('shoot');
    if (leftBtn && rightBtn && shootBtn) {
        leftBtn.addEventListener('touchstart', e => { touchMoveLeft = true;
            e.preventDefault(); });
        leftBtn.addEventListener('touchend', e => { touchMoveLeft = false;
            e.preventDefault(); });
        rightBtn.addEventListener('touchstart', e => { touchMoveRight = true;
            e.preventDefault(); });
        rightBtn.addEventListener('touchend', e => { touchMoveRight = false;
            e.preventDefault(); });
        shootBtn.addEventListener('touchstart', e => { touchShoot = true;
            e.preventDefault(); });
        shootBtn.addEventListener('touchend', e => { touchShoot = false;
            e.preventDefault(); });
    }
});

// Initialize and start game
gameLoop();
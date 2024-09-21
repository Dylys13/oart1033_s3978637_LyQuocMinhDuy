let angle = 0;

let crosshair;
let land;
let pixeltank;
let bullet;
let boulders = [];
let bullets = [];
let canShoot = true;
let cooldown = 220;
let gameOver = false;
let score = 0;

let expandingCircle = {
  active: false,
  radius: 0,
  maxRadius: 0,
  color: [176, 0, 0],  
};

function preload() {
  crosshair = loadImage('crosshair.png');
  pixeltank = createImg('pixeltank.png');
  bullet = createImg('pixelbullet.png');
  boulderImage = loadImage('boulder.png');
  land = loadImage('land.png');
}

function setup() {
  createCanvas(1920, 1080);
  imageMode(CENTER);
}

function draw() {
  cursor(crosshair);
  image(land, width / 2, height / 2, width, height);

  if (expandingCircle.active) {
    displayExpandingCircle();
    return;
  }

  if (gameOver) {
    displayGameOver();
    return;
  }

  resetMatrix();


  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();

    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    }
  }


  for (let i = boulders.length - 1; i >= 0; i--) {
    boulders[i].update();
    boulders[i].display();


    for (let j = bullets.length - 1; j >= 0; j--) {
      if (boulders[i].hits(bullets[j])) {
        boulders.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        break;
      }
    }

    if (boulders[i].hasReachedCenter(width / 2, height / 2)) {
      startExpandingCircle();
    }
  }

  translate(width / 2, height / 2);
  rotate(angle);

  // Display the tank
  image(pixeltank, 0, 0, pixeltank.width / 2, pixeltank.height / 2);

  // Handle rotation
  if (keyIsDown(65)) angle -= 0.05;  // 'A' key
  if (keyIsDown(68)) angle += 0.05;  // 'D' key

  // Generate new boulders
  if (frameCount % 60 === 0) {
    boulders.push(new Boulder());
  }
}

function mousePressed() {
  if (mouseButton === LEFT && canShoot && !gameOver) {
    if (!keyIsDown(65) && !keyIsDown(68)) {
      let newBullet = new Bullet(width / 2, height / 2, angle);
      bullets.push(newBullet);
      canShoot = false;
      setTimeout(() => {
        canShoot = true;
      }, cooldown);
    }
  } else if (gameOver) {
    resetGame();
  }
}

function displayExpandingCircle() {
  noStroke();
  fill(expandingCircle.color);
  ellipse(width / 2, height / 2, expandingCircle.radius * 2);

  expandingCircle.radius += 20;  
  if (expandingCircle.radius >= expandingCircle.maxRadius) {
    gameOver = true;
    expandingCircle.active = false;  // Stop expanding
  }
}

function startExpandingCircle() {
  expandingCircle.active = true;
  expandingCircle.radius = 0;
  expandingCircle.maxRadius = dist(0, 0, width / 2, height / 2) * 2; 
}

function displayGameOver() {
  fill(255);
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(64);
  text("Game Over!", width / 2, height / 2);

  textSize(28);
  text("Click anywhere to restart", width / 2, height / 2 + 60);
  text("Total Score: " + score, width / 2, height / 2 + 120);
}

function resetGame() {
  bullets = [];
  boulders = [];
  angle = 0;
  score = 0;
  gameOver = false;
  expandingCircle.active = false;
  expandingCircle.radius = 0;
}

class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 10;
  }

  update() {
    this.x += this.speed * sin(this.angle);
    this.y -= this.speed * cos(this.angle);
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    image(bullet, 0, 0, bullet.width / 2, bullet.height / 2);
    pop();
  }

  offscreen() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }
}

class Boulder {
  constructor() {
    let side = random(['top', 'bottom', 'left', 'right']);
    if (side === 'top') {
      this.x = random(width);
      this.y = -100;
    } else if (side === 'bottom') {
      this.x = random(width);
      this.y = height + 100;
    } else if (side === 'left') {
      this.x = -100;
      this.y = random(height);
    } else {
      this.x = width + 100;
      this.y = random(height);
    }

    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.02, 0.02);
    this.speed = 1;
    this.radius = 50;
  }

  update() {
    let centerX = width / 2;
    let centerY = height / 2;
    let dirX = centerX - this.x;
    let dirY = centerY - this.y;
    let distance = dist(this.x, this.y, centerX, centerY);

    if (distance > 2) {
      this.x += dirX / distance * this.speed;
      this.y += dirY / distance * this.speed;
    }

    this.angle += this.rotationSpeed;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    image(boulderImage, 0, 0, 100, 100);
    pop();
  }

  offscreen() {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }

  hits(bullet) {
    let d = dist(this.x, this.y, bullet.x, bullet.y);
    return d < this.radius;
  }

  hasReachedCenter(centerX, centerY) {
    let d = dist(this.x, this.y, centerX, centerY);
    return d < this.radius;
  }
}

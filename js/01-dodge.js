
var
  width = 800,
  heigth = 500,
  xFrames,
  yFrames,
  platforms,
  player,
  cursors,
  projectiles,
  ground,
  lives,
  score     = 0,
  game      = new Phaser.Game(
    width,
    heigth,
    Phaser.AUTO,
    '',
    { preload: preload, create: create, update: update }
  ),
  levelText,
  scoreText,
  projectileText,
  messageText,
  level   = 0,
  levels  = {
    '0': {
      projectile: 10,
      max: 5,
      gravity: 100,
      chance: {
        rock: 1,
        star: 0,
        heart: .05
      },
      message: 'Those rocks look really heavy.\n   Better stay out of their way...'
    },
    1: {
      chance: {
        rock: 0,
        star: 1,
        heart: 0
      },
      projectile: 5,
      max: 3,
      message: 'But those stars look pretty'
    },
  };

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.image('rock', 'assets/meteorite.png');
  game.load.image('heart', 'assets/heart.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  }

function create() {
  xFrames = width / 32;
  yFrames = heigth /32;

  createWorld();
  createPlayer();

  projectiles = game.add.group();
  projectiles.enableBody = true;
  setTexts();
  bumpLevel();
}

function update() {
  if (stillAlive()) {
    game.physics.arcade.collide(player, platforms);
  }

  game.physics.arcade.collide(player, projectiles, hitPlayer, null, this);
  game.physics.arcade.collide(projectiles, platforms, crashProjectile, null, this);

  playerMove();
}

function setTexts() {
  var index = width / 12;

  scoreText = game.add.text(index * 1 , 16, 'Score: 0',
    {fontSize: '32px', fill: '#000'}
  );

  levelText = game.add.text( index * 5 , 16, '',
    {fontSize: '32px', fill: '#000'}
  );

  projectileText = game.add.text(index * 9 , 16, '',
    {fontSize: '32px', fill: '#000'}
  );

  messageText = game.add.text(index * 4 , heigth / 3 , '',
    {fontSize: '48px', fill: '#000'}
  );
}

function showMessage(message, timeOut) {
  messageText.text = message;
  timeOut = timeOut >= 500 ? timeOut : 4000;

  setTimeout(function() {
    messageText.text = '';
  }, timeOut);
}

function bumpLevel(lvl) {
  if (lvl == null) {
    lvl = level && null != level.lvl ? level.lvl + 1 : 0;
  }

  level             = {
    lvl:        lvl,
    actives:    0,
    max:        defaultLevelValues('max', 1, 5),
    projectile: defaultLevelValues('projectile', 5, 10),
    left:       defaultLevelValues('projectile', 5, 10),
    gravity:    defaultLevelValues('gravity', 20, 50),
    chance:     levels[lvl] && levels[lvl].chance ? levels[lvl].chance : {},
    message:    levels[lvl] && levels[lvl].message ? levels[lvl].message : '',
  };

  level.chance.heart = null != level.chance.heart ? level.chance.heart : 0.05;
  level.chance.star  = null != level.chance.star  ? level.chance.star  : 0.35;
  level.chance.rock  = null != level.chance.rock  ? level.chance.rock : 0.6;

  levelText.text = 'Level: ' + (lvl + 1);

  showMessage(level.message || 'Next Level: ' + (lvl + 1));

  console.log('chance', level.chance);

  setTimeout(function() {
    throwProjectile();
  }, 4000);
}

function defaultLevelValues(attr, inc, defaultVal) {
  var lvl = (level && level.lvl) || 0;
  inc = inc ? inc : 1;

  if (levels[lvl] && levels[lvl][attr]) {
    return levels[lvl][attr]
  } else if (level && level[attr]) {
     return level[attr] + inc;
  }

  return defaultVal ? defaultVal : 0;
}


function throwProjectile() {
  if (level.actives < level.max && level.left >0) {

  createProjectile();
  setTimeout(function() {throwProjectile();}, 500);
  }
}

function createProjectile(x, grav) {
  var projectile,
    type,
    hits,
    bounce = 0.3;
    typeChance = Math.random();

  if (!stillAlive() || level.left <= 0 || level.actives >= level.max) {
    return;
  }

  level.actives++;
  level.left--;

  grav = grav || level.gravity || 0;
  x    = x || (Math.random() * xFrames);
  x    = x > width - 32 ? width -32 : x;

  if (typeChance < level.chance.heart) {
    type = 'heart';
    hits = 2;
    bounce = 0
  } else if(typeChance < level.chance.star) {
    type = 'star';
    hits = 3;
  } else {
    type = 'rock';
    hits = 2;
  }

  projectile = projectiles.create(x * 32, 0, type);
  projectile.body.gravity.y = grav + Math.random() * 50;
  projectile.body.bounce.y  = bounce + Math.random() * 0.1;

  projectile.hits = hits;
  projectile.type = type;

  drawProjectileText();
}

function drawProjectileText() {
  projectileText.text = 'Moon rocks: ' + (level.left);
}

function crashProjectile(projectile) {
  if(--projectile.hits > 0) {
    return;
  }

  level.actives-=1;
  projectile.kill();

  drawProjectileText();
  addScore(projectile.score);

  projectile.kill();


  if (level.left > 0) {
    createProjectile();
  } else if(level.actives <= 0) {
    bumpLevel();
  }
}

function addScore(inc) {
  score += inc || 0;
  scoreText.text = 'Score: ' + pad(score, 6);
}

function createWorld() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.sprite(0, 0, 'sky');

  platforms = game.add.group();
  platforms.enableBody = true;

  ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;
}

function createPlayer(){
  player = game.add.sprite(400, game.world.height -150, 'dude');
  game.physics.arcade.enable(player);
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 500;
  player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  player.lives = 3;

  drawLives();

  cursors = game.input.keyboard.createCursorKeys();
}

function drawLives() {
  if (lives) {
    lives.destroy();
  }

  if (player.lives > 10) {
    player.lives = 10;
  }

  lives = game.add.group();
  lives.enableBody = true;

  for (var i = 1; i <= player.lives; i++) {
    life = lives.create((width/12) + (40 * i), 40, 'heart');
    life.body.immovable = true;
  }
}

function playerHurt() {
  if (!stillAlive) {
    return;
  }

  player.hurt  = true;
  player.blink = true;

  timer = game.time.create(false);
  var interval = setInterval(function() {
    player.hurtBlink = !player.hurtBlink;
    player.visible =player.hurtBlink
  }, 100);

  setTimeout(function() {
    clearInterval(interval);
      player.visible = true;
      player.hurt = false;
  }, 2000);

  return ;
}

function hitPlayer(player, projectile) {
  switch (projectile.type) {
    case 'star':
      projectile.kill();
      projectile.score = projectile.hits * 50;
      projectile.hits = 0;
      crashProjectile(projectile);
      break;
    case 'heart':
      projectile.kill();
      player.lives++;
      drawLives();
      projectile.hits = 0;
      projectile.score = projectile.hits * 100;
      crashProjectile(projectile);
      break;
    default: // rocks
      if (!player.hurt) {
        killPlayer(player, projectile);
      }
      break;
    }
}

function killPlayer (player, rock) {
  var highScores;

  player.lives--;

  playerHurt();

  rock.kill();

  drawLives();

  rock.hits = 0;
  rock.score = 0;
  crashProjectile(rock);

  if (stillAlive()) {
  showMessage('Outch', 1000);
  return;
  }

  player.body.collideWorldBounds = true;

  displayHighScores("You got hit hard on the head!\n   Press SPACE to restart.")
}

function storeHighScore() {
  var highScores = localStorage.dodge01HighScore ?
    JSON.parse(localStorage.dodge01HighScore) :
    [];

  if (score) {
    highScores.push({
      score: score,
      level: level.lvl + 1,
      date: new Date()
    });

    highScores = highScores.sort(function(a, b) {
      return b.score - a.score;
    });
  }

  if (highScores.length > 5) {
    highScores.pop();
  }

  localStorage.dodge01HighScore = JSON.stringify(highScores);

  return highScores;
}

function stillAlive() {
  return player.lives > 0;
}

function displayHighScores(message) {
  var highScores = storeHighScore(),
    scores       = pad(false, 4) + "Score    Level\n";

  for (var i = 0; i< highScores.length ; i++) {
    scores += pad(false, 4) +
      pad(highScores[i].score, 6) + "   " +
      pad(highScores[i].level, 3) + "\n";
  }

  showMessage(scores + "\n" + message, 10000);
}

function pad(num, size) {
  var s = num != null && num != false ? "000000000" + num : "          ";
  return s.substr(s.length-size);
}

function playerMove() {
  player.body.velocity.x = 0;

  if (!stillAlive()) {
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      score = 0;
      level = null;
      player.kill()
      addScore();
      createPlayer();
      bumpLevel();
    }

    return;
  }

  if (cursors.left.isDown) {
    player.body.velocity.x = -150;
    player.animations.play('left');
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 150;
    player.animations.play('right');
  } else {
    player.animations.stop();
    player.frame = 4;
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.body.velocity.y = -200;
  }

  if (player.body.y > ground.body.y) {
    player.body.y = game.world.height - 110;
  }
}

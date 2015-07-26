
var
  width  = 800,
  height = 500,
  cardWidth,
  cardHeigth,
  cards,
  totalCards = 76,
  cardsUp = [],
  score   = 0,
  level   = 1,
  leftOnTable = 0,
  game      = new Phaser.Game(
    width,
    height,
    Phaser.AUTO,
    '',
    { preload: preload, create: create, update: update }
  );

function preload() {
  for (var i = 1 ; i <= 76; i++ ) {
    game.load.image('card_' + i, 'assets/cards/card_' + i + '.png');
  }

  game.load.image('table', 'assets/sky.png');
  game.load.image('back', 'assets/platform.png');

  log("preload done");
}

function create() {
  cardWidth = parseInt(width  / 14);
  cardHeigth = parseInt(height / 8);
  cards   = game.add.group();

  game.add.sprite(0, 0, 'table');

  placeCards(2, 2);
}

function update() {
  //add countdown timer
}

function placeCards(x, y) {
  var startX,
    startY,
    deck,
    card;

  x = x < 12 ? x : 12;
  y = y <  6 ? y : 6;

  startX = 7 - parseInt(x/2);
  startY = 4 - parseInt(y/2);
  deck   = initDeck(x * y);

  for (var i = startY; i < startY + y; i++) {
    for (var j = startX; j < startX + x; j++) {
      card = game.add.sprite(
        j * cardWidth,
        i * cardHeigth,
        'back'
      );

      card.width= cardWidth - 5;
      card.height = cardHeigth -5;

      card.card = deck.shift();

      card.inputEnabled = true;
      card.events.onInputDown.add(flipCard);
    }
  }

  leftOnTable = x * y;
}

function initDeck(limit) {
  var deck     = [],
    pickPool = {};

  limit = limit;

  while(deck.length < limit) {
    candidate = parseInt(Math.random() * totalCards) + 1;
    if (!pickPool[candidate]) {
      deck.push({card: candidate, faceUp: false, pair: 1});
      deck.push({card: candidate, faceUp: false, pair: 2});
      pickPool[candidate] = true;
    }
  }

  return shuffle(deck);
}

function shuffle(deck) {
  var currentIndex = deck.length,
    temporaryValue,
    randomIndex;
  log("Suffling deck", deck);
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = deck[currentIndex];
    deck[currentIndex] = deck[randomIndex];
    deck[randomIndex] = temporaryValue;
  }

  log("Suffled deck", deck);
  return deck;
}

function flipCard(card) {
  var key = 'back';
  card.card.faceUp = !card.card.faceUp;

  if (card.card.faceUp && cardsUp.length < 2) {
    key = 'card_' + card.card.card;
    flip(card, key);
    cardsUp.push(card);
    setTimeout(checkCardsUp, 600);
  }
}

function flip(card, key) {
  card.loadTexture(key);
  card.width  = cardWidth - 5;
  card.height = cardHeigth - 5;
}

function checkCardsUp () {
  if (cardsUp.length < 2) {
    return;
  }

  console.log(cardsUp[0].card, cardsUp[1].card);

  if (cardsUp[0].card.card === cardsUp[1].card.card) {
    cardsUp[0].destroy();
    cardsUp[1].destroy();
    leftOnTable -=2;
    checkBoard();
  } else {
    cardsUp[0].card.faceUp = false;
    cardsUp[1].card.faceUp = false;

    flip(cardsUp[0], 'back');
    flip(cardsUp[1], 'back');
  }
  cardsUp = [];
}

function checkBoard() {
  if (leftOnTable > 0) {
    return;
  }

  console.log("Finished");

  level++;

  setTimeout(
    function() {
    placeCards(2 * level, 2 * level);
  }, 2000);

}

function log() {
  console.log(Date.now(), arguments);
}

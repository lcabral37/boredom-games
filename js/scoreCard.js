/**
* Base module for a scoring module to be reused accross
**/

var ScoreCard = function (type, maxHistory) {
  var self = this;

  this.score = 0;

  this.key = type ? type + 'Score' : 'defaultScore';

  this.maxHistory = maxHistory ? maxHistory : 5;

  this.reset = function () {
    self.score = 0;
  }

  this.add = function (increment) {
    self.score += increment ? increment : 0;
    return self.score;
  }

  this.save = function (name, level) {
    var history = self.loadHistory();

    if (!self.score) {
      return false;
    }

    history = history || [];
    name = name || null;
    level = level || null;

    history.push({
      score: self.score,
      date: new Date(),
      level: level,
      user: name
    });

    history = self.order(history);

    if (history.length > self.maxHistory) {
      history.pop();
    }

    self.saveHistory(history);
  }

  this.loadHistory = function () {
    var data = localStorage[self.key];

    if (data)  {
      return JSON.parse(localStorage[self.key]);
    }
    return [];
  }

  this.saveHistory = function (data) {
    localStorage[self.key] = JSON.stringify(data);
  }

  this.order = function (data) {
    return data.sort(function(a, b) {
      return b.score - a.score;
    });
  }
};

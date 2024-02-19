var Hud = function(game) {
  var self = this;

  this.game = game;

  this.huds = {};

  this.add = function (x, y, name, size, color) {
    var font = {
        fontSize: size ? size : '32px',
        fill: color ? color: '#000'
      },
      text = self.game.add.text(x, y, '', font);

    name = name || self.huds.length + 1;
    self.huds[name] = text;

    return text;
  }

  this.update = function(name, text) {
    self.huds[name].text = text;
  }


  this.pad = function (num, size) {
    var s = "000000000";

    if(num > 0) {
      s += num;
    } else if (num != 0) {
      "          ";
    }

    return s.substr(s.length-size);
  }

}

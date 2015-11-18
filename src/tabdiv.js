/**
 * VexFlow TabDiv
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

$j = require('jquery')
Vex = require('vexflow')
Artist = require('./artist.coffee')
VexTab = require('./vextab.coffee')

Vex.Flow.TabDiv = function(sel, options) {
  if (arguments.length > 0) this.init(sel, options);
}

Vex.Flow.TabDiv.SEL = ".vex-tabdiv";
Vex.Flow.TabDiv.ERROR_NOCANVAS =
  "<b>This browser does not support HTML5 Canvas</b><br/>" +
  "Please use a modern browser such as <a href='http://google.com/chrome'>" +
  "Google Chrome</a> or <a href='http://firefox.com'>Firefox</a>.";

Vex.Flow.TabDiv.prototype.init = function(sel, options) {
  this.sel = sel;

  // Grab code and clear tabdiv
  this.code = $j(sel).text();
  $j(sel).empty();
  if ($j(sel).css("position") == "static") {
    $j(sel).css("position", "relative");
  }

  // Get tabdiv properties
  this.width = parseInt($j(sel).attr("width")) || 400;
  this.height = parseInt($j(sel).attr("height")) || 200;
  this.scale = parseFloat($j(sel).attr("scale")) || 1.0;

  // If the Raphael.js sources are included, then use Raphael, else
  // resort to HTML5 Canvas.
  if (typeof (Raphael) == "undefined") {
    this.canvas = $j('<canvas></canvas>').addClass("vex-canvas");
    $j(sel).append(this.canvas);
    this.renderer = new Vex.Flow.Renderer(this.canvas[0],
        Vex.Flow.Renderer.Backends.CANVAS);
  } else {
    this.canvas = $j('<div></div>').addClass("vex-canvas");
    $j(sel).append(this.canvas);
    this.renderer = new Vex.Flow.Renderer(this.canvas[0],
        Vex.Flow.Renderer.Backends.RAPHAEL);
  }

  this.ctx_sel = $j(sel).find(".vex-canvas");
  this.renderer.resize(this.width, this.height);
  this.ctx = this.renderer.getContext();
  this.ctx.setBackgroundFillStyle(this.ctx_sel.css("background-color"));
  this.ctx.scale(this.scale, this.scale);

  // Grab editor properties
  this.editor = $j(sel).attr("editor") || "";
  this.show_errors = $j(sel).attr("show-errors") || "";
  this.editor_width= $j(sel).attr("editor_width") || this.width;
  this.editor_height= $j(sel).attr("editor_height") || 200;

  var that = this;
  if (this.editor == "true") {
    this.text_area = $j('<textarea></textarea>').addClass("editor").
      val(this.code);
    this.editor_error = $j('<div></div>').addClass("editor-error");
    $j(sel).append($j('<p/>')).append(this.editor_error);
    $j(sel).append($j('<p/>')).append(this.text_area);
    this.text_area.width(this.editor_width);
    this.text_area.height(this.editor_height);
    this.text_area.keyup(function() {
        if (that.timeoutID) window.clearTimeout(that.timeoutID);
        that.timeoutID =
          window.setTimeout(function() {
            // Draw only if code changed
            if (that.code != that.text_area.val()) {
              that.code = that.text_area.val();
              that.redraw()
            }
          }, 250);
    });
  } if (this.show_errors == "true") {
    this.editor_error = $j('<div></div>').addClass("editor-error");
    $j(sel).append($j('<p/>')).append(this.editor_error);
  }

  // Initialize parser.
  this.artist = new Artist(10, 0, this.width, {scale: this.scale});
  this.parser = new VexTab(this.artist);

  if (Vex.Flow.Player) {
    opts = {};
    if (options) opts.soundfont_url = options.soundfont_url;
    this.player = new Vex.Flow.Player(this.artist, opts);
  }

  this.redraw();
}

Vex.Flow.TabDiv.prototype.redraw = function() {
  var that = this;
  Vex.BM("Total render time: ", function() {
      that.parse(); that.draw();});

  return this;
}

Vex.Flow.TabDiv.prototype.drawInternal = function() {
  if (!this.parser.isValid()) return this;
  return this.artist.draw(this.renderer);
}

Vex.Flow.TabDiv.prototype.parseInternal = function() {
  try {
    this.artist.reset();
    this.parser.reset();
    this.parser.parse(this.code);
    this.editor_error.empty();
  } catch (e) {
    if (this.editor_error) {
      this.editor_error.empty();
      this.editor_error.append(
          $j('<div></div>').addClass("text").html(
            "Sucky VexTab: " + e.message));
    }
  }
  return this;
}

Vex.Flow.TabDiv.prototype.parse = function() {
  var that = this;
  Vex.BM("Parse time: ", function() { that.parseInternal(); });
  return this;
}

Vex.Flow.TabDiv.prototype.draw = function() {
  var that = this;
  Vex.BM("Draw time: ", function() { that.drawInternal(); });
  return this;
}

// Automatic initialization.
Vex.Flow.TabDiv.start = function() {
  $j(Vex.Flow.TabDiv.SEL).each(function(index) {
      new Vex.Flow.TabDiv(this);
  });
}

$j(function() {if (Vex.Flow.TabDiv.SEL) { Vex.Flow.TabDiv.start() }});

module.exports = {
  Div: Vex.Flow.TabDiv,
  VexTab: VexTab,
  Artist: Artist,
  Flow: Vex.Flow
}

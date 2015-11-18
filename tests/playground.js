// Load VexTab module.
vextab = require("vextab");
$j = require("jquery");
_ = require("underscore");

$j(function() {
  VexTab = vextab.VexTab;
  Artist = vextab.Artist;
  Renderer = vextab.Vex.Flow.Renderer;

  Artist.DEBUG = true;
  VexTab.DEBUG = false;

  // Create VexFlow Renderer from canvas element with id #boo
  renderer = new Renderer($j('#boo')[0], Renderer.Backends.CANVAS);

  // Initialize VexTab artist and parser.
  artist = new Artist(10, 10, 600, {scale: 0.8});
  vextab = new VexTab(artist);

  function render() {
    try {
      vextab.reset();
      artist.reset();
      vextab.parse($j("#blah").val());
      artist.render(renderer);
      $j("#error").text("");
    } catch (e) {
      console.log(e);
      $j("#error").html(e.message.replace(/[\n]/g, '<br/>'));
    }
  }

  $j("#blah").keyup(_.throttle(render, 250));
  render();
});
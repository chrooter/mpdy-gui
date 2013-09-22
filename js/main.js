function initJQ() {
  var consoleError = console.error.bind(console);

  var getFirst = function (list) {
    console.log(list);
    $(list).each(function() {
      var tracks = this.tracks;
      var track_count = (tracks !== undefined) ? tracks.length : 0;
      $('#playlists').append('<li><a href="!#">' + this.name + '</a><span class="ui-li-count">' + track_count + '</span></li>').listview("refresh");
      console.log(this);
    });
    return list[0];
  };

  var extractTracks = function (playlist) {
    return playlist.tracks;
  };

  var printTypeAndName = function (model) {
    console.log(model.__model__ + ": " + model.name);
    // By returning the playlist, this function can be inserted
    // anywhere a model with a name is piped in the chain.
    return model;
  };

  var trackDesc = function (track) {
    return track.name + " by " + track.artists[0].name + " from " + track.album.name;
  };

  var printNowPlaying = function () {
    // By returning any arguments we get, the function can be inserted
    // anywhere in the chain.
    var args = arguments;
    return mopidy.playback.getCurrentTrack().then(function (track) {
      console.log("Now playing:", trackDesc(track));
      $('#output').text(trackDesc(track));
      return args;
    });
  };

  var queueAndPlayFirstPlaylist = function () {
    mopidy.playlists.getPlaylists()
      // => list of Playlists
      .then(getFirst, consoleError)
      // => Playlist
      .then(printTypeAndName, consoleError)
      // => Playlist
      .then(extractTracks, consoleError)
      // => list of Tracks
      .then(mopidy.tracklist.add, consoleError)
      // => list of TlTracks
      .then(getFirst, consoleError)
      // => TlTrack
      // .then(mopidy.playback.play, consoleError)
      // => null
      .then(printNowPlaying, consoleError);
  };

  var mopidy = new Mopidy({
    webSocketUrl: "ws://musicbox.local/mopidy/ws/"
  });
  mopidy.on(console.log.bind(console));  // Log all events
  mopidy.on("state:online", queueAndPlayFirstPlaylist);
}

$(document).ready(function($) {
  initJQ();
});
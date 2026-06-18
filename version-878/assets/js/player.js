(function () {
  window.initMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    var src = config.src;
    var hls = null;

    function playVideo() {
      if (!video || !src) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== src) {
          video.src = src;
        }
        var nativePlay = video.play();
        if (nativePlay && nativePlay.catch) {
          nativePlay.catch(function () {});
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var parsedPlay = video.play();
            if (parsedPlay && parsedPlay.catch) {
              parsedPlay.catch(function () {});
            }
          });
        }
        var hlsPlay = video.play();
        if (hlsPlay && hlsPlay.catch) {
          hlsPlay.catch(function () {});
        }
        return;
      }
      if (video.src !== src) {
        video.src = src;
      }
      var directPlay = video.play();
      if (directPlay && directPlay.catch) {
        directPlay.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  };
}());

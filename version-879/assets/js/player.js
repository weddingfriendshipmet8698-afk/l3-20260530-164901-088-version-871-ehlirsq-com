(function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var button = player.querySelector('[data-play-button]');
    var hls;

    if (!video || !overlay || !button) {
      return;
    }

    function loadVideo() {
      if (video.dataset.ready === '1') {
        return;
      }

      var src = video.getAttribute('data-video-src');
      if (!src) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      video.dataset.ready = '1';
      video.controls = true;
    }

    function startVideo() {
      loadVideo();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', startVideo);
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      startVideo();
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();

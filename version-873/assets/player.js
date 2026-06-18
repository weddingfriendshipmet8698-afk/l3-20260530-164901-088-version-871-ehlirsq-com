(function () {
  function initPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector("[data-play-trigger]");
    var streamUrl = box.getAttribute("data-stream");
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            resolve();
          });
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 600);
        });
      }

      video.src = streamUrl;
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player-box]")).forEach(initPlayer);
  });
})();

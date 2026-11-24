<!--
  "Videos" tab: a grid of TikTok previews (thumbnail, caption, author).
  Clicking a preview opens the video in a player on the page: no redirection to TikTok.
-->
<template>
  <div>
    <p v-if="!videos.length" class="muted">No videos yet.</p>

    <ul v-else class="videos">
      <li v-for="video in videos" :key="video.id">
        <button type="button" class="preview" :aria-label="`Play: ${label(video)}`" @click="open(video)">
          <img v-if="video.preview?.thumbnailUrl" :src="video.preview.thumbnailUrl" :alt="label(video)" loading="lazy" referrerpolicy="no-referrer" />
          <span v-else class="preview__placeholder" aria-hidden="true">♪</span>
          <span class="preview__play" aria-hidden="true">▶</span>
          <span class="preview__info">
            <strong>{{ label(video) }}</strong>
            <small v-if="video.preview?.author">@{{ video.preview.author }}</small>
          </span>
        </button>
      </li>
    </ul>

    <!-- Player: TikTok's embed player, displayed in a modal window -->
    <div v-if="playing" class="player" role="dialog" aria-modal="true" :aria-label="label(playing)" @click.self="close">
      <div class="player__box">
        <button type="button" class="player__close" aria-label="Close" @click="close">✕</button>
        <iframe
          :src="`https://www.tiktok.com/embed/v2/${playing.videoId}`"
          :title="label(playing)"
          allow="autoplay; encrypted-media; fullscreen"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TikTokVideos',
  props: {
    videos: { type: Array, default: () => [] },
  },
  data() {
    return { playing: null };
  },
  unmounted() {
    document.removeEventListener('keydown', this.onKey);
  },
  methods: {
    // Title chosen by the admin, otherwise the TikTok caption
    label(video) {
      return video.title || video.preview?.caption || 'TikTok video';
    },
    open(video) {
      if (!video.videoId) return;
      this.playing = video;
      this.onKey = (e) => e.key === 'Escape' && this.close();
      document.addEventListener('keydown', this.onKey);
    },
    close() {
      this.playing = null;
      document.removeEventListener('keydown', this.onKey);
    },
  },
};
</script>

<style scoped>
.videos { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }

.preview {
  position: relative; display: block; width: 100%; aspect-ratio: 9 / 16; padding: 0; overflow: hidden;
  border: 1px solid var(--line); border-radius: var(--radius); background: rgba(255, 255, 255, 0.05);
  color: var(--text); cursor: pointer; text-align: left;
}
.preview img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.preview:hover img { transform: scale(1.04); }
.preview:focus-visible { outline: 2px solid var(--yellow); outline-offset: 2px; }
.preview__placeholder { position: absolute; inset: 0; display: grid; place-items: center; font-size: 3rem; color: var(--yellow); }
.preview__play {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 52px; height: 52px; display: grid; place-items: center; border-radius: 50%;
  background: var(--yellow); color: var(--blue); font-size: 1.2rem; padding-left: 3px;
}
.preview__info {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 2rem 0.7rem 0.7rem;
  background: linear-gradient(transparent, rgba(1, 45, 106, 0.95)); display: flex; flex-direction: column; gap: 0.15rem;
}
.preview__info strong { font-size: 0.85rem; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.preview__info small { color: var(--muted); }

.player { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 1rem; background: rgba(0, 0, 0, 0.75); }
.player__box { position: relative; width: min(340px, 100%); }
.player__box iframe { width: 100%; height: min(740px, 85vh); border: 0; border-radius: var(--radius); background: #000; }
.player__close {
  position: absolute; top: -2.6rem; right: 0; width: 2.2rem; height: 2.2rem; border: 0; border-radius: 50%;
  background: var(--yellow); color: var(--blue); font-size: 1rem; cursor: pointer;
}
</style>

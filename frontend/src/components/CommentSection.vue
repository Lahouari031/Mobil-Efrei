<!--
  "Student posts" area of a destination: publish form + list sorted by likes.
  It is the parent of the CommentItem components: it listens to their events and calls the API.
-->
<template>
  <section aria-labelledby="student-posts-heading">
    <h2 id="student-posts-heading">Student posts</h2>
    <p class="muted">Share a tip. The most liked ones rise to the top.</p>

    <form class="form" novalidate @submit.prevent="publish">
      <label for="new-comment" class="sr-only">Your comment</label>
      <textarea
        id="new-comment"
        v-model="newContent"
        class="input"
        :class="{ 'is-invalid': touched && !isValid }"
        rows="3"
        maxlength="500"
        placeholder="A good deal, a place, advice for the next students…"
        required
        @blur="touched = true"
      ></textarea>
      <div class="form__foot">
        <small class="muted">{{ newContent.length }}/500</small>
        <button class="btn btn-small" :disabled="!isValid || sending">{{ sending ? 'Posting…' : 'Post' }}</button>
      </div>
      <p v-if="touched && !isValid" class="error-msg">Between 3 and 500 characters.</p>
      <p v-if="error" class="alert">{{ error }}</p>
    </form>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="!comments.length" class="muted">No posts yet. Be the first!</p>

    <TransitionGroup name="list" tag="ul" class="list">
      <CommentItem
        v-for="(c, i) in comments"
        :key="c.id"
        :comment="c"
        :rank="i + 1"
        :can-moderate="auth.isAdmin"
        @like="like"
        @unlike="unlike"
        @update="update"
        @delete="remove"
      />
    </TransitionGroup>
  </section>
</template>

<script>
import CommentItem from './CommentItem.vue';
import { api } from '../api/client';
import { auth } from '../store/auth';

export default {
  name: 'CommentSection',
  components: { CommentItem },
  props: {
    destinationId: { type: Number, required: true },
  },
  data() {
    return { auth, comments: [], newContent: '', touched: false, sending: false, loading: true, error: '' };
  },
  computed: {
    isValid() {
      const len = this.newContent.trim().length;
      return len >= 3 && len <= 500;
    },
  },
  watch: {
    destinationId: { immediate: true, handler: 'load' },
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        this.comments = await api.get(`/destinations/${this.destinationId}/comments`);
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    // Local re-sort: most likes first, then most recent
    sort() {
      this.comments.sort((a, b) => b.likeCount - a.likeCount || new Date(b.createdAt) - new Date(a.createdAt));
    },
    async publish() {
      this.touched = true;
      if (!this.isValid) return;
      this.sending = true;
      this.error = '';
      try {
        await api.post(`/destinations/${this.destinationId}/comments`, { content: this.newContent.trim() });
        this.newContent = '';
        this.touched = false;
        await this.load();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.sending = false;
      }
    },
    async like(id) {
      this.applyLike(id, await api.post(`/comments/${id}/like`));
    },
    async unlike(id) {
      this.applyLike(id, await api.delete(`/comments/${id}/like`));
    },
    applyLike(id, { likeCount, likedByMe }) {
      const c = this.comments.find((x) => x.id === id);
      if (c) Object.assign(c, { likeCount, likedByMe });
      this.sort();
    },
    async update({ id, content }) {
      try {
        const updated = await api.put(`/comments/${id}`, { content });
        const c = this.comments.find((x) => x.id === id);
        if (c) Object.assign(c, { content: updated.content, updatedAt: updated.updatedAt });
      } catch (e) {
        this.error = e.message;
      }
    },
    async remove(id) {
      try {
        await api.delete(`/comments/${id}`);
        this.comments = this.comments.filter((c) => c.id !== id);
      } catch (e) {
        this.error = e.message;
      }
    },
  },
};
</script>

<style scoped>
.form { margin: 1.5rem 0 1rem; }
.form__foot { display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem; }
.list { padding: 0; margin: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.list-move { transition: transform 0.4s var(--ease); }
.list-enter-active, .list-leave-active { transition: opacity 0.3s; }
.list-enter-from, .list-leave-to { opacity: 0; }
</style>

<!--
  One comment. Parent <-> child communication:
  - the parent passes the comment through a prop
  - the child notifies the parent with events ($emit): like, unlike, update, delete
-->
<template>
  <li class="comment">
    <blockquote v-if="!editing" class="comment__text">“{{ comment.content }}”</blockquote>

    <form v-else class="comment__edit" @submit.prevent="save">
      <textarea v-model="draft" class="input" rows="3" maxlength="500" required></textarea>
      <div class="comment__actions">
        <button class="btn btn-small" :disabled="draft.trim().length < 3">Save</button>
        <button type="button" class="link-btn" @click="editing = false">Cancel</button>
      </div>
    </form>

    <div class="comment__meta">
      <button
        class="like"
        :class="{ 'is-liked': comment.likedByMe }"
        :aria-pressed="comment.likedByMe"
        @click="$emit(comment.likedByMe ? 'unlike' : 'like', comment.id)"
      >
        {{ comment.likedByMe ? '♥' : '♡' }} {{ comment.likeCount }}
      </button>
      <span class="muted">@{{ comment.author.username }} · {{ formattedDate }}<template v-if="wasEdited"> · edited</template></span>
      <span v-if="rank === 1 && comment.likeCount > 0" class="tag top">Top tip</span>

      <span v-if="!editing" class="comment__actions">
        <button v-if="comment.isMine" class="link-btn" @click="startEdit">Edit</button>
        <button v-if="comment.isMine || canModerate" class="link-btn is-danger" @click="onDelete">Delete</button>
      </span>
    </div>
  </li>
</template>

<script>
export default {
  name: 'CommentItem',
  props: {
    comment: { type: Object, required: true },
    rank: { type: Number, required: true },
    canModerate: { type: Boolean, default: false },
  },
  emits: ['like', 'unlike', 'update', 'delete'],
  data() {
    return { editing: false, draft: '' };
  },
  computed: {
    formattedDate() {
      return new Date(this.comment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    wasEdited() {
      return new Date(this.comment.updatedAt) - new Date(this.comment.createdAt) > 1000;
    },
  },
  methods: {
    startEdit() {
      this.draft = this.comment.content;
      this.editing = true;
    },
    save() {
      this.$emit('update', { id: this.comment.id, content: this.draft.trim() });
      this.editing = false;
    },
    onDelete() {
      if (window.confirm('Delete this comment?')) this.$emit('delete', this.comment.id);
    },
  },
};
</script>

<style scoped>
.comment { list-style: none; padding: 1.4rem 0; border-bottom: 1px solid var(--line); }
.comment__text { margin: 0 0 0.8rem; font-size: 1.1rem; line-height: 1.5; }
.comment__meta { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.85rem; }
.comment__actions { display: inline-flex; gap: 0.9rem; margin-left: auto; }
.comment__edit .comment__actions { margin: 0.6rem 0 0.8rem; }
.like { background: none; border: 1px solid var(--line); border-radius: 999px; padding: 0.15rem 0.7rem; cursor: pointer; color: var(--muted); }
.like:hover { border-color: var(--text); color: var(--text); }
.like.is-liked { border-color: var(--yellow); color: var(--yellow); }
.top { color: var(--yellow); border-color: var(--yellow); }
</style>

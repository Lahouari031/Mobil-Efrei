<!--
  Form to create / edit a tip (admin area).
  The parent passes the tip to edit (or null to create one) and receives the "submit" event.
-->
<template>
  <form class="tip-form" novalidate @submit.prevent="onSubmit">
    <h2>{{ tip ? 'Edit tip' : 'New tip' }}</h2>

    <div class="row">
      <div class="form-field">
        <label for="tip-dest">Destination</label>
        <select id="tip-dest" v-model.number="form.destinationId" class="input" required>
          <option v-for="d in destinations" :key="d.id" :value="d.id">{{ d.city }}</option>
        </select>
      </div>
      <div class="form-field">
        <label for="tip-cat">Category</label>
        <select id="tip-cat" v-model="form.category" class="input" required>
          <option v-for="c in categories" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
      </div>
    </div>

    <div class="form-field">
      <label for="tip-title">Title</label>
      <input id="tip-title" v-model="form.title" class="input" :class="{ 'is-invalid': showErrors && errors.title }" maxlength="120" required />
      <p v-if="showErrors && errors.title" class="error-msg">{{ errors.title }}</p>
    </div>

    <div class="form-field">
      <label for="tip-content">Content</label>
      <textarea id="tip-content" v-model="form.content" class="input" :class="{ 'is-invalid': showErrors && errors.content }" rows="4" required></textarea>
      <p v-if="showErrors && errors.content" class="error-msg">{{ errors.content }}</p>
    </div>

    <div class="form-field">
      <label for="tip-link">Link (optional)</label>
      <input id="tip-link" v-model="form.link" type="url" class="input" :class="{ 'is-invalid': showErrors && errors.link }" placeholder="https://…" />
      <p v-if="showErrors && errors.link" class="error-msg">{{ errors.link }}</p>
    </div>

    <div class="actions">
      <button class="btn">{{ tip ? 'Save' : 'Add' }}</button>
      <button v-if="tip" type="button" class="link-btn" @click="$emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

<script>
import { CATEGORIES } from '../constants';

const empty = (destinationId) => ({ destinationId, category: 'budget', title: '', content: '', link: '' });

export default {
  name: 'TipForm',
  props: {
    tip: { type: Object, default: null },
    destinations: { type: Array, required: true },
  },
  emits: ['submit', 'cancel'],
  data() {
    return { categories: CATEGORIES, form: empty(this.destinations[0]?.id), showErrors: false };
  },
  computed: {
    // Client-side validation, recomputed on every keystroke
    errors() {
      const e = {};
      if (this.form.title.trim().length < 2) e.title = 'Title is too short.';
      if (this.form.content.trim().length < 5) e.content = 'Content is too short (5 characters min).';
      if (this.form.link && !/^https?:\/\//.test(this.form.link)) e.link = 'The link must start with http(s)://';
      return e;
    },
  },
  watch: {
    // Clicking "Edit" in the table fills the form
    tip: {
      immediate: true,
      handler(t) {
        this.form = t
          ? { destinationId: t.destinationId, category: t.category, title: t.title, content: t.content, link: t.link || '' }
          : empty(this.destinations[0]?.id);
        this.showErrors = false;
      },
    },
  },
  methods: {
    onSubmit() {
      this.showErrors = true;
      if (Object.keys(this.errors).length) return;
      this.$emit('submit', { ...this.form });
      if (!this.tip) {
        this.form = empty(this.form.destinationId);
        this.showErrors = false;
      }
    },
  },
};
</script>

<style scoped>
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.actions { display: flex; align-items: center; gap: 1rem; }
@media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
</style>

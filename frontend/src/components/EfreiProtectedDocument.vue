
<template>
  <div class="protected-document">

    <!-- Document heading -->
    <div class="document-heading">

      <span class="lock-icon">
        {{ unlocked ? '🔓' : '🔒' }}
      </span>

      <div>
        <h3>EFREI Student Pocket Guide</h3>

        <p class="muted">
          {{
            unlocked
              ? 'Document unlocked'
              : 'Protected PowerPoint presentation'
          }}
        </p>
      </div>

    </div>

    <!-- Loading document status -->
    <p v-if="checkingStatus" class="muted">
      Checking document access...
    </p>

    <!-- Locked document -->
    <form
      v-else-if="!unlocked"
      class="unlock-form"
      @submit.prevent="unlockDocument"
    >

      <label for="document-code">
        Enter your access code
      </label>

      <input
        id="document-code"
        v-model="code"
        type="password"
        inputmode="numeric"
        maxlength="8"
        autocomplete="off"
        class="input"
        placeholder="Enter the 8-digit code"
        required
      />

      <button
        type="submit"
        class="btn"
        :disabled="loading || code.length !== 8"
      >
        {{ loading ? 'Checking...' : 'Unlock document' }}
      </button>

    </form>

    <!-- Unlocked document -->
    <div v-else class="document-content">

      <p class="unlocked-message">
        ✓ Access granted — document unlocked
      </p>

      <h4>Read the presentation</h4>

      <p class="muted">
        You can read the guide below or download
        the original PowerPoint presentation.
      </p>

      <!-- PDF reader -->
      <iframe
        src="/api/efrei-document/preview"
        title="EFREI Student Pocket Guide"
        class="document-preview"
      ></iframe>

      <!-- Download the original PowerPoint -->
      <a
        href="/api/efrei-document/download"
        class="download-link"
      >
        ⬇ Download PowerPoint (.pptx)
      </a>

    </div>

    <!-- Error messages -->
    <p
      v-if="error"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </p>

  </div>
</template>

<script>
import { api } from '../api/client';

export default {
  name: 'EfreiProtectedDocument',

  data() {
    return {
      code: '',
      unlocked: false,
      loading: false,
      checkingStatus: true,
      error: ''
    };
  },

  async mounted() {
    await this.checkDocumentStatus();
  },

  methods: {

    // Check if the document is already unlocked
    async checkDocumentStatus() {
      this.checkingStatus = true;
      this.error = '';

      try {
        const result = await api.get(
          '/efrei-document/status'
        );

        this.unlocked = result.unlocked === true;

      } catch (e) {
        this.error =
          e.message || 'Unable to check document access.';

      } finally {
        this.checkingStatus = false;
      }
    },

    // Send the entered code to the backend
    async unlockDocument() {
      if (this.loading) return;

      this.loading = true;
      this.error = '';

      try {
        const result = await api.post(
          '/efrei-document/unlock',
          {
            code: this.code
          }
        );

        if (result.unlocked === true) {
          this.unlocked = true;
          this.code = '';
        } else {
          this.error = 'Unable to unlock document.';
        }

      } catch (e) {
        this.error =
          e.message || 'Incorrect access code.';

      } finally {
        this.loading = false;
      }
    }

  }
};
</script>

<style scoped>
.protected-document {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 14px;
}

.document-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.document-heading h3 {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
}

.document-heading p {
  margin: 0;
}

.lock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  min-width: 55px;
  min-height: 55px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.unlock-form {
  display: grid;
  gap: 1rem;
  max-width: 380px;
}

.unlock-form label {
  font-size: 0.9rem;
  font-weight: 500;
}

.unlock-form input {
  width: 100%;
  box-sizing: border-box;
}

.unlock-form button {
  width: fit-content;
}

.document-content {
  margin-top: 1.5rem;
}

.document-content h4 {
  margin-bottom: 0.5rem;
}

.unlocked-message {
  color: #7de1a2;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.document-preview {
  display: block;
  width: 100%;
  height: 550px;
  margin-top: 1.5rem;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: white;
}

.download-link {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--yellow);
  border-radius: 8px;
  color: var(--yellow);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;
}

.download-link:hover {
  background: rgba(255, 255, 255, 0.07);
}

.error-message {
  color: #ff9090;
  font-size: 0.9rem;
  margin-top: 1rem;
}

@media (max-width: 760px) {
  .protected-document {
    padding: 1rem;
  }

  .document-preview {
    height: 400px;
  }
}
</style>

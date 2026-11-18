<!--
  Sign-in / sign-up panel (the main element of the landing page).
  Two tabs share the same panel; the active tab follows the URL (/ or /register).
-->
<template>
  <div class="auth">
  <div v-if="!needsVerification" class="auth__tabs" role="tablist">
      <button role="tab" :aria-selected="mode === 'login'" :class="{ 'is-active': mode === 'login' }" @click="switchTo('login')">Sign in</button>
      <button role="tab" :aria-selected="mode === 'register'" :class="{ 'is-active': mode === 'register' }" @click="switchTo('register')">Create account</button>
    </div>

    <p v-if="error" class="alert">{{ error }}</p>
<form v-if="needsVerification" key="verify" novalidate @submit.prevent="submitVerification">
  <div class="form-field">
    <label for="verification-code">Enter your six-digit verification code</label>
    <input
      id="verification-code"
      v-model.trim="verificationCode"
      class="input"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="6"
    />
  </div>

  <button type="submit" class="btn btn-block" :disabled="loading">Verify email</button>
  <button type="button" class="link-btn" :disabled="loading" @click="backToLogin">
    Back to sign in
  </button>
</form>
    <!-- ================= SIGN IN ================= -->
    <form v-else-if="mode === 'login'" key="login" novalidate @submit.prevent="submitLogin">
      <div class="form-field">
        <label for="login">EFREI email or username</label>
        <input id="login" v-model.trim="login.login" class="input" autocomplete="username" placeholder="firstname.lastname@efrei.net" required />
      </div>

      <div class="form-field">
        <label for="login-password">Password</label>
        <div class="pw">
          <input id="login-password" v-model="login.password" :type="showPassword ? 'text' : 'password'" class="input" autocomplete="current-password" required />
          <button type="button" class="link-btn pw__toggle" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
        </div>
      </div>

      <button class="btn btn-block" :disabled="loading || !canLogin">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
    </form>

    <!-- ================= SIGN UP ================= -->
    <form v-else key="register" novalidate @submit.prevent="submitRegister">
      <div class="form-field">
        <label for="email">EFREI email</label>
        <input
          id="email"
          v-model.trim="reg.email"
          type="email"
          class="input"
          :class="{ 'is-invalid': touched.email && errors.email }"
          placeholder="firstname.lastname@efrei.net"
          autocomplete="email"
          required
          @blur="touched.email = true"
        />
        <p v-if="touched.email && errors.email" class="error-msg">{{ errors.email }}</p>
      </div>

      <div class="form-field">
        <label for="username">Username</label>
        <input
          id="username"
          v-model.trim="reg.username"
          class="input"
          :class="{ 'is-invalid': touched.username && errors.username }"
          placeholder="3–20 letters, digits or _"
          autocomplete="username"
          required
          @blur="touched.username = true"
        />
        <p v-if="touched.username && errors.username" class="error-msg">{{ errors.username }}</p>
      </div>

      <div class="form-field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="reg.password"
          type="password"
          class="input"
          :class="{ 'is-invalid': touched.password && errors.password }"
          autocomplete="new-password"
          required
          @blur="touched.password = true"
        />
        <!-- Strength meter: width and colour bound dynamically with :style -->
        <div class="strength"><div class="strength__bar" :style="{ width: strength.pct + '%', background: strength.color }"></div></div>
        <p v-if="touched.password && errors.password" class="error-msg">{{ errors.password }}</p>
      </div>

      <div class="form-field">
        <label for="confirm">Confirm password</label>
        <input
          id="confirm"
          v-model="reg.confirm"
          type="password"
          class="input"
          :class="{ 'is-invalid': touched.confirm && errors.confirm }"
          autocomplete="new-password"
          required
          @blur="touched.confirm = true"
        />
        <p v-if="touched.confirm && errors.confirm" class="error-msg">{{ errors.confirm }}</p>
      </div>

      <button class="btn btn-block" :disabled="loading">{{ loading ? 'Creating…' : 'Create account' }}</button>
      <p class="auth__note muted">Reserved for @efrei.net and @efrei.fr addresses.</p>
    </form>
  </div>
</template>

<script>
import { auth } from '../store/auth';
import { EMAIL_REGEX, USERNAME_REGEX, PASSWORD_REGEX } from '../constants';

export default {
  name: 'AuthPanel',
  props: {
    mode: { type: String, default: 'login' }, // 'login' | 'register'
  },
  data() {
    return {
      login: { login: '', password: '' },
      reg: { email: '', username: '', password: '', confirm: '' },
      touched: { email: false, username: false, password: false, confirm: false },
      showPassword: false,
      loading: false,
      error: '',
      needsVerification: false,
      verificationCode: '',
    };
  },
  computed: {
    canLogin() {
      return this.login.login.length >= 3 && this.login.password.length > 0;
    },
    // Client-side validation, recomputed on every keystroke
    errors() {
      const e = {};
      if (!EMAIL_REGEX.test(this.reg.email)) e.email = 'Use your @efrei.net or @efrei.fr email address.';
      if (!USERNAME_REGEX.test(this.reg.username)) e.username = 'Invalid username.';
      if (!PASSWORD_REGEX.test(this.reg.password)) e.password = 'At least 8 characters, including a letter and a digit.';
      if (this.reg.confirm !== this.reg.password) e.confirm = 'Passwords do not match.';
      return e;
    },
    strength() {
      const p = this.reg.password;
      let score = 0;
      if (p.length >= 8) score++;
      if (p.length >= 12) score++;
      if (/\d/.test(p) && /[A-Za-z]/.test(p)) score++;
      if (/[^A-Za-z0-9]/.test(p)) score++;
      const colors = ['transparent', 'var(--danger)', 'var(--yellow)', 'var(--yellow)', '#ffffff'];
      return { pct: (score / 4) * 100, color: colors[score] };
    },
  },
  watch: {
    mode() {
      this.error = '';
    },
  },
  methods: {
    switchTo(mode) {
      this.$router.replace({
        name: mode === 'login' ? 'landing' : 'register',
        query: this.$route.query,
      });
    },
    goToApp() {
      const redirect = auth.isAdmin && this.$route.query.redirect;
      this.$router.push(redirect || { name: 'explore' });
    },
    async submitVerification() {
  if (this.loading) return;
  this.error = '';

  if (!/^\d{6}$/.test(this.verificationCode)) {
    this.error = 'Enter a six-digit code.';
    return;
  }

  this.loading = true;
  try {
    await auth.verifyEmail(this.verificationCode);
    this.goToApp();
  } catch (e) {
    this.error = e.message;
  } finally {
    this.loading = false;
  }
},

backToLogin() {
  this.needsVerification = false;
  this.verificationCode = '';
  this.error = '';
  this.switchTo('login');
},
    async submitLogin() {
      if (!this.canLogin) return;
      this.loading = true;
      this.error = '';
      try {
        const result = await auth.login(this.login.login, this.login.password);

if (result.requiresVerification) {
  this.needsVerification = true;
  return;
}

this.goToApp();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    async submitRegister() {
      Object.keys(this.touched).forEach((k) => (this.touched[k] = true));
      if (Object.keys(this.errors).length) return;
      this.loading = true;
      this.error = '';
      try {
        const { email, username, password } = this.reg;
        const result = await auth.register({ email, username, password });

if (result.requiresVerification) {
  this.needsVerification = true;
  return;
}

this.goToApp();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.auth {
  padding: 3.2rem 3rem;
  border: 1px solid var(--line);
  border-radius: 16px;
}
.auth__tabs { display: flex; gap: 2rem; margin-bottom: 2.6rem; border-bottom: 1px solid var(--line); }
.auth__tabs button {
  background: none;
  border: 0;
  padding: 0 0 0.9rem;
  margin-bottom: -1px;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.auth__tabs button.is-active { color: var(--text); border-bottom-color: var(--yellow); }
.auth .input { padding: 1.1rem 1.2rem; font-size: 1.02rem; }
.auth .btn-block { margin-top: 0.6rem; padding: 1rem; font-size: 1rem; }
.auth__note { font-size: 0.8rem; text-align: center; margin: 1rem 0 0; }

.pw { position: relative; }
.pw__toggle { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); }

.strength { height: 2px; background: var(--line); margin-top: 0.4rem; }
.strength__bar { height: 100%; transition: width 0.3s var(--ease); }

@media (max-width: 560px) {
  .auth { padding: 1.5rem; }
}
</style>

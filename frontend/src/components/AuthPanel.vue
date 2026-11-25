<!--
  Sign-in / sign-up panel (the main element of the landing page).
  Two tabs share the same panel; the active tab follows the URL (/ or /register).
-->
<template>
  <div class="auth">
  <div v-if="!needsVerification && !resetStep" class="auth__tabs" role="tablist">
      <button role="tab" :aria-selected="mode === 'login'" :class="{ 'is-active': mode === 'login' }" @click="switchTo('login')">Sign in</button>
      <button role="tab" :aria-selected="mode === 'register'" :class="{ 'is-active': mode === 'register' }" @click="switchTo('register')">Create account</button>
    </div>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="info" class="alert alert-success">{{ info }}</p>

    <!-- ================= EMAIL VERIFICATION ================= -->
    <form v-if="needsVerification" key="verify" novalidate @submit.prevent="submitVerification">
      <h2 class="auth__title">Check your email</h2>
      <p class="muted auth__help">We sent a 6-digit code to your EFREI address.</p>
      <div class="form-field">
        <label for="verification-code">Verification code <span class="req" aria-hidden="true">*</span></label>
        <input id="verification-code" v-model.trim="verificationCode" class="input" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required />
      </div>
      <button type="submit" class="btn btn-block" :disabled="loading">Verify email</button>
      <button type="button" class="link-btn auth__back" :disabled="loading" @click="backToLogin">← Back to sign in</button>
    </form>

    <!-- ================= FORGOT PASSWORD: 1. email ================= -->
    <form v-else-if="resetStep === 'email'" key="forgot" novalidate @submit.prevent="submitForgot">
      <h2 class="auth__title">Forgot your password?</h2>
      <p class="muted auth__help">Enter your EFREI email: we will send you a 6-digit code to choose a new password.</p>
      <div class="form-field">
        <label for="forgot-email">EFREI email <span class="req" aria-hidden="true">*</span></label>
        <input id="forgot-email" v-model.trim="reset.email" type="email" class="input" placeholder="firstname.lastname@efrei.net" autocomplete="email" required />
      </div>
      <button class="btn btn-block" :disabled="loading || !reset.email">{{ loading ? 'Sending…' : 'Send the code' }}</button>
      <button type="button" class="link-btn auth__back" @click="backToLogin">← Back to sign in</button>
    </form>

    <!-- ================= FORGOT PASSWORD: 2. code + new password ================= -->
    <form v-else-if="resetStep === 'code'" key="reset" novalidate @submit.prevent="submitReset">
      <h2 class="auth__title">Choose a new password</h2>
      <p class="muted auth__help">Code sent to <strong>{{ reset.email }}</strong> (valid 10 minutes).</p>
      <div class="form-field">
        <label for="reset-code">Code received by email <span class="req" aria-hidden="true">*</span></label>
        <input id="reset-code" v-model.trim="reset.code" class="input" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required />
      </div>
      <div class="form-field">
        <label for="reset-password">New password <span class="req" aria-hidden="true">*</span></label>
        <input id="reset-password" v-model="reset.password" type="password" class="input" :class="{ 'is-invalid': reset.password && !resetPasswordOk }" autocomplete="new-password" required />
        <p v-if="reset.password && !resetPasswordOk" class="error-msg">At least 8 characters, including a letter and a digit.</p>
      </div>
      <div class="form-field">
        <label for="reset-confirm">Confirm the new password <span class="req" aria-hidden="true">*</span></label>
        <input id="reset-confirm" v-model="reset.confirm" type="password" class="input" :class="{ 'is-invalid': reset.confirm && reset.confirm !== reset.password }" autocomplete="new-password" required />
        <p v-if="reset.confirm && reset.confirm !== reset.password" class="error-msg">Passwords do not match.</p>
      </div>
      <button class="btn btn-block" :disabled="loading || !canReset">{{ loading ? 'Saving…' : 'Save the new password' }}</button>
      <button type="button" class="link-btn auth__back" :disabled="loading" @click="submitForgot">Send a new code</button>
      <button type="button" class="link-btn auth__back" @click="backToLogin">← Back to sign in</button>
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
        <button type="button" class="link-btn auth__forgot" @click="startReset">Forgot password?</button>
      </div>

      <button class="btn btn-block" :disabled="loading || !canLogin">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
    </form>

    <!-- ================= SIGN UP ================= -->
    <form v-else key="register" novalidate @submit.prevent="submitRegister">
      <p class="auth__required muted"><span class="req" aria-hidden="true">*</span> Required field</p>
      <div class="form-field">
        <label for="email">EFREI email <span class="req" aria-hidden="true">*</span></label>
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
        <label for="username">Username <span class="req" aria-hidden="true">*</span></label>
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
        <label for="password">Password <span class="req" aria-hidden="true">*</span></label>
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
        <label for="confirm">Confirm password <span class="req" aria-hidden="true">*</span></label>
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
      <p class="auth__note muted">Registration is only available with an @efrei.net email address.</p>
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
      info: '',
      needsVerification: false,
      verificationCode: '',
      resetStep: null, // null | 'email' | 'code'
      reset: { email: '', code: '', password: '', confirm: '' },
    };
  },
  computed: {
    resetPasswordOk() {
      return PASSWORD_REGEX.test(this.reset.password);
    },
    canReset() {
      return /^\d{6}$/.test(this.reset.code) && this.resetPasswordOk && this.reset.confirm === this.reset.password;
    },
    canLogin() {
      return this.login.login.length >= 3 && this.login.password.length > 0;
    },
    // Client-side validation, recomputed on every keystroke
    errors() {
      const e = {};
      if (!EMAIL_REGEX.test(this.reg.email)) e.email = 'Only @efrei.net email addresses are accepted.';
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
      this.info = '';
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
      this.resetStep = null;
      this.reset = { email: '', code: '', password: '', confirm: '' };
      this.error = '';
      this.switchTo('login');
    },
    // ----- Forgotten password -----
    startReset() {
      this.error = '';
      this.info = '';
      // If an email was already typed in the sign-in field, it is reused
      this.reset.email = this.login.login.includes('@') ? this.login.login : '';
      this.resetStep = 'email';
    },
    async submitForgot() {
      if (this.loading) return;
      this.error = '';
      this.info = '';
      if (!EMAIL_REGEX.test(this.reset.email)) {
        this.error = 'Enter your @efrei.net email address.';
        return;
      }
      this.loading = true;
      try {
        const { message } = await auth.forgotPassword(this.reset.email);
        this.info = message;
        this.resetStep = 'code';
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    async submitReset() {
      if (this.loading || !this.canReset) return;
      this.error = '';
      this.info = '';
      this.loading = true;
      try {
        const { message } = await auth.resetPassword(this.reset.code, this.reset.password);
        const email = this.reset.email;
        this.backToLogin();
        this.login.login = email;
        this.info = message;
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    async submitLogin() {
      if (!this.canLogin) return;
      this.loading = true;
      this.error = '';
      this.info = '';
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

.req { color: var(--yellow); font-weight: 700; }
.auth__required { font-size: 0.8rem; margin: -1.2rem 0 1.2rem; }
.auth__title { font-size: 1.35rem; margin: 0 0 0.4rem; }
.auth__help { font-size: 0.9rem; margin: 0 0 1.6rem; }
.auth__forgot { display: block; margin: 0.6rem 0 0 auto; font-size: 0.85rem; }
.auth__back { display: block; margin: 1rem auto 0; font-size: 0.88rem; }

.strength { height: 2px; background: var(--line); margin-top: 0.4rem; }
.strength__bar { height: 100%; transition: width 0.3s var(--ease); }

@media (max-width: 560px) {
  .auth { padding: 1.5rem; }
}
</style>

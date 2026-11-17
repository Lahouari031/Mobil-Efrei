// Server-side validation (mandatory even if the front end already validates:
// a user can bypass the front end by calling the API directly).
// These functions are synchronous: they return an array of errors (empty if everything is OK).

const EMAIL_REGEX = /^[a-z0-9._%+-]+@efrei\.(net|fr)$/i;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/; // min 8 chars, at least 1 letter and 1 digit (72 = bcrypt limit)
const TIP_CATEGORIES = ['budget', 'places', 'student-life', 'culture-language', 'schedule', 'school-resources'];

const isString = (v) => typeof v === 'string';

function validateRegister({ email, username, password }) {
  const errors = [];
  if (!isString(email) || !EMAIL_REGEX.test(email.trim())) errors.push('Invalid EFREI email (@efrei.net or @efrei.fr).');
  if (!isString(username) || !USERNAME_REGEX.test(username.trim())) errors.push('Username: 3 to 20 characters (letters, digits, _).');
  if (!isString(password) || !PASSWORD_REGEX.test(password)) errors.push('Password: at least 8 characters, with at least one letter and one digit.');
  return errors;
}

function validateLogin({ login, password }) {
  const errors = [];
  if (!isString(login) || login.trim().length < 3) errors.push('Email or username is required.');
  if (!isString(password) || password.length === 0) errors.push('Password is required.');
  return errors;
}

function validateComment({ content }) {
  const errors = [];
  if (!isString(content) || content.trim().length < 3 || content.trim().length > 500) {
    errors.push('A comment must be between 3 and 500 characters long.');
  }
  return errors;
}

function validateTip({ destinationId, category, title, content, link }) {
  const errors = [];
  if (!Number.isInteger(Number(destinationId))) errors.push('Invalid destination.');
  if (!TIP_CATEGORIES.includes(category)) errors.push('Invalid category.');
  if (!isString(title) || title.trim().length < 2 || title.trim().length > 120) errors.push('Title: 2 to 120 characters.');
  if (!isString(content) || content.trim().length < 5) errors.push('Content: at least 5 characters.');
  if (link && (!isString(link) || !/^https?:\/\//.test(link))) errors.push('The link must start with http:// or https://');
  return errors;
}

function validateDestination({ slug, country, city, summary, monthlyBudget }) {
  const errors = [];
  if (!isString(slug) || !/^[a-z0-9-]{2,60}$/.test(slug)) errors.push('Slug: lowercase letters, digits and dashes only.');
  if (!isString(country) || country.trim().length < 2) errors.push('Country is required.');
  if (!isString(city) || city.trim().length < 2) errors.push('City is required.');
  if (!isString(summary) || summary.trim().length < 10) errors.push('Summary: at least 10 characters.');
  if (monthlyBudget != null && monthlyBudget !== '' && !(Number(monthlyBudget) >= 0)) errors.push('Invalid budget.');
  return errors;
}

module.exports = {
  validateRegister,
  validateLogin,
  validateComment,
  validateTip,
  validateDestination,
  TIP_CATEGORIES,
};

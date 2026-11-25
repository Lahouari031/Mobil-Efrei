// Server-side validation (mandatory even if the front end already validates:
// a user can bypass the front end by calling the API directly).
// These functions are synchronous: they return an array of errors (empty if everything is OK).

const EMAIL_REGEX = /^[a-z0-9._%+-]+@efrei\.net$/i; // same rule as the front end (constants.js)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/; // min 8 chars, at least 1 letter and 1 digit (72 = bcrypt limit)
const TIP_CATEGORIES = ['budget', 'places', 'student-life', 'culture-language', 'schedule', 'school-resources'];

const isString = (v) => typeof v === 'string';

function validateRegister({ email, username, password }) {
  const errors = [];
  if (!isString(email) || !EMAIL_REGEX.test(email.trim())) errors.push('Only @efrei.net email addresses are accepted.');
  if (!isString(username) || !USERNAME_REGEX.test(username.trim())) errors.push('Username: 3 to 20 characters (letters, digits, _).');
  if (!isString(password) || !PASSWORD_REGEX.test(password)) errors.push('Password: at least 8 characters, with at least one letter and one digit.');
  return errors;
}

function validateEmail(email) {
  return isString(email) && EMAIL_REGEX.test(email.trim()) ? [] : ['Only @efrei.net email addresses are accepted.'];
}

function validatePassword(password) {
  return isString(password) && PASSWORD_REGEX.test(password)
    ? []
    : ['Password: at least 8 characters, with at least one letter and one digit.'];
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

function validateTip({ destinationId, category, title, content, link, address, latitude, longitude }) {
  const errors = [];
  if (!Number.isInteger(Number(destinationId))) errors.push('Invalid destination.');
  if (!TIP_CATEGORIES.includes(category)) errors.push('Invalid category.');
  if (!isString(title) || title.trim().length < 2 || title.trim().length > 120) errors.push('Title: 2 to 120 characters.');
  if (!isString(content) || content.trim().length < 5) errors.push('Content: at least 5 characters.');
  if (link && (!isString(link) || !/^https?:\/\//.test(link))) errors.push('The link must start with http:// or https://');
  if (address && (!isString(address) || address.trim().length > 255)) errors.push('Address: 255 characters max.');
  // Coordinates are optional, but if one is given the other one is required
  const hasLat = latitude !== undefined && latitude !== null && latitude !== '';
  const hasLng = longitude !== undefined && longitude !== null && longitude !== '';
  if (hasLat !== hasLng) errors.push('Give both latitude and longitude (or neither).');
  if (hasLat && !(Number(latitude) >= -90 && Number(latitude) <= 90)) errors.push('Latitude must be between -90 and 90.');
  if (hasLng && !(Number(longitude) >= -180 && Number(longitude) <= 180)) errors.push('Longitude must be between -180 and 180.');
  return errors;
}

// Accepts links like https://www.tiktok.com/@account/video/1234567890
const TIKTOK_REGEX = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d{5,25})/;

function validateVideo({ destinationId, title, url }) {
  const errors = [];
  if (!Number.isInteger(Number(destinationId)) || Number(destinationId) <= 0) errors.push('Invalid destination.');
  if (title && (!isString(title) || title.trim().length > 150)) errors.push('Title: 150 characters max.');
  if (!isString(url) || !TIKTOK_REGEX.test(url.trim())) errors.push('Paste a TikTok video link (https://www.tiktok.com/@account/video/…).');
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
  validateEmail,
  validatePassword,
  validateComment,
  validateTip,
  validateDestination,
  validateVideo,
  TIKTOK_REGEX,
  TIP_CATEGORIES,
};

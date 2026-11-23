// Tip categories: key (stored in the database) -> label displayed
export const CATEGORIES = [
  { key: 'budget', label: 'Budget' },
  { key: 'places', label: 'Best places' },
  { key: 'student-life', label: 'Student life' },
  { key: 'culture-language', label: 'Culture & language' },
  { key: 'schedule', label: 'Typical schedule' },
  { key: 'school-resources', label: 'EFREI resources' },
];

export const categoryLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

// Same rules as on the server (client-side validation = comfort, server-side = security)
export const EMAIL_REGEX = /^[a-z0-9._%+-]+@efrei\.net$/i;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

export const DEMO_DESTINATION_SLUG = 'cape-town';
export const DEMO_DESTINATION_PATH = `/destinations/${DEMO_DESTINATION_SLUG}`;

// Coordinates used by the 3D globe (latitude, longitude)
export const GLOBE_POINTS = {
  paris: { lat: 48.86, lon: 2.35 },
  capeTown: { lat: -33.92, lon: 18.42 },
};

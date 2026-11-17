// Tip categories: key (stored in the database) -> label and icon displayed
export const CATEGORIES = [
  { key: 'budget', label: 'Budget', icon: '💶' },
  { key: 'places', label: 'Best places', icon: '📍' },
  { key: 'student-life', label: 'Student life', icon: '🎒' },
  { key: 'culture-language', label: 'Culture & language', icon: '🗣️' },
  { key: 'schedule', label: 'Typical schedule', icon: '🗓️' },
  { key: 'school-resources', label: 'EFREI resources', icon: '📚' },
];

export const categoryLabel = (key) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

// Same rules as on the server (client-side validation = comfort, server-side = security)
export const EMAIL_REGEX = /^[a-z0-9._%+-]+@efrei\.(net|fr)$/i;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

// Coordinates used by the 3D globe (latitude, longitude)
export const GLOBE_POINTS = {
  paris: { lat: 48.86, lon: 2.35 },
  destinations: [
    { name: 'Cape Town', lat: -33.92, lon: 18.42 },
    { name: 'Budapest', lat: 47.5, lon: 19.04 },
    { name: 'Warsaw', lat: 52.23, lon: 21.01 },
  ],
};

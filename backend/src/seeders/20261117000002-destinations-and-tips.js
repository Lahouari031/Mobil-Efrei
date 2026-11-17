'use strict';
// Seeder: the 3 test destinations and a first set of tips.
// ⚠️ Starter content: review, complete and correct it with your own experience
// (budgets, universities, places) before the presentation.

const destinations = [
  {
    slug: 'cape-town',
    country: 'South Africa',
    city: 'Cape Town',
    university: 'Cape Peninsula University of Technology (CPUT)',
    flag: '🇿🇦',
    summary:
      'Between the ocean and Table Mountain, Cape Town offers a semester taught in English, breathtaking nature, a lively student scene and a reasonable cost of living. Stay alert about safety and how you get around, especially at night.',
    language: 'English (12 official languages)',
    currency: 'Rand (ZAR)',
    monthly_budget: 750,
    image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1600',
  },
  {
    slug: 'budapest',
    country: 'Hungary',
    city: 'Budapest',
    university: 'To be completed',
    flag: '🇭🇺',
    summary:
      'Split in two by the Danube, Budapest mixes thermal baths, ruin bars and a huge Erasmus community. Classes are taught in English and the city is a perfect base to travel around Central Europe.',
    language: 'Hungarian (classes in English)',
    currency: 'Forint (HUF)',
    monthly_budget: 800,
    image_url: 'https://images.unsplash.com/photo-1551867633-194f125bddfa?w=1600',
  },
  {
    slug: 'warsaw',
    country: 'Poland',
    city: 'Warsaw',
    university: 'To be completed',
    flag: '🇵🇱',
    summary:
      'Poland offers a dynamic student life, beautifully rebuilt cities and a cost of living lower than in France. Ideal to discover Eastern Europe and travel easily by train.',
    language: 'Polish (classes in English)',
    currency: 'Złoty (PLN)',
    monthly_budget: 750,
    image_url: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1600',
  },
];

// Tips indexed by destination slug
const tipsBySlug = {
  'cape-town': [
    { category: 'budget', title: 'Housing', content: 'Expect around €350–500 per month for a room in a shared flat or student residence near campus (Observatory, Rondebosch, Gardens). To be checked against your own experience.' },
    { category: 'budget', title: 'Groceries and going out', content: 'Supermarkets (Pick n Pay, Checkers, Woolworths) are cheaper than in France. A restaurant meal often costs €8–15.' },
    { category: 'places', title: 'Old Biscuit Mill', content: 'The Saturday morning market in Woodstock: street food, local designers and a great vibe to kick off the weekend.' },
    { category: 'places', title: "Lion's Head at sunrise", content: 'About a 1.5-hour round-trip hike, best done in a group. 360° view over the city, Table Mountain and the ocean.' },
    { category: 'student-life', title: 'Getting around', content: 'Uber or Bolt are the norm, especially at night. The MyCiTi bus is handy during the day on some routes. Avoid walking alone after dark.' },
    { category: 'culture-language', title: 'Languages', content: 'English is enough everywhere. Learning a few words of Afrikaans or isiXhosa ("Molo" means hello) is always appreciated.' },
    { category: 'schedule', title: 'Typical week', content: 'Classes concentrated from Monday to Thursday, Fridays often free for road trips (Garden Route, Cederberg, Hermanus).' },
    { category: 'school-resources', title: 'EFREI documents', content: "Add here the links to the school's resources: learning agreement, mobility guide, international office contacts." },
  ],
  budapest: [
    { category: 'budget', title: 'Housing', content: 'A room in a shared flat costs around €300–450 per month depending on the district (the VII, VIII and IX districts are popular with students).' },
    { category: 'budget', title: 'Public transport', content: 'The BKK student monthly pass is very affordable with a valid student card.' },
    { category: 'places', title: 'Szimpla Kert', content: 'The most famous ruin bar, in the Jewish Quarter. A must at least once, ideally early in the evening.' },
    { category: 'places', title: 'Széchenyi Baths', content: "The city's best-known thermal baths, in City Park. A unique experience in winter." },
    { category: 'student-life', title: 'Erasmus network', content: 'Join the local ESN (Erasmus Student Network) as soon as you arrive: parties, trips and a buddy system.' },
    { category: 'culture-language', title: 'A few words of Hungarian', content: '"Szia" (hi), "Köszönöm" (thank you), "Egészségedre" (cheers!). Hungarian is hard, but the effort is appreciated.' },
    { category: 'school-resources', title: 'EFREI documents', content: "Add here the links to the school's resources for this destination." },
  ],
  warsaw: [
    { category: 'budget', title: 'Housing', content: 'Expect around €300–450 per month for a room in Warsaw, a bit less in other university cities.' },
    { category: 'budget', title: 'Eating on a budget', content: 'Milk bars ("bar mleczny") serve traditional Polish dishes at low prices: pierogi, soups, naleśniki.' },
    { category: 'places', title: 'Old Town and Łazienki Park', content: 'The Old Town, rebuilt after the war, and the huge Łazienki Park for sunny days.' },
    { category: 'student-life', title: 'Getting around', content: 'The Jakdojade app lets you plan your trips and buy public transport tickets.' },
    { category: 'culture-language', title: 'A few words of Polish', content: '"Cześć" (hi), "Dziękuję" (thank you), "Na zdrowie" (cheers!).' },
    { category: 'school-resources', title: 'EFREI documents', content: "Add here the links to the school's resources for this destination." },
  ],
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'destinations',
      destinations.map((d) => ({ ...d, created_at: now, updated_at: now }))
    );

    // Fetch the generated ids to link each tip to its destination
    const rows = await queryInterface.sequelize.query('SELECT id, slug FROM destinations', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const idBySlug = Object.fromEntries(rows.map((r) => [r.slug, r.id]));

    const tips = [];
    for (const [slug, list] of Object.entries(tipsBySlug)) {
      for (const t of list) {
        tips.push({ ...t, link: null, destination_id: idBySlug[slug], created_at: now, updated_at: now });
      }
    }
    await queryInterface.bulkInsert('tips', tips);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tips', null, {});
    await queryInterface.bulkDelete('destinations', null, {});
  },
};

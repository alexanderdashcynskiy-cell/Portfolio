export interface WorldCard {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tagline: string[];
  category: string;
  image: string;
  tags: string[];
  description: string;
}

export const WORLD_FILTERS = ['ALL WORK', 'WEB', 'APPS', 'MINI APPS', 'DASHBOARDS', 'UX / UI'];

export const WORLDS: WorldCard[] = [
  {
    id: 'vincent',
    number: '01',
    title: 'VINCENT',
    subtitle: 'RESTAURANT',
    tagline: ['A digital', 'experience for', 'modern restaurants.'],
    category: 'RESTAURANTS',
    image: '/worlds/vincent.jpg',
    tags: ['WEB', 'UX / UI'],
    description:
      'An atmospheric digital experience for a candle-lit fine dining restaurant: menu, reservations and the story of the place in one calm interface.',
  },
  {
    id: 'rebro',
    number: '02',
    title: 'РЕБРО',
    subtitle: 'GASTROBAR',
    tagline: ['Bold taste', 'meets digital', 'experience.'],
    category: 'FOOD & BEVERAGE',
    image: '/worlds/rebro.jpg',
    tags: ['WEB', 'MINI APPS'],
    description:
      'A bold, fire-and-meat identity translated into a fast mobile-first site for a gastrobar: menu, events and table booking.',
  },
  {
    id: 'paradise',
    number: '03',
    title: 'PARADISE',
    subtitle: 'HOTEL & BAKERY',
    tagline: ['A lifestyle', 'experience', 'in every detail.'],
    category: 'HOSPITALITY',
    image: '/worlds/paradise.jpg',
    tags: ['WEB', 'APPS', 'UX / UI'],
    description:
      'A sunlit hospitality product that combines hotel booking with a bakery storefront — one brand, two worlds, a single seamless flow.',
  },
  {
    id: 'dziakui',
    number: '04',
    title: 'ДЗЯКУЙ',
    subtitle: 'CULTURAL PROJECT',
    tagline: ['Tradition', 'reimagined', 'for a digital era.'],
    category: 'CULTURE',
    image: '/worlds/dziakui.jpg',
    tags: ['WEB', 'APPS'],
    description:
      'A cultural project that brings heritage and classical art into a modern digital format — editorial storytelling with a museum-grade feel.',
  },
  {
    id: 'pellegrino',
    number: '05',
    title: 'PELLEGRINO',
    subtitle: 'ITALIAN RESTAURANT',
    tagline: ['Heritage,', 'taste and modern', 'digital experience.'],
    category: 'LIFESTYLE',
    image: '/worlds/pellegrino.jpg',
    tags: ['WEB', 'MINI APPS', 'DASHBOARDS'],
    description:
      'An Italian restaurant experience where family heritage meets a modern product: rich food photography, menu and online ordering.',
  },
];

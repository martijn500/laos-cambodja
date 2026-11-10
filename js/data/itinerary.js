/**
 * One stop on the trip: a day, or a side quest on the same date.
 * @typedef {object} Stop
 * @property {string} date      "MA · 22 FEB"; side quests share their day's date
 * @property {string} flags     country flag(s), "🇹🇭 → 🇱🇦" on a border day
 * @property {string} title
 * @property {{ name: string, coordinates: [number, number], zoom: number }} location
 *   name "Place · Country"; coordinates [lat, lng]
 * @property {string} quote
 * @property {string} detail
 * @property {string} sleep     "Slaap: …"
 * @property {string} icon      emoji for the kind of day
 * @property {string} iconLabel what the icon means (screen readers, tooltips)
 * @property {keyof typeof import("./photos.js").photos} photo
 *   fallback photo when img/slides/<day>/ has none
 * @property {keyof typeof import("./themes.js").stopThemes} theme
 * @property {boolean} [sideQuest]
 * @property {"top"} [caricatureAlign] cartoon aligned to the top of the photo
 * @property {false} [caricature]       no cartoon for this stop
 * @property {number} [slideIndex]      set by slides/build.js
 */

/** @type {Stop[]} */
export const itinerary = [
  {
    date: "MA · 15 FEB",
    flags: "🇳🇱",
    title: "Vertrek uit Amsterdam",
    location: {
      name: "Amsterdam · Nederland",
      coordinates: [52.3105, 4.7683],
      zoom: 6,
    },
    quote:
      '"The journey of a thousand miles begins with a single step... and a massive flex." — Lao Tzu',
    detail:
      "Instappen, stoelriem vast en 12 uur lang onbeperkt vliegzeug-snacks bouwen op 10 km hoogte.",
    sleep: "Slaap: aan boord",
    icon: "✈️",
    iconLabel: "Vlucht",
    photo: "flight",
    theme: "amsterdam",
  },
  {
    date: "DI · 16 FEB",
    flags: "🇹🇭",
    title: "Aankomst Chiang Rai",
    location: {
      name: "Chiang Rai · Thailand",
      coordinates: [19.9072, 99.8325],
      zoom: 8,
    },
    quote:
      '"Bro is geland. Direct 100.000% aura opgebouwd bij de Witte Tempel." — Sun Tzu',
    detail:
      "Inchecken, jetlag wegblazen en meteen flexen bij de felwitte tempels en gigantische draken.",
    sleep: "Slaap: Chiang Rai",
    icon: "🛬",
    iconLabel: "Aankomst",
    photo: "chiangRai",
    theme: "chiangRai",
  },
  {
    date: "WO · 17 FEB",
    flags: "🇹🇭 → 🇱🇦",
    title: "Grens over naar Huay Xai",
    location: {
      name: "Huay Xai · Laos",
      coordinates: [20.2761, 100.4134],
      zoom: 9,
    },
    quote:
      '"Niemand kan de grens oversteken zonder een vleugje chaos." — Julius Caesar',
    detail:
      "Border-crossing madness! Stempels jagen, busje pakken en de Laotiaanse grens invallen.",
    sleep: "Slaap: Huay Xai",
    icon: "🚐",
    iconLabel: "Grensovergang per transfer",
    photo: "mekongBorderSunset",
    theme: "huayXai",
  },
  {
    date: "DO · 18 FEB",
    flags: "🇱🇦",
    title: "Gibbon Experience: dag 1",
    location: {
      name: "Bokeo Nature Reserve · Laos",
      coordinates: [20.337, 100.618],
      zoom: 9,
    },
    quote:
      '"Do not go where the path may lead, go instead where there is no path and leave a zipline." — Ralph Waldo Emerson',
    detail:
      "Vlieg als een absolute gigachad met 60 km/u over de jungletoppen en slaap in giga boomhutten.",
    sleep: "Slaap: boomhut in de jungle",
    icon: "🪢",
    iconLabel: "Zipline",
    photo: "jungle",
    theme: "gibbon",
  },
  {
    date: "VR · 19 FEB",
    flags: "🇱🇦",
    title: "Gibbon Experience: dag 2",
    location: {
      name: "Huay Xai · Laos",
      coordinates: [20.2761, 100.4134],
      zoom: 9,
    },
    quote:
      '"Tarzan droomt hiervan. Adrenaline niveau: OVER 9000." — Charles Darwin',
    detail:
      "Wakker worden boven de wolken, keihard ziplinen door de ochtendmist en terug hiken.",
    sleep: "Slaap: Huay Xai",
    icon: "🥾",
    iconLabel: "Jungletocht",
    photo: "jungle",
    theme: "gibbon",
  },
  {
    date: "ZA · 20 FEB",
    flags: "🇱🇦",
    title: "Slowboat naar Pakbeng",
    location: {
      name: "Pakbeng · Laos",
      coordinates: [19.8938, 101.1357],
      zoom: 9,
    },
    quote:
      '"There is nothing—absolutely nothing—half so much worth doing as simply messing about in boats." — Kenneth Grahame',
    detail:
      "De ultieme ontprikkeling: houten slowboat op de Mekong, staren naar bergen en verstand op nul.",
    sleep: "Slaap: Pakbeng",
    icon: "🚤",
    iconLabel: "Slowboat",
    photo: "mekong",
    theme: "slowboat",
  },
  {
    date: "ZO · 21 FEB",
    flags: "🇱🇦",
    title: "Slowboat naar Luang Prabang",
    location: {
      name: "Luang Prabang · Laos",
      coordinates: [19.8833, 102.1347],
      zoom: 9,
    },
    quote:
      '"Slowboat mode: nul wifi, puur chillon op de stroom van de rivier." — Confucius',
    detail:
      "Dag twee op het water, rivierdorpjes spotten en in de namiddag binnenglijden bij Luang Prabang.",
    sleep: "Slaap: Luang Prabang",
    icon: "🚤",
    iconLabel: "Slowboat",
    photo: "mekongSlowboat",
    theme: "slowboat",
  },
  {
    date: "MA · 22 FEB",
    flags: "🇱🇦",
    title: "Luang Prabang: oude stad",
    location: {
      name: "Luang Prabang · Laos",
      coordinates: [19.8833, 102.1347],
      zoom: 10,
    },
    quote:
      '"There\'s a sunrise and a sunset every single day, especially from Phousi Hill." — Jo Walton',
    detail:
      "Gouden tempels, 355 treden Phousi Hill climben voor de zonsondergang en de nachtmarkt leegkopen.",
    sleep: "Slaap: Luang Prabang",
    icon: "🛕",
    iconLabel: "Tempelbezoek",
    photo: "luangPrabang",
    theme: "luangPrabang",
  },
  {
    date: "MA · 22 FEB",
    flags: "🇱🇦",
    title: "SIDE QUEST: NAGINI BAR 🐍",
    location: {
      name: "Luang Prabang · Laos",
      coordinates: [19.8833, 102.1347],
      zoom: 10,
    },
    sideQuest: true,
    quote: '"After enlightenment comes happy hour." — De innerlijke monnik',
    detail:
      "Na de tempels en Phousi Hill is het tijd voor een classy side quest. Cocktails met Lao-invloeden, een koloniaal mansion en uitzicht over de Mekong. BRO UNLOCKED THE LUXURY SKIN 🍸",
    sleep: "Slaap: Luang Prabang",
    icon: "🍸",
    iconLabel: "Cocktails",
    photo: "nagini",
    theme: "luangPrabang",
  },
  {
    date: "DI · 23 FEB",
    flags: "🇱🇦",
    title: "Kuang Si-watervallen",
    location: {
      name: "Kuang Si · Laos",
      coordinates: [19.7492, 101.9914],
      zoom: 10,
    },
    quote:
      '"Turquoise waterfijnheid levert een instant dopamine-hit op." — Aristoteles',
    detail:
      "Plonzen in de meest onwerkelijk blauwe waterval-pools ooit. Pure natuurlijk gekoelde adrenaline.",
    sleep: "Slaap: Luang Prabang",
    icon: "💦",
    iconLabel: "Watervallen",
    photo: "waterfall",
    theme: "luangPrabang",
  },
  {
    date: "WO · 24 FEB",
    flags: "🇱🇦",
    title: "Trein naar Vang Vieng",
    location: {
      name: "Vang Vieng · Laos",
      coordinates: [18.925, 102.447],
      zoom: 9,
    },
    quote: '"Sneller dan de rivier, strakker dan de karstbergen." — Marco Polo',
    detail:
      "In sneltreinvaart door de bergen knallen richting het outdoor-walhalla van Laos.",
    sleep: "Slaap: Vang Vieng",
    icon: "🚆",
    iconLabel: "Trein",
    photo: "train",
    theme: "vangVieng",
  },
  {
    date: "DO · 25 FEB",
    flags: "🇱🇦",
    title: "Vang Vieng: natuurdag",
    location: {
      name: "Vang Vieng · Laos",
      coordinates: [18.925, 102.447],
      zoom: 10,
    },
    quote:
      '"The sky is not the limit, it\'s just the view from my balloon." — Amelia Earhart',
    detail:
      "Zweven in een luchtballon boven bizarre karstbergen, kajakken of loungen bij Blue Lagoons.",
    sleep: "Slaap: Vang Vieng",
    icon: "🎈",
    iconLabel: "Ballonvaart of outdoor-avontuur",
    photo: "vangVieng",
    // The balloon caricature floats at the top of the card
    caricatureAlign: "top",
    theme: "vangVieng",
  },
  {
    date: "VR · 26 FEB",
    flags: "🇱🇦",
    title: "Trein naar Vientiane",
    location: {
      name: "Vientiane · Laos",
      coordinates: [17.9757, 102.6331],
      zoom: 9,
    },
    quote:
      '"Op weg naar de hoofdstad met 100% zendag-energie." — Gautama Boeddha',
    detail:
      "Soepel doorzoeven naar de hoofdstad voor boulevard-vibes en epische avondsnacks.",
    sleep: "Slaap: Vientiane",
    icon: "🚆",
    iconLabel: "Trein",
    photo: "vientiane",
    theme: "vientiane",
  },
  {
    date: "VR · 26 FEB",
    flags: "🇱🇦",
    title: "SIDE QUEST: BUDDHA PARK 🗿",
    location: {
      name: "Buddha Park · Laos",
      coordinates: [17.9751, 102.7645],
      zoom: 11,
    },
    sideQuest: true,
    quote:
      '"The universe is full of mysteries. Some are made of concrete." — Gautama Broddha',
    detail:
      "Meer dan 200 bizarre beelden uit de boeddhistische en hindoeïstische mythologie. Een gigantische fantasywereld van beton. BRO ENTERED THE BUDDHA MULTIVERSE 💀",
    sleep: "Slaap: Vientiane",
    icon: "🗿",
    iconLabel: "Buddha Park",
    photo: "buddhaPark",
    theme: "vientiane",
  },
  {
    date: "ZA · 27 FEB",
    flags: "🇱🇦 → 🇰🇭",
    title: "Vlucht naar Siem Reap",
    location: {
      name: "Siem Reap · Cambodja",
      coordinates: [13.3633, 103.8564],
      zoom: 9,
    },
    quote:
      '"Grenzen oversteken is makkelijk als de tempels op je wachten." — Genghis Khan',
    detail:
      "Vleugels uitslaan, Laos inruilen voor Cambodja en klaarmaken voor het wereldwonder.",
    sleep: "Slaap: Siem Reap",
    icon: "✈️",
    iconLabel: "Vlucht",
    photo: "flight",
    theme: "angkor",
  },
  {
    date: "ZO · 28 FEB",
    flags: "🇰🇭",
    title: "Angkor Wat & Ta Prohm",
    location: {
      name: "Angkor Wat · Cambodja",
      coordinates: [13.4125, 103.867],
      zoom: 10,
    },
    quote:
      '"Look at the sun. It is shining for you and your reflection in the temple pool." — Alexander de Grote',
    detail:
      "04:30 wekker: sunrise bij de spiegelvijver van Angkor Wat & Tomb Raider spelen tussen de bomen.",
    sleep: "Slaap: Siem Reap",
    icon: "🌅",
    iconLabel: "Tempels bij zonsopkomst",
    photo: "angkor",
    theme: "angkor",
  },
  {
    date: "MA · 1 MRT",
    flags: "🇰🇭",
    title: "Siem Reap: extra dag",
    location: {
      name: "Siem Reap · Cambodja",
      coordinates: [13.3633, 103.8564],
      zoom: 9,
    },
    quote:
      '"Nature always wins. Especially tree roots in ancient stones." — Charles Darwin',
    detail:
      "No-stress chilldag: rustig nog een verborgen tempel meepakken of keihard chillen aan het zwembad.",
    sleep: "Slaap: Siem Reap",
    icon: "🌿",
    iconLabel: "Rust- of tempeldag",
    photo: "taProhm",
    theme: "angkor",
  },
  {
    date: "MA · 1 MRT",
    flags: "🇰🇭",
    title: "SIDE QUEST: STREET 08 🌃",
    location: {
      name: "Siem Reap · Cambodja",
      coordinates: [13.355, 103.854],
      zoom: 11,
    },
    sideQuest: true,
    quote:
      '"Work hard, play hard. Especially after 1000 years of temple grinding." — Confucius',
    detail:
      "De zon gaat onder, de neonlichten springen aan en Pub Street ontwaakt. Cocktails, bars, muziek en totale chaos. ANGKOR WAT BY DAY, ABSOLUTE MENACE BY NIGHT 🔥",
    sleep: "Slaap: Siem Reap",
    icon: "🌃",
    iconLabel: "Nightlife",
    photo: "street08",
    theme: "angkor",
  },
  {
    date: "DI · 2 MRT",
    flags: "🇰🇭",
    title: "Bus naar Phnom Penh",
    location: {
      name: "Phnom Penh · Cambodja",
      coordinates: [11.5564, 104.9282],
      zoom: 9,
    },
    quote:
      '"Het gaat niet om de busrit, het gaat om de aura waarmee je aankomt." — Napoleon Bonaparte',
    detail:
      "Roadtrip door het Cambodjaanse platteland op weg naar de bruisende hoofdstad.",
    sleep: "Slaap: Phnom Penh · nacht 1/2",
    icon: "🚌",
    iconLabel: "Bus",
    photo: "bus",
    theme: "phnomPenh",
  },
  {
    date: "WO · 3 MRT",
    flags: "🇰🇭",
    title: "Phnom Penh: volle dag",
    location: {
      name: "Phnom Penh · Cambodja",
      coordinates: [11.5564, 104.9282],
      zoom: 10,
    },
    quote:
      '"Koninklijke paleisen, rivierviews en keihard genieten op de finale avond." — Sisi',
    detail:
      "Koninklijk Paleis uitchecken, slenteren langs de Riverside en de allerlaatste avond groots vieren.",
    sleep: "Slaap: Phnom Penh · nacht 2/2",
    icon: "🏙️",
    iconLabel: "Stadsdag",
    photo: "phnomPenh",
    theme: "phnomPenh",
  },
  {
    date: "DO · 4 MRT",
    flags: "🇰🇭 → 🇳🇱",
    title: "Terug naar Hoesoe",
    location: {
      name: "Amsterdam · Nederland",
      coordinates: [52.3105, 4.7683],
      zoom: 6,
    },
    quote:
      "\"Don't cry because it's over, smile because it was absolutely legendary.\" — Dr. Seuss",
    detail:
      "Vroeg de koffers dichtrammen, vlieger in en met een vrachtlading aan memories en aura naar huis.",
    sleep: "Slaap: thuis",
    icon: "✈️",
    iconLabel: "Terugvlucht",
    photo: "flight",
    theme: "amsterdam",
  },
];

export const tripDayNumbers = new Map();

// Cartoons: img/cartoons/08.webp for the day itself, 08-s1.webp, 08-s2.webp… for its side quests
export const caricatureNames = new Map();

export const sideQuestCounts = new Map();

itinerary.forEach((stop) => {
  if (!tripDayNumbers.has(stop.date)) {
    tripDayNumbers.set(stop.date, tripDayNumbers.size + 1);
  }
  const dayName = String(tripDayNumbers.get(stop.date)).padStart(2, "0");
  if (stop.sideQuest) {
    const count = (sideQuestCounts.get(stop.date) || 0) + 1;
    sideQuestCounts.set(stop.date, count);
    caricatureNames.set(stop, `${dayName}-s${count}`);
  } else {
    caricatureNames.set(stop, dayName);
  }
});

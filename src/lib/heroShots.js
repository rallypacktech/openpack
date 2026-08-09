// Registry of hero background images for the home page and each landing page.
// Used by useHeroShot (page rendering) and HeroShotsPanel (admin editing).
// Keep page_key values in sync with the useHeroShot(pageKey) calls in each page.
export const HERO_SHOTS = [
  {
    page_key: "home",
    label: "Home (landing page)",
    default_url:
      "https://images.unsplash.com/photo-1594156596782-656c93e4d504?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    page_key: "wildfire",
    label: "Wildfire",
    default_url:
      "https://images.unsplash.com/photo-1619461129861-d0c1479c48b4?q=80&w=1376&auto=format&fit=crop",
  },
  {
    page_key: "hurricane",
    label: "Hurricane",
    default_url:
      "https://images.unsplash.com/photo-1629203328214-415e41c4aba8?w=1800&auto=format&fit=crop&q=60",
  },
  {
    page_key: "flood",
    label: "Flood",
    default_url:
      "https://images.unsplash.com/photo-1568438350562-2cae6d394ad0?w=1800&q=85",
  },
  {
    page_key: "tornado",
    label: "Tornado",
    default_url:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?q=80&w=1374&auto=format&fit=crop",
  },
  {
    page_key: "equine",
    label: "Equine / Horses",
    default_url:
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1800&q=85",
  },
  {
    page_key: "canine",
    label: "Canine / Dogs",
    default_url:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1800&q=85",
  },
  {
    page_key: "feline",
    label: "Feline / Cats",
    default_url:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1800&q=85",
  },
  {
    page_key: "infant",
    label: "Infants",
    default_url:
      "https://images.unsplash.com/photo-1570657891791-e39a9d185540?w=1800&q=85",
  },
  {
    page_key: "avian",
    label: "Avian / Birds",
    default_url:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1800&q=85",
  },
  {
    page_key: "reptile",
    label: "Reptiles",
    default_url:
      "https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=1800&q=85",
  },
  {
    page_key: "livestock",
    label: "Livestock",
    default_url:
      "https://images.unsplash.com/photo-1588152850700-c82ecb8ba9b1?w=1800&q=85",
  },
  {
    page_key: "about",
    label: "About Us",
    default_url:
      "https://media.base44.com/images/public/69dc170f0871ac017d79debb/aa879fed8_StaffLoraMcGrath_Peanut_0430_bySonyaSellers.jpg",
  },
  {
    page_key: "wildfire_cta",
    label: "Wildfire — closing background",
    default_url:
      "https://images.unsplash.com/photo-1692364221415-654b20e6d1d2?w=900&auto=format&fit=crop&q=60",
  },
  {
    page_key: "flood_cta",
    label: "Flood — closing background",
    default_url:
      "https://images.unsplash.com/photo-1568438350562-2cae6d394ad0?w=1600&q=80",
  },
  {
    page_key: "canine_editorial",
    label: "Canine — editorial background",
    default_url:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80",
  },
  {
    page_key: "feline_editorial",
    label: "Feline — editorial background",
    default_url:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=1600&q=80",
  },
  {
    page_key: "infant_editorial",
    label: "Infant — editorial background",
    default_url:
      "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=1600&q=80",
  },
  {
    page_key: "avian_editorial",
    label: "Avian — editorial background",
    default_url:
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1600&q=80",
  },
  {
    page_key: "livestock_cta",
    label: "Livestock — closing background",
    default_url:
      "https://images.unsplash.com/photo-1605000797489-7b29f30f5d9b?w=1600&q=80",
  },
  {
    page_key: "home_wildfire",
    label: "Home — wildfire (problem statement)",
    default_url:
      "https://images.unsplash.com/photo-1661177408809-4184b3b65f2c?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    page_key: "home_pets",
    label: "Home — pets & animals",
    default_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80",
  },
  {
    page_key: "home_planning",
    label: "Home — emergency planning",
    default_url: "https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1600&q=80",
  },
  {
    page_key: "home_scenario_shelter",
    label: "Home — Shelter in Place",
    default_url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80",
  },
  {
    page_key: "home_scenario_evac",
    label: "Home — Evacuation Ready",
    default_url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
  },
  {
    page_key: "home_scenario_outdoor",
    label: "Home — Outdoor Adventures",
    default_url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80",
  },
  {
    page_key: "home_community",
    label: "Home — community resilience",
    default_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
  },
  {
    page_key: "home_final_cta",
    label: "Home — final CTA background",
    default_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80",
  },
];
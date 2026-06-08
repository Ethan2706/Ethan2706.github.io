/* ============================================================
   Re:Wear, data.js
   Hardcoded demo data. Attached to window for cross-file access.
   ============================================================ */

/* Environmental savings per category, vs buying the item new.
   Sourced from the brief (UNEP / Ellen MacArthur figures). */
const SAVINGS = {
  Tops:        { water: 2700, co2: 4 },
  Bottoms:     { water: 7600, co2: 8 },
  Outerwear:   { water: 4200, co2: 7 },
  Dresses:     { water: 3500, co2: 5 },
  Shoes:       { water: 1200, co2: 3 },
  Accessories: { water: 1500, co2: 2 },
};

/* Material footprint multipliers vs the category baseline.
   Reflects how water/carbon intensive each fabric is to produce new. */
const MATERIALS = {
  "Cotton":         { water: 1.3, co2: 1.0 },
  "Organic Cotton": { water: 0.6, co2: 0.8 },
  "Denim":          { water: 1.5, co2: 1.1 },
  "Polyester":      { water: 0.5, co2: 1.3 },
  "Nylon":          { water: 0.6, co2: 1.3 },
  "Wool":           { water: 1.1, co2: 1.6 },
  "Linen":          { water: 0.5, co2: 0.7 },
  "Silk":           { water: 1.2, co2: 1.1 },
  "Leather":        { water: 1.6, co2: 1.8 },
  "Blend / Mixed":  { water: 1.0, co2: 1.0 },
  "Other":          { water: 1.0, co2: 1.0 },
};

/* Size & cut ("dimensions") scales impact by how much fabric is involved. */
const SIZE_PROFILES = {
  "XS / Petite":      0.75,
  "S / M":            0.9,
  "Standard":         1.0,
  "L / XL":           1.2,
  "Oversized / Plus": 1.4,
};

/* Ordered condition scale used by the visual condition meter. */
const CONDITION_SCALE = ["Like New", "Excellent", "Good", "Fair", "Worn"];

/* Eight hardcoded listings. `tone` drives the placeholder swatch hue
   so blank image frames still feel intentional and varied. */
const LISTINGS = [
  {
    id: "l1",
    name: "Vintage Levi's Denim Jacket",
    brand: "Levi's",
    category: "Outerwear",
    size: "M",
    condition: "Excellent",
    lister: "maya.j",
    swapScore: 4.8,
    reputation: 4.9,
    wanted: 42,
    distanceKm: 1.2,
    addedDaysAgo: 1,
    tags: ["Vintage", "Denim", "Unisex"],
    note: "Looking to swap for a knit or a light spring coat.",
    tone: 212,
    material: "Denim",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/12083001/pexels-photo-12083001.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l2",
    name: "Beige Ribbed Knit Sweater",
    brand: "Aritzia",
    category: "Tops",
    size: "S",
    condition: "Like New",
    lister: "thriftedbyeli",
    swapScore: 4.5,
    reputation: 4.6,
    wanted: 31,
    distanceKm: 2.8,
    addedDaysAgo: 2,
    tags: ["Cozy", "Neutral", "Minimal"],
    note: "Worn twice. Happy to swap for tops or accessories.",
    tone: 34,
    material: "Wool",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/6630834/pexels-photo-6630834.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l3",
    name: "Black Wide Leg Trousers",
    brand: "Uniqlo",
    category: "Bottoms",
    size: "28",
    condition: "Good",
    lister: "closetclean",
    swapScore: 4.2,
    reputation: 4.3,
    wanted: 18,
    distanceKm: 4.1,
    addedDaysAgo: 3,
    tags: ["Tailored", "Workwear", "Black"],
    note: "Great drape. Open to bottoms or shoes.",
    tone: 220,
    material: "Polyester",
    dimensions: "Standard",
    image: "https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l4",
    name: "Floral Wrap Dress",
    brand: "Reformation",
    category: "Dresses",
    size: "M",
    condition: "Like New",
    lister: "sam.rewear",
    swapScore: 5.0,
    reputation: 5.0,
    wanted: 57,
    distanceKm: 0.9,
    addedDaysAgo: 1,
    tags: ["Floral", "Summer", "Statement"],
    note: "Perfect for warm weather. Hoping to swap for outerwear.",
    tone: 4,
    material: "Silk",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/7509903/pexels-photo-7509903.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l5",
    name: "Oversized Graphic Hoodie",
    brand: "Champion",
    category: "Tops",
    size: "L",
    condition: "Good",
    lister: "loopwardrobe",
    swapScore: 3.9,
    reputation: 4.0,
    wanted: 12,
    distanceKm: 6.3,
    addedDaysAgo: 5,
    tags: ["Streetwear", "Oversized", "Cozy"],
    note: "Soft and broken in. Swap for any size tops.",
    tone: 268,
    material: "Cotton",
    dimensions: "Oversized / Plus",
    image: "https://images.pexels.com/photos/7236120/pexels-photo-7236120.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l6",
    name: "White Button Down Oxford",
    brand: "J.Crew",
    category: "Tops",
    size: "S",
    condition: "Excellent",
    lister: "cleancloset",
    swapScore: 4.7,
    reputation: 4.8,
    wanted: 26,
    distanceKm: 3.5,
    addedDaysAgo: 2,
    tags: ["Classic", "Crisp", "Workwear"],
    note: "A wardrobe staple. Open to most swaps.",
    tone: 200,
    material: "Cotton",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/3214768/pexels-photo-3214768.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l7",
    name: "Brown Leather Look Boots",
    brand: "Dr. Martens",
    category: "Shoes",
    size: "7",
    condition: "Good",
    lister: "stepup.swap",
    swapScore: 4.4,
    reputation: 4.5,
    wanted: 23,
    distanceKm: 5.0,
    addedDaysAgo: 4,
    tags: ["Boots", "Autumn", "Durable"],
    note: "Some honest wear, lots of life left. Swap for shoes 6.5-7.5.",
    tone: 24,
    material: "Leather",
    dimensions: "Standard",
    image: "https://images.pexels.com/photos/37827331/pexels-photo-37827331.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l8",
    name: "Puffer Vest",
    brand: "The North Face",
    category: "Outerwear",
    size: "M",
    condition: "Like New",
    lister: "northlook",
    swapScore: 4.6,
    reputation: 4.7,
    wanted: 34,
    distanceKm: 1.8,
    addedDaysAgo: 1,
    tags: ["Layering", "Outdoor", "Warm"],
    note: "Barely used. Hoping to swap for a heavier coat.",
    tone: 150,
    material: "Nylon",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/6147124/pexels-photo-6147124.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l9",
    name: "Plaid Flannel Shirt",
    brand: "L.L.Bean",
    category: "Tops",
    size: "M",
    condition: "Good",
    lister: "forestfinds",
    swapScore: 4.3,
    reputation: 4.4,
    wanted: 19,
    distanceKm: 3.2,
    addedDaysAgo: 2,
    tags: ["Cozy", "Autumn", "Unisex"],
    note: "Super warm and broken in. Swap for tees or a hoodie.",
    tone: 2,
    material: "Cotton",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/14773602/pexels-photo-14773602.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l10",
    name: "High-Waisted Mom Jeans",
    brand: "Levi's",
    category: "Bottoms",
    size: "27",
    condition: "Excellent",
    lister: "denimdays",
    swapScore: 4.6,
    reputation: 4.7,
    wanted: 38,
    distanceKm: 2.1,
    addedDaysAgo: 1,
    tags: ["Vintage", "Denim", "High-Waist"],
    note: "Classic blue wash. Looking to swap for trousers or a skirt.",
    tone: 215,
    material: "Denim",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/17503375/pexels-photo-17503375.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l11",
    name: "Canvas Tote Bag",
    brand: "Baggu",
    category: "Accessories",
    size: "OS",
    condition: "Like New",
    lister: "ecocarry",
    swapScore: 4.8,
    reputation: 4.9,
    wanted: 27,
    distanceKm: 1.5,
    addedDaysAgo: 1,
    tags: ["Everyday", "Minimal", "Reusable"],
    note: "Barely used. Happy to swap for any accessory.",
    tone: 35,
    material: "Cotton",
    dimensions: "Standard",
    image: "https://images.pexels.com/photos/7735446/pexels-photo-7735446.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l12",
    name: "Chunky Knit Beanie",
    brand: "Carhartt",
    category: "Accessories",
    size: "OS",
    condition: "Like New",
    lister: "cozyknits",
    swapScore: 4.5,
    reputation: 4.6,
    wanted: 22,
    distanceKm: 4.6,
    addedDaysAgo: 3,
    tags: ["Warm", "Winter", "Knit"],
    note: "Only worn a couple of times. Swap for a scarf or gloves.",
    tone: 280,
    material: "Wool",
    dimensions: "XS / Petite",
    image: "https://images.pexels.com/photos/7026766/pexels-photo-7026766.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l13",
    name: "White Leather Sneakers",
    brand: "Adidas",
    category: "Shoes",
    size: "8",
    condition: "Good",
    lister: "stepforward",
    swapScore: 4.4,
    reputation: 4.5,
    wanted: 31,
    distanceKm: 5.4,
    addedDaysAgo: 4,
    tags: ["Classic", "Everyday", "Minimal"],
    note: "Cleaned up well, a little wear on the soles. Swap for shoes 7.5-8.5.",
    tone: 200,
    material: "Leather",
    dimensions: "Standard",
    image: "https://images.pexels.com/photos/533442/pexels-photo-533442.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l14",
    name: "Linen Midi Dress",
    brand: "Everlane",
    category: "Dresses",
    size: "S",
    condition: "Excellent",
    lister: "sunnystory",
    swapScore: 4.9,
    reputation: 4.9,
    wanted: 44,
    distanceKm: 0.7,
    addedDaysAgo: 1,
    tags: ["Summer", "Breathable", "Neutral"],
    note: "Lightweight and lovely. Hoping to swap for a dress or top.",
    tone: 45,
    material: "Linen",
    dimensions: "S / M",
    image: "https://images.pexels.com/photos/7789140/pexels-photo-7789140.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l15",
    name: "Camel Wool Overcoat",
    brand: "Zara",
    category: "Outerwear",
    size: "L",
    condition: "Excellent",
    lister: "autumnlayers",
    swapScore: 4.7,
    reputation: 4.8,
    wanted: 41,
    distanceKm: 2.9,
    addedDaysAgo: 2,
    tags: ["Tailored", "Winter", "Statement"],
    note: "Timeless camel coat. Swap for a heavier parka or a knit set.",
    tone: 30,
    material: "Wool",
    dimensions: "L / XL",
    image: "https://images.pexels.com/photos/14416460/pexels-photo-14416460.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
  {
    id: "l16",
    name: "Pleated Midi Skirt",
    brand: "& Other Stories",
    category: "Bottoms",
    size: "M",
    condition: "Like New",
    lister: "twirlandtwill",
    swapScore: 4.6,
    reputation: 4.7,
    wanted: 25,
    distanceKm: 3.8,
    addedDaysAgo: 2,
    tags: ["Flowy", "Elegant", "Versatile"],
    note: "Gorgeous movement. Open to skirts, dresses or tops.",
    tone: 330,
    material: "Polyester",
    dimensions: "Standard",
    image: "https://images.pexels.com/photos/13214674/pexels-photo-13214674.jpeg?auto=compress&cs=tinysrgb&w=700",
  },
];

/* Community-wide impact figures shown on Home + About. */
const COMMUNITY = {
  swaps: 3247,
  waterLitres: 9_400_000, // 9.4 million litres
  co2Kg: 18_600,
  itemsInCirculation: 12_800,
};

/* The blank starting profile shown before sign-in. */
const DEMO_PROFILE = {
  name: "Blank Profile",
  username: "guest",
  location: "Nepean, ON",
  swapScore: 0,
  reputation: 0,
  swapsMade: 0,
  waterSaved: 0,
  co2Saved: 0,
  savedItems: [],
  listings: [],
  activity: [],
  monthlyGoal: 5,
  wishlist: [], // { type, size } — clothes this user is hoping to swap for
};

/* Options for the "what I'm looking for" wishlist picker. */
const WISH_TYPES = ["Tops", "Bottoms", "Outerwear", "Dresses", "Knitwear", "Denim", "Shoes", "Activewear", "Accessories"];
const WISH_SIZES = ["XS", "S", "M", "L", "XL", "Shoe 6", "Shoe 7", "Shoe 8", "Shoe 9", "Shoe 10", "One size", "Any"];

/* Pre-filled wishlists for some demo users (others get a deterministic one). */
const WISHLISTS = {
  "maya.j": [{ type: "Outerwear", size: "M" }, { type: "Denim", size: "S" }],
  "thriftedbyeli": [{ type: "Knitwear", size: "L" }],
  "denimdays": [{ type: "Tops", size: "M" }, { type: "Shoes", size: "Shoe 9" }],
  "sunnystory": [{ type: "Dresses", size: "S" }, { type: "Accessories", size: "One size" }],
  "ecocarry": [{ type: "Accessories", size: "One size" }],
  "autumnlayers": [{ type: "Outerwear", size: "L" }, { type: "Knitwear", size: "M" }],
  "stepforward": [{ type: "Shoes", size: "Shoe 8" }],
};

/* Reputation review snippets, keyed by lister username.
   Each has a tag, body, rating and whether it was left anonymously. */
const REVIEWS = {
  "maya.j": [
    { tag: "Quick responder", body: "Replied within minutes and super friendly.", rating: 5, anon: false, by: "eli" },
    { tag: "Item as described", body: "Jacket was exactly like the listing. Smooth swap.", rating: 5, anon: true },
  ],
  "thriftedbyeli": [
    { tag: "Easy to meet", body: "Flexible on timing, met right downtown.", rating: 5, anon: false, by: "maya" },
    { tag: "Item as described", body: "Sweater in great shape.", rating: 4, anon: true },
  ],
  "closetclean": [
    { tag: "Fair trader", body: "Honest about a small mark on the hem.", rating: 4, anon: true },
  ],
  "sam.rewear": [
    { tag: "Quick responder", body: "Lightning fast and lovely to deal with.", rating: 5, anon: false, by: "northlook" },
    { tag: "Item as described", body: "Dress was pristine. Would swap again.", rating: 5, anon: true },
  ],
  "loopwardrobe": [
    { tag: "Friendly", body: "Nice chat, easy handoff.", rating: 4, anon: true },
  ],
  "cleancloset": [
    { tag: "Item as described", body: "Shirt was crisp and clean.", rating: 5, anon: false, by: "sam" },
  ],
  "stepup.swap": [
    { tag: "Fair trader", body: "Upfront about the wear. No surprises.", rating: 4, anon: true },
  ],
  "northlook": [
    { tag: "Quick responder", body: "Sorted the swap same day.", rating: 5, anon: true },
  ],
  "denimdays": [
    { tag: "Item as described", body: "Jeans fit perfectly, exactly like the photos.", rating: 5, anon: false, by: "sunnystory" },
    { tag: "Easy to meet", body: "Met right by the station, super easy.", rating: 4, anon: true },
  ],
  "ecocarry": [
    { tag: "Friendly", body: "Lovely to deal with and the tote is spotless.", rating: 5, anon: true },
  ],
  "sunnystory": [
    { tag: "Quick responder", body: "Replied fast and the dress is gorgeous.", rating: 5, anon: false, by: "denimdays" },
    { tag: "Item as described", body: "Beautiful linen, just as pictured.", rating: 5, anon: true },
  ],
  "autumnlayers": [
    { tag: "Fair trader", body: "Honest about the coat and a smooth swap.", rating: 5, anon: true },
  ],
  "stepforward": [
    { tag: "Item as described", body: "Sneakers cleaned up great, happy swap.", rating: 4, anon: true },
  ],
};

/* Generic profile photos for SOME users (the rest fall back to initials),
   to give the community a more human feel. */
const AV = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop&crop=faces`;
const AVATARS = {
  "maya.j": AV(3979997),
  "sam.rewear": AV(3953843),
  "thriftedbyeli": AV(5131547),
  "denimdays": AV(3228887),
  "sunnystory": AV(3868929),
  "ecocarry": AV(3872330),
  "autumnlayers": AV(3777943),
  "ava.swaps": AV(4057039),
  "nina.thrifts": AV(5891868),
  "jordan.fits": AV(11336035),
};

/* Seed conversations for the DMs tab. itemId links to a listing. */
const CONVERSATIONS = [
  {
    id: "c1",
    user: "sam.rewear",
    itemId: "l4",
    unread: 2,
    time: "2m",
    messages: [
      { from: "them", text: "Hey! Is the wrap dress still up for swap?", time: "9:41 AM" },
      { from: "them", text: "I've got a denim jacket you might like 👀", time: "9:41 AM" },
    ],
  },
  {
    id: "c2",
    user: "maya.j",
    itemId: "l1",
    unread: 0,
    time: "1h",
    messages: [
      { from: "me", text: "Love the denim jacket! Would you swap for my hoodie?", time: "8:30 AM" },
      { from: "them", text: "Ooh maybe! Can you send a pic of the back?", time: "8:34 AM" },
      { from: "me", text: "For sure, sending now.", time: "8:35 AM" },
    ],
  },
  {
    id: "c3",
    user: "northlook",
    itemId: "l8",
    unread: 0,
    time: "Yesterday",
    messages: [
      { from: "them", text: "Thanks for the smooth swap! Left you a review 🌱", time: "Yesterday" },
      { from: "me", text: "Appreciate it! Same to you.", time: "Yesterday" },
    ],
  },
];

/* Quick-reply chips reused in chat + match screens.
   Covers the common turns: asking, offering, logistics, and closing. */
const QUICK_REPLIES = [
  "Is it still available?",
  "I'd love to swap!",
  "What are you looking for?",
  "I'm after tops, dresses, or outerwear",
  "Anything good quality in my size 🌱",
  "What do you have to swap?",
  "Sorry, it's already been swapped",
  "I've got some tops to trade",
  "I have a jacket to offer",
  "What size is it?",
  "What condition is it in?",
  "Can you send more photos?",
  "Where can we meet?",
  "When are you free?",
  "How about this weekend?",
  "Sounds good!",
  "Perfect, let's do it",
  "Thanks so much! 🌱",
  "On my way 🌱",
];

/* Image bank: real clothing photos a swapper can offer when you ask
   "what do you have?". Each is a {name, image} the persona sends as a pic. */
const IMAGE_BANK = [
  { name: "vintage denim jacket", image: "https://images.pexels.com/photos/12083001/pexels-photo-12083001.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "ribbed knit sweater", image: "https://images.pexels.com/photos/6630834/pexels-photo-6630834.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "pair of wide-leg trousers", image: "https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "floral wrap dress", image: "https://images.pexels.com/photos/7509903/pexels-photo-7509903.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "graphic hoodie", image: "https://images.pexels.com/photos/7236120/pexels-photo-7236120.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "white oxford shirt", image: "https://images.pexels.com/photos/3214768/pexels-photo-3214768.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "pair of leather boots", image: "https://images.pexels.com/photos/37827331/pexels-photo-37827331.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "plaid flannel shirt", image: "https://images.pexels.com/photos/14773602/pexels-photo-14773602.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "pair of mom jeans", image: "https://images.pexels.com/photos/17503375/pexels-photo-17503375.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "canvas tote bag", image: "https://images.pexels.com/photos/7735446/pexels-photo-7735446.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "pair of white sneakers", image: "https://images.pexels.com/photos/533442/pexels-photo-533442.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "linen midi dress", image: "https://images.pexels.com/photos/7789140/pexels-photo-7789140.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "camel wool overcoat", image: "https://images.pexels.com/photos/14416460/pexels-photo-14416460.jpeg?auto=compress&cs=tinysrgb&w=700" },
  { name: "pleated midi skirt", image: "https://images.pexels.com/photos/13214674/pexels-photo-13214674.jpeg?auto=compress&cs=tinysrgb&w=700" },
];

/* Onboarding stat cards. */
const ONBOARDING = [
  {
    stat: "100B",
    unit: "garments / year",
    context: "The fashion industry produces 100 billion garments every year. Most end up in landfill within 12 months.",
    source: "UNEP",
  },
  {
    stat: "10%",
    unit: "of global carbon emissions",
    context: "Fashion causes 10% of global carbon emissions. Fast fashion makes the problem worse by increasing volume.",
    source: "UNEP 2022",
  },
  {
    stat: "7×",
    unit: "average wears per garment",
    context: "The average garment is worn just 7 times before being discarded.",
    source: "Ellen MacArthur Foundation",
  },
];

/* Works cited, shown on the About / SDG screen. */
const SOURCES = [
  { author: "UNEP", title: "Putting the Brakes on Fast Fashion", year: "2022" },
  { author: "Ellen MacArthur Foundation", title: "A New Textiles Economy", year: "2017" },
  { author: "Fashion Revolution", title: "Fashion Transparency Index", year: "2023" },
  { author: "World Resources Institute", title: "Apparel Industry Footprint", year: "n.d." },
  { author: "Clean Clothes Campaign", title: "Living Wages in the Fashion Industry", year: "n.d." },
  { author: "Statistics Canada", title: "Household Spending on Clothing", year: "2022" },
];

const FILTERS = ["All", "Tops", "Bottoms", "Outerwear", "Dresses", "Shoes", "Accessories"];
const SORTS = ["Newest", "Closest", "Most Wanted"];

/* Expose to other files (no modules, file:// friendly). */
window.RW_DATA = {
  SAVINGS, MATERIALS, SIZE_PROFILES, CONDITION_SCALE, LISTINGS, COMMUNITY, DEMO_PROFILE,
  REVIEWS, AVATARS, CONVERSATIONS, QUICK_REPLIES, ONBOARDING, SOURCES, FILTERS, SORTS,
  WISH_TYPES, WISH_SIZES, WISHLISTS, IMAGE_BANK,
};

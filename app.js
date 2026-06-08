/* ============================================================
   Re:Wear, app.js
   State, routing, persistence and all interactions.
   ============================================================ */
(function () {
  const D = window.RW_DATA;
  const UI = window.RW_UI;

  const SCREENS_WITH_CHROME = ["home", "browse", "add", "dms", "chat", "detail", "profile", "userProfile", "about"];
  const NAV_SCREENS = ["home", "browse", "add", "dms", "profile"];

  /* ---------- state ---------- */
  const state = {
    screen: "loading",
    theme: localStorage.getItem("rw_theme") || "dark",
    auth: false,
    user: structuredClone(D.DEMO_PROFILE),
    onbIndex: 0,
    onboarded: sessionStorage.getItem("rw_onboarded") === "1",
    authMode: "signup",
    currentItemId: null,
    currentConvoId: null,
    viewUser: null, // username whose profile you're viewing
    conversations: [], // empty until you list something or start a chat
    listings: structuredClone(D.LISTINGS), // includes user-added
    community: structuredClone(D.COMMUNITY), // live-updating impact totals
    browse: { query: "", filter: "All", sort: "Newest" },
    draft: { category: "Tops", brand: "", size: "", name: "", condition: "Like New", material: "Cotton", dimensions: "Standard", tags: "", note: "", image: null },
    match: {},
    history: [], // navigation stack for the back button
  };
  window.RW = { state };

  /* ---------- persistence (demo accounts) ---------- */
  const Accounts = {
    all: () => JSON.parse(localStorage.getItem("rw_accounts") || "{}"),
    save: (obj) => localStorage.setItem("rw_accounts", JSON.stringify(obj)),
    get: (name) => Accounts.all()[name.toLowerCase().trim()],
    upsert: (profile) => {
      const a = Accounts.all();
      a[profile.name.toLowerCase().trim()] = profile;
      Accounts.save(a);
    },
  };

  const persistSession = () => {
    if (state.auth) localStorage.setItem("rw_current", state.user.name);
    Accounts.upsert(state.user);
  };

  /* ---------- derived helpers exposed to components ---------- */
  RW.unreadCount = () => state.conversations.reduce((n, c) => n + (c.unread || 0), 0);
  RW.currentItem = () => state.listings.find((l) => l.id === state.currentItemId);
  RW.currentConvo = () => state.conversations.find((c) => c.id === state.currentConvoId);

  RW.filteredListings = () => {
    const { query, filter, sort } = state.browse;
    let items = state.listings.filter((l) => {
      const okFilter = filter === "All" || l.category === filter;
      const q = query.toLowerCase();
      const okQuery =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.lister.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q));
      return okFilter && okQuery;
    });
    if (sort === "Closest") items.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sort === "Most Wanted") items.sort((a, b) => b.wanted - a.wanted);
    else items.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo); // Newest
    return items;
  };

  RW.previewCard = () => {
    const f = state.draft;
    const tags = f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const item = {
      id: "preview",
      name: f.name || "Item name",
      brand: f.brand || "Brand",
      category: f.category,
      size: f.size || "OS",
      condition: f.condition,
      lister: state.auth ? state.user.username || state.user.name : "you",
      swapScore: state.user.swapScore || 0,
      tone: 150,
      tags,
      image: f.image || null,
    };
    return UI.listingCard(item);
  };

  /* Impact of reusing this item instead of buying it new,
     factoring in category, material and size/cut (dimensions). */
  RW.computeImpact = (item) => {
    const base = D.SAVINGS[item.category] || D.SAVINGS.Tops;
    const mat = D.MATERIALS[item.material] || { water: 1, co2: 1 };
    const sz = D.SIZE_PROFILES[item.dimensions] != null ? D.SIZE_PROFILES[item.dimensions] : 1;
    return {
      water: Math.round((base.water * mat.water * sz) / 10) * 10,
      co2: Math.max(1, Math.round(base.co2 * mat.co2 * sz)),
    };
  };

  /* Estimated impact for the in-progress listing draft. */
  RW.estImpact = () => RW.computeImpact({ category: state.draft.category, material: state.draft.material, dimensions: state.draft.dimensions });

  /* Does the signed-in user own this listing? */
  RW.isOwn = (item) => {
    if (!state.auth || !item) return false;
    const me = (state.user.username || "").toLowerCase();
    const meName = (state.user.name || "").toLowerCase();
    return item.lister === me || item.lister === meName;
  };

  const isMe = (uname) => {
    if (!state.auth) return false;
    const me = (state.user.username || "").toLowerCase();
    const meName = (state.user.name || "").toLowerCase();
    return uname === me || uname === meName;
  };

  const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

  /* Build a believable public profile for any other user from their
     listings + reviews, with deterministic stats so they stay consistent. */
  RW.userProfile = (username) => {
    if (!username) return null;
    const listings = state.listings.filter((l) => l.lister === username);
    const reviews = D.REVIEWS[username] || [];
    const h = hashStr(username);
    let reputation, swapScore;
    if (listings.length) {
      reputation = listings.reduce((a, l) => a + (l.reputation || 4.5), 0) / listings.length;
      swapScore = listings.reduce((a, l) => a + (l.swapScore || 4.4), 0) / listings.length;
    } else if (reviews.length) {
      reputation = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      swapScore = Math.max(4, reputation - 0.1);
    } else {
      reputation = 4.3 + (h % 7) / 10;
      swapScore = 4.2 + (h % 8) / 10;
    }
    const swapsMade = 8 + (h % 46);
    const monthlyGoal = 4 + (h % 7);            // 4–10
    const goalProgress = (h >> 4) % (monthlyGoal + 1); // 0–goal
    return {
      username,
      location: "Nepean, ON",
      reputation: Math.min(5, +reputation.toFixed(1)),
      swapScore: Math.min(5, +swapScore.toFixed(1)),
      swapsMade,
      waterSaved: swapsMade * 3100,
      co2Saved: swapsMade * 6,
      monthlyGoal,
      goalProgress,
    };
  };

  /* ============================================================
     RENDER / ROUTER
     ============================================================ */
  const viewport = () => document.getElementById("viewport");

  function render(name, opts = {}) {
    const prev = state.screen;
    state.screen = name;

    // chrome visibility
    const chrome = SCREENS_WITH_CHROME.includes(name);
    document.getElementById("app").classList.toggle("no-chrome", !chrome);

    // status + nav
    document.getElementById("statusbar-slot").innerHTML = chrome ? UI.statusBar() : "";
    renderNav(name, chrome);

    // build new screen
    const fn = UI.Screens[name];
    const html = name === "browse" && opts.skeleton ? fn(true) : fn();

    const vp = viewport();
    // every screen still present (the active one + any mid-transition) must leave,
    // otherwise rapid navigation leaves orphaned screens stacked on top of each other
    const olds = Array.from(vp.querySelectorAll(".screen"));
    const el = document.createElement("div");
    el.className = "screen scr-" + name;
    el.id = "screen-" + name;
    el.innerHTML = html;
    vp.appendChild(el);

    // double rAF so the start state is painted before we animate in (smoother)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add("active");
      olds.forEach((o) => {
        o.classList.add("leaving");
        o.classList.remove("active");
        setTimeout(() => o.remove(), 480);
      });
    }));

    // post-render hooks
    requestAnimationFrame(() => {
      animateCounters(el);
      animateBars(el);
      el.querySelectorAll(".scroll-x").forEach(enableDragScroll);
    });

    if (name === "match") setTimeout(() => spawnConfetti(), 120);
    bindScreen(name, el);
  }
  RW.render = render;

  /* (re)render the bottom nav for the given screen; used live to refresh the unread badge */
  function renderNav(name, chrome) {
    if (chrome == null) chrome = SCREENS_WITH_CHROME.includes(name);
    const active = NAV_SCREENS.includes(name) ? name : name === "chat" ? "dms" : name === "about" ? "profile" : "";
    document.getElementById("nav-slot").innerHTML = chrome ? UI.bottomNav(active) : "";
  }
  function updateNavBadge() { renderNav(state.screen); }

  /* Screens we never want to "return to" via the back button. */
  const NO_HISTORY = ["loading", "onboarding", "auth", "match"];

  /* navigate forward, remembering where we came from */
  function go(name, opts = {}) {
    if (!opts.isBack && state.screen && state.screen !== name && !NO_HISTORY.includes(state.screen)) {
      const top = state.history[state.history.length - 1];
      const entry = { screen: state.screen, itemId: state.currentItemId, convoId: state.currentConvoId };
      if (!top || top.screen !== entry.screen || top.itemId !== entry.itemId) state.history.push(entry);
    }
    render(name, opts);
  }
  RW.go = go;

  /* step back through the navigation stack */
  function goBack() {
    const prev = state.history.pop();
    if (prev) {
      state.currentItemId = prev.itemId;
      state.currentConvoId = prev.convoId;
      render(prev.screen, { isBack: true });
    } else {
      render("home", { isBack: true });
    }
  }

  /* ============================================================
     ANIMATIONS
     ============================================================ */
  function animateCounters(scope) {
    scope.querySelectorAll("[data-count]").forEach((node) => {
      const target = parseFloat(node.dataset.count);
      const suffix = node.dataset.suffix || "";
      const decimals = String(target).includes(".") ? 1 : 0;
      const dur = 900;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        node.textContent = (decimals ? val.toFixed(1) : Math.round(val).toLocaleString("en-CA")) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* Make a horizontal row scrollable by click-and-drag + mouse wheel.
     Capture only starts once a real drag begins, so plain taps still
     land on the chip (and fire their click handler) normally. */
  function enableDragScroll(el) {
    if (el._dragInit) return;
    el._dragInit = true;
    el.classList.add("draggable");
    let isDown = false, dragging = false, startX = 0, startLeft = 0, pid = null;

    el.addEventListener("pointerdown", (e) => {
      isDown = true; dragging = false; pid = e.pointerId;
      startX = e.clientX; startLeft = el.scrollLeft;
    });
    el.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 6) return; // not a drag yet — let clicks through
        dragging = true;
        el.classList.add("grabbing");
        try { el.setPointerCapture(pid); } catch (_) {}
      }
      el.scrollLeft = startLeft - dx;
    });
    const end = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("grabbing");
      if (pid != null) { try { el.releasePointerCapture(pid); } catch (_) {} }
      if (dragging) { el._suppressClick = true; setTimeout(() => (el._suppressClick = false), 40); }
      dragging = false;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    // only swallow the click that immediately follows a real drag
    el.addEventListener("click", (e) => {
      if (el._suppressClick) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    // vertical wheel scrolls the row horizontally
    el.addEventListener("wheel", (e) => {
      if (!e.deltaY) return;
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }, { passive: false });
  }

  function animateBars(scope) {
    scope.querySelectorAll("[data-bar]").forEach((node) => {
      const pct = node.dataset.bar;
      setTimeout(() => (node.style.width = pct + "%"), 120);
    });
  }

  function spawnConfetti() {
    const wrap = document.getElementById("confetti");
    if (!wrap) return;
    const colors = ["#5fc88f", "#e2935b", "#f3efe7"];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement("i");
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * 0.6 + "s";
      c.style.transform = `translateY(-40px) rotate(${Math.random() * 360}deg)`;
      wrap.appendChild(c);
    }
    setTimeout(() => (wrap.innerHTML = ""), 2800);
  }

  /* ============================================================
     TOAST + MODAL
     ============================================================ */
  function toast(msg) {
    const wrap = document.getElementById("toast-wrap");
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="tdot"></span>${msg}`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 350);
    }, 2400);
  }
  RW.toast = toast;

  function openModal(html) {
    const bg = document.getElementById("modal-bg");
    bg.querySelector(".modal").innerHTML = `<div class="modal-grip"></div>${html}`;
    bg.classList.add("open");
  }
  function closeModal() {
    document.getElementById("modal-bg").classList.remove("open");
  }
  RW.closeModal = closeModal;

  /* ============================================================
     THEME
     ============================================================ */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
  }
  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("rw_theme", state.theme);
    applyTheme();
    toast(state.theme === "dark" ? "Dark mode" : "Light mode");
  }

  /* ============================================================
     AUTH ACTIONS
     ============================================================ */
  function handleAuthSubmit(form) {
    const name = form.name.value.trim();
    const password = form.password.value;
    if (!name || !password) return;

    if (state.authMode === "signup") {
      if (Accounts.get(name)) {
        toast("That name already exists, try logging in.");
        return;
      }
      const profile = {
        ...structuredClone(D.DEMO_PROFILE),
        name,
        username: name.toLowerCase().replace(/\s+/g, "."),
        password,
      };
      state.user = profile;
      state.auth = true;
      Accounts.upsert(profile);
      persistSession();
      toast(`Welcome to Re:Wear, ${name.split(" ")[0]}!`);
      go("home");
    } else {
      const acct = Accounts.get(name);
      if (!acct) {
        toast("No account found, create one first.");
        return;
      }
      state.user = acct;
      state.auth = true;
      persistSession();
      toast(`Welcome back, ${acct.name.split(" ")[0]}!`);
      go("home");
    }
  }

  function logout() {
    localStorage.removeItem("rw_current");
    state.auth = false;
    state.user = structuredClone(D.DEMO_PROFILE);
    state.authMode = "login";
    toast("Logged out");
    go("auth");
  }

  /* ============================================================
     SWAP / RATE / DELETE
     ============================================================ */

  /* Records a completed swap automatically (no manual logging).
     Impact is the footprint of the item you received, vs buying it new. */
  function logSwap(item, withUser) {
    if (!state.auth || !item) return;
    const sv = RW.computeImpact(item);
    const u = state.user;
    u.swapsMade += 1;
    u.waterSaved += sv.water;
    u.co2Saved += sv.co2;
    u.swapScore = Math.min(5, +(4 + Math.random() * 0.9).toFixed(1));
    u.reputation = Math.min(5, +((u.reputation * (u.swapsMade - 1) + (4.5 + Math.random() * 0.5)) / u.swapsMade).toFixed(1));
    const who = withUser ? (withUser.startsWith("@") ? withUser : "@" + withUser) : "@" + item.lister;
    u.activity.unshift({
      title: `Swapped for ${item.name}`,
      detail: `With ${who} · saved ${sv.water.toLocaleString()} L · ${sv.co2} kg CO₂`,
    });
    persistSession();
  }

  function requestSwap(itemId) {
    const item = state.listings.find((l) => l.id === itemId);
    if (!item) return;
    if (RW.isOwn(item)) { toast("This is your own listing"); return; }
    // reaching out = just start the conversation (no premature "It's a Match")
    toast("Reaching out to @" + item.lister + " 🌱");
    startConvoFromItem(item.id, `Hi! I'd love to swap for your ${item.name} 🌱 Are you open to a trade?`);
  }

  /* Confirm + remove one of your own listings. */
  function deleteListingModal(itemId) {
    const item = state.listings.find((l) => l.id === itemId);
    if (!item) return;
    openModal(`
      <h3>Delete listing?</h3>
      <p class="muted tiny">"${item.name}" will be removed from Re:Wear. This can't be undone.</p>
      <button class="btn btn-primary mt-20" id="confirmDelete" data-id="${itemId}" style="background:var(--amber);color:#1a0d04">Delete listing</button>
      <button class="btn btn-ghost mt-12" data-close-modal>Keep it</button>
    `);
  }

  function deleteListing(itemId) {
    state.listings = state.listings.filter((l) => l.id !== itemId);
    // remove from the current user's lists, saved items, and any related chats
    state.user.listings = state.user.listings.filter((id) => id !== itemId);
    state.user.savedItems = state.user.savedItems.filter((id) => id !== itemId);
    state.conversations = state.conversations.filter((c) => c.itemId !== itemId);
    if (state.auth) persistSession();
    closeModal();
    toast("Listing removed");
    go("profile");
  }

  function rateModal(username) {
    openModal(`
      <h3>Rate @${username}</h3>
      <p class="muted tiny">Help others swap with confidence.</p>
      <div class="field"><label>Rating</label>
        <div class="row gap-8" id="starPick">
          ${[1, 2, 3, 4, 5].map((n) => `<span class="iconbtn" data-star="${n}" style="font-size:20px;color:var(--amber)">☆</span>`).join("")}
        </div>
      </div>
      <div class="field"><label>Quick tag</label>
        <div class="row wrap gap-8" id="tagPick">
          ${["Quick responder", "Item as described", "Easy to meet", "Fair trader", "Friendly"]
            .map((t) => `<button class="chip" data-rtag="${t}">${t}</button>`)
            .join("")}
        </div>
      </div>
      <div class="field"><label>Review <span class="muted">(optional)</span></label>
        <textarea class="input" id="rText" placeholder="Say a little about the swap…"></textarea></div>
      <label class="row gap-8 tiny muted" style="margin-top:10px;cursor:pointer">
        <input type="checkbox" id="rAnon" checked> Post anonymously</label>
      <button class="btn btn-primary mt-16" id="confirmRate" data-user="${username}">Submit review</button>
    `);
  }

  function confirmRate(username) {
    const rating = +(document.querySelector("#starPick").dataset.value || 5);
    const tag = document.querySelector("#tagPick .chip.active")?.dataset.rtag || "Item as described";
    const text = document.getElementById("rText").value.trim() || "Smooth, friendly swap.";
    const anon = document.getElementById("rAnon").checked;
    D.REVIEWS[username] = D.REVIEWS[username] || [];
    D.REVIEWS[username].unshift({ tag, body: text, rating, anon, by: state.user.username || "you" });
    closeModal();
    toast("Thanks! Review posted 🌱");
    if (state.screen === "detail") render("detail");
  }

  /* ============================================================
     ADD LISTING
     ============================================================ */
  function readDraft() {
    const form = document.getElementById("addForm");
    if (!form) return;
    state.draft = {
      category: form.category.value,
      brand: form.brand.value,
      size: form.size.value,
      name: form.name.value,
      condition: form.condition.value,
      material: form.material.value,
      dimensions: form.dimensions.value,
      tags: form.tags.value,
      note: form.note.value,
      image: state.draft.image || null, // preserve the uploaded photo
    };
  }

  function refreshPreview() {
    const slot = document.getElementById("previewSlot");
    if (slot) slot.innerHTML = RW.previewCard();
    const imp = RW.estImpact();
    const w = document.getElementById("impWater");
    const c = document.getElementById("impCo2");
    if (w) w.textContent = imp.water.toLocaleString();
    if (c) c.textContent = imp.co2;
  }

  function submitListing() {
    readDraft();
    const f = state.draft;
    if (!f.name.trim()) {
      toast("Give your item a name first");
      return;
    }
    const id = "u" + Date.now();
    const item = {
      id,
      name: f.name.trim(),
      brand: f.brand.trim() || "No brand",
      category: f.category,
      size: f.size.trim() || "OS",
      condition: f.condition,
      material: f.material || "Other",
      dimensions: f.dimensions || "Standard",
      lister: state.auth ? state.user.username || state.user.name.toLowerCase() : "you",
      swapScore: state.user.swapScore || 4.5,
      reputation: state.user.reputation || 4.5,
      wanted: 0,
      distanceKm: 0.3,
      addedDaysAgo: 0,
      tags: f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      note: f.note.trim() || "Open to offers.",
      tone: 150,
      image: f.image || null,
    };
    state.listings.unshift(item);
    if (state.auth) {
      state.user.listings.unshift(id);
      persistSession();
      scheduleInterest(item); // someone will message you about it shortly
    }
    state.draft = { category: "Tops", brand: "", size: "", name: "", condition: "Like New", material: "Cotton", dimensions: "Standard", tags: "", note: "", image: null };
    toast("Listing added. Nice one. 🌱");
    state.browse = { query: "", filter: "All", sort: "Newest" };
    go("browse");
  }

  /* ============================================================
     CHAT
     ============================================================ */
  const esc = (s) => s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  /* A clear commitment to go ahead with the swap (not just interest). */
  const isAgreement = (text) =>
    /\b(deal|let'?s do it|lets do it|let'?s swap|lets swap|i'?m in|im in|sounds good|sounds great|works for me|that works|perfect|see you (then|there|soon)|lock it in|agreed|it'?s a deal|confirmed|yes please|yep let'?s|ok(ay)? let'?s)\b/i.test(text);

  /* Pick a reply that fits what you said AND the role of the other person:
     - if the item being discussed is THEIRS, they answer as the owner
     - if the item is YOURS, they reached out wanting it, so they answer as
       the requester (they're the one offering / asking to see your item). */
  function generateReply(text, convo) {
    const t = " " + text.toLowerCase() + " ";
    const item = state.listings.find((l) => l.id === convo.itemId);
    const name = item ? item.name : "the item";
    const size = item ? item.size : "one size";
    const cond = item ? item.condition.toLowerCase() : "great";
    const brand = item ? item.brand : "";
    const theyAreRequester = item ? RW.isOwn(item) : false;

    // shared logistics + closing rules (same regardless of role)
    const common = [
      [/\b(where|meet|meetup|location|place|spot|pick ?up|drop ?off|come by|campus)\b/,
        "How about the library or the Nepean Sportsplex after school? 📍 Both are easy for me. Which works better for you?"],
      [/\b(weekend|saturday|sunday|sat|sun)\b/,
        "This weekend works great for me! Saturday afternoon around 2? 🌱"],
      [/\b(when|what time|free|today|tomorrow|tonight|schedule|which day|after school)\b/,
        "I'm free after 3pm on weekdays, or anytime this weekend. When suits you best?"],
      [/\b(price|cost|how much|buy|sell|pay|money|cash|\$|paypal|venmo)\b/,
        "No money on Re:Wear, it's swap only 🌱 That's the whole point!"],
      [/\b(thank|thanks|thx|ty|appreciate|cheers|legend)\b/,
        "No worries at all! 🌱"],
      [/\b(bye|see ya|see you|later|ttyl|gtg|cya)\b/, "See you soon! 🌱"],
      [/\b(on my way|omw|heading over|almost there|be there)\b/,
        "Awesome, see you in a few! I'll be by the front entrance 🌱"],
      [/\b(ok|okay|sure|sounds good|great|perfect|cool|awesome|deal|works|yes|yep|yeah|let's do it|lets do it)\b/,
        "Perfect, let's lock it in! 🌱 See you then."],
    ];

    // THEY OWN the item (you reached out to them)
    const ownerRules = [
      [/\b(still|available|taken|gone|sold|up for grabs|claimed)\b/,
        `Yep, ${name} is still up for swap! 🌱 Were you thinking of trading?`],
      [/\b(looking for|what.*(want|after|interested in)|in mind|prefer|hoping for|open to)\b/,
        "Honestly I'm pretty open! Tops, outerwear, or anything I'd actually wear. What have you got?"],
      [/\b(i have|i've got|ive got|i got|i can offer|offer you|trade you|got a|got some|i'll trade|here's what|what about my)\b/,
        "Ooh that sounds promising! Want to send a quick pic? If it's my style I'm definitely down to swap 🌱"],
      [/\b(size|fit|fits|measure|measurement|length|small|medium|large|too big|too tight)\b/,
        `It's a size ${size} and fits true to size. Happy to send measurements if that helps!`],
      [/\b(condition|quality|worn|damage|stain|flaw|tear|hole|marks?|good shape|how old)\b/,
        `It's in ${cond} condition, only gently worn with no real flaws. I've looked after it!`],
      [/\b(pic|pics|photo|photos|picture|image|see more|more shots|show me|close ?up)\b/,
        "For sure, I'll send a couple more photos over in a sec! 📸"],
      [/\b(brand|where.*from|who made|label|authentic|real)\b/,
        brand ? `It's ${brand}, and yep it's the real deal 🌱` : "It's a great quality piece, happy to share more!"],
      [/\b(swap|trade|interested|exchange|down for|keen|love)\b/,
        `I'd love to swap ${name}! What were you thinking of offering?`],
      [/\b(hi|hey|hello|yo|heya|hiya|good morning|good afternoon)\b/,
        "Hey! Thanks for reaching out 😊 What were you hoping to swap?"],
    ];

    // THEY WANT your item (they reached out to you)
    const requesterRules = [
      [/\b(still|available|taken|gone|sold|yours|up for grabs)\b/,
        `Yes please! I'm really keen on your ${name} 🌱 Could you send a quick pic of it?`],
      // you asking what THEY can offer
      [/\b(what.*(you|u).*(offer|have|trade|got)|what can you|what do you have|your stuff|trade me|in return)\b/,
        "I could trade a denim jacket, a couple of tops, or some boots — want pics of any of them? 📸"],
      [/\b(pic|pics|photo|photos|picture|image|show me|send)\b/,
        "Sure! I'll send pics of what I'd trade in a sec 📸"],
      [/\b(size|fit|fits|measure|measurement)\b/,
        "I'm usually a M but honestly I'm flexible, it's the piece I love!"],
      [/\b(condition|quality|worn|damage|stain|flaw)\b/,
        "No worries about a bit of wear, I'm not fussy 🌱"],
      // you showing interest / agreeing to swap → they ask to see your item, then they're in
      [/\b(swap|trade|interested|exchange|down for|keen|love|happy to)\b/,
        `Yay! 🌱 Could you send a quick pic of your ${name}? If it's as good as it looks, I'm in!`],
      [/\b(hi|hey|hello|yo|heya|hiya|good morning|good afternoon)\b/,
        `Hey! I'm really into your ${name} 🌱 Any chance you'd swap?`],
    ];

    const rules = theyAreRequester ? [...requesterRules, ...common] : [...ownerRules, ...common];
    for (const [re, reply] of rules) if (re.test(t)) return reply;
    if (t.includes("?")) return "Good question! Happy to share more 🌱";
    return theyAreRequester
      ? "Sounds good! Let me know and we'll sort it out 🌱"
      : "Sounds good! Let me know what works for you and we'll set it up.";
  }

  function appendBubble(bubbles, from, text) {
    bubbles.insertAdjacentHTML("beforeend", `<div class="bubble ${from}">${esc(text)}<div class="bt">Now</div></div>`);
    bubbles.scrollTop = bubbles.scrollHeight;
  }

  function appendImageBubble(bubbles, from, src) {
    bubbles.insertAdjacentHTML("beforeend", `<div class="bubble ${from} img"><img class="msg-img" src="${src}" alt="shared photo"><div class="bt">Now</div></div>`);
    bubbles.scrollTop = bubbles.scrollHeight;
  }

  /* Attach a photo to the chat. If they'd asked for a pic of your item,
     they react warmly and accept the swap. */
  function sendImage(src) {
    const c = RW.currentConvo();
    if (!c || !src) return;
    c.messages.push({ from: "me", type: "image", src, time: "Now" });
    c.unread = 0;
    c.time = "Now";
    const bubbles = document.getElementById("bubbles");
    if (bubbles) appendImageBubble(bubbles, "me", src);

    if (c.awaitingPhoto) {
      c.awaitingPhoto = false;
      c.iAgreed = true; // sending your item's photo = offering it for swap
      simulateReply(c, 1600, "Nice! 😍 That's exactly what I was hoping for — let's swap! 🌱");
    } else {
      simulateReply(c, 1500, "Nice! 📸 Love it.");
    }
  }

  const isViewingConvo = (convo) => state.screen === "chat" && state.currentConvoId === convo.id;

  /* Shows the animated typing bubble (if you're in the chat), waits `delay`,
     then posts a context-aware reply from the other person. */
  function simulateReply(convo, delay, forceText) {
    if (isViewingConvo(convo)) {
      const b = document.getElementById("bubbles");
      if (b && !b.querySelector("#typing")) {
        b.insertAdjacentHTML("beforeend", `<div class="bubble them typing" id="typing"><span></span><span></span><span></span></div>`);
        b.scrollTop = b.scrollHeight;
      }
    }
    setTimeout(() => {
      document.getElementById("typing")?.remove();
      const lastMine = [...convo.messages].reverse().find((m) => m.from === "me");
      const reply = forceText || generateReply(lastMine ? lastMine.text : "hi", convo);
      convo.messages.push({ from: "them", text: reply, time: "Now" });
      convo.time = "Now";
      if (isAgreement(reply)) convo.theyAgreed = true;
      if (/want to send|send (me )?a (quick )?(pic|photo)/i.test(reply)) convo.awaitingPhoto = true;
      if (isViewingConvo(convo)) {
        const b = document.getElementById("bubbles");
        if (b) appendBubble(b, "them", reply);
        maybeRevealSwap(convo);
      } else {
        convo.unread = (convo.unread || 0) + 1;
        toast("New message from @" + convo.user + " 💬");
        updateNavBadge();
        if (state.screen === "dms") render("dms");
      }
    }, delay);
  }

  /* Once both sides have agreed, reveal the "mark complete" button in place
     (swap in for the hint) without a jarring full-screen re-render. */
  function maybeRevealSwap(convo) {
    if (!isViewingConvo(convo) || convo.swapped) return;
    if (!(convo.iAgreed && convo.theyAgreed)) return;
    if (document.querySelector("[data-mark-swapped]")) return;
    const btn = document.createElement("button");
    btn.className = "btn btn-ghost btn-sm swap-cta reveal";
    btn.setAttribute("data-mark-swapped", convo.id);
    btn.textContent = "Mark swap as complete";
    const hint = document.querySelector(".scr-chat .swap-hint");
    const ctx = document.querySelector(".scr-chat .chat-ctx");
    if (hint) hint.replaceWith(btn);
    else if (ctx) ctx.insertAdjacentElement("afterend", btn);
  }

  function sendChat(text) {
    const c = RW.currentConvo();
    if (!c || !text.trim()) return;
    const msg = text.trim();
    c.messages.push({ from: "me", text: msg, time: "Now" });
    c.unread = 0;
    c.time = "Now";
    if (isAgreement(msg)) c.iAgreed = true;
    const bubbles = document.getElementById("bubbles");
    appendBubble(bubbles, "me", msg);
    const input = document.getElementById("chatInput");
    if (input) input.value = "";
    simulateReply(c, 1400);
  }

  function startConvoFromItem(itemId, opener) {
    const item = state.listings.find((l) => l.id === itemId);
    if (!item) return;
    let convo = state.conversations.find((c) => c.user === item.lister && c.itemId === itemId);
    const text = opener || `Hi! Is "${item.name}" still available to swap?`;
    if (!convo) {
      convo = { id: "c" + Date.now(), user: item.lister, itemId, unread: 0, time: "Now", messages: [{ from: "me", text, time: "Now" }] };
      state.conversations.unshift(convo);
    } else {
      convo.messages.push({ from: "me", text, time: "Now" });
      convo.time = "Now";
    }
    state.currentConvoId = convo.id;
    go("chat");
    simulateReply(convo, 5000); // they reply ~5s after you reach out
  }

  /* Start (or resume) a chat with a user directly from their profile. */
  function startConvoWithUser(username, opener) {
    const theirs = state.listings.find((l) => l.lister === username);
    if (theirs) { startConvoFromItem(theirs.id, opener); return; }
    let convo = state.conversations.find((c) => c.user === username && !c.itemId);
    const text = opener || `Hi @${username}! 🌱`;
    if (!convo) {
      convo = { id: "c" + Date.now(), user: username, itemId: null, unread: 0, time: "Now", messages: [{ from: "me", text, time: "Now" }] };
      state.conversations.unshift(convo);
    } else {
      convo.messages.push({ from: "me", text, time: "Now" });
      convo.time = "Now";
    }
    state.currentConvoId = convo.id;
    go("chat");
    simulateReply(convo, 5000);
  }

  /* Completing a swap (not merely reaching out) is what logs impact,
     then shows the celebration screen. */
  function markSwapped(convoId) {
    const c = state.conversations.find((x) => x.id === convoId);
    if (!c || c.swapped) return;
    const item = state.listings.find((l) => l.id === c.itemId);
    if (!item) { toast("No item linked to this chat"); return; }
    const sv = RW.computeImpact(item);
    logSwap(item, "@" + c.user);
    c.swapped = true;
    c.swappedOn = new Date().toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    state.match = {
      user: c.user,
      itemName: item.name,
      theirTone: item.tone,
      theirImage: item.image,
      theirCategory: item.category,
      mineTone: 150,
      impactWater: sv.water,
      impactCo2: sv.co2,
    };
    go("match"); // celebration
  }

  function adjustGoal(delta) {
    if (!state.auth) { toast("Sign in to set a goal"); return; }
    state.user.monthlyGoal = Math.max(1, Math.min(30, (state.user.monthlyGoal || 5) + delta));
    persistSession();
    render("profile");
  }

  /* ============================================================
     INCOMING MESSAGE SIMULATION
     People only reach out once you have something listed.
     ============================================================ */
  const PERSONAS = ["ava.swaps", "theloopco", "wearagain", "nina.thrifts", "sustainsam", "reluxe.co", "jordan.fits", "kit.closet"];

  function pickPersona() {
    const me = (state.user.username || "").toLowerCase();
    const pool = PERSONAS.filter((p) => p !== me);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function openerFor(item) {
    const opts = [
      `Hey! Is your ${item.name} still up for swap? 🌱`,
      `Love your ${item.category.toLowerCase()}! Would you be up for a trade?`,
      `Hi! Really into your ${item.name}. What are you looking for?`,
      `Your ${item.name} is so my style 😍 Keen to swap?`,
      `Ooh the ${item.name}! I've got a few things you might like. Interested?`,
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  function deliverIncoming(item, persona, text) {
    if (!state.auth) return;
    let convo = state.conversations.find((c) => c.user === persona && c.itemId === item.id);
    if (!convo) {
      convo = { id: "c" + Date.now() + Math.floor(Math.random() * 1000), user: persona, itemId: item.id, unread: 0, time: "Now", messages: [] };
      state.conversations.unshift(convo);
    }
    convo.messages.push({ from: "them", text, time: "Now" });
    convo.time = "Now";

    const viewing = state.screen === "chat" && state.currentConvoId === convo.id;
    if (viewing) {
      const bubbles = document.getElementById("bubbles");
      if (bubbles) appendBubble(bubbles, "them", text);
    } else {
      convo.unread = (convo.unread || 0) + 1;
      toast("New message from @" + persona + " 💬");
      updateNavBadge();
      if (state.screen === "dms") render("dms");
    }
  }

  /* a buyer reaches out shortly after you post a listing */
  function scheduleInterest(item) {
    const delay = 6000 + Math.random() * 7000;
    setTimeout(() => {
      if (!state.auth || !state.user.listings.includes(item.id)) return;
      deliverIncoming(item, pickPersona(), openerFor(item));
    }, delay);
  }

  /* ============================================================
     LIVE COMMUNITY IMPACT — numbers tick up as if others are active
     ============================================================ */
  function paintCommunity(pulse) {
    const c = state.community;
    const set = (key, val) => {
      const n = document.querySelector(`[data-live="${key}"]`);
      if (!n) return;
      n.textContent = val;
      if (pulse) { n.classList.remove("bump"); void n.offsetWidth; n.classList.add("bump"); }
    };
    set("swaps", c.swaps.toLocaleString());
    set("water", (c.waterLitres / 1e6).toFixed(2) + "M");
    set("co2", c.co2Kg.toLocaleString() + "kg");
    set("items", c.itemsInCirculation.toLocaleString());
  }

  let communityStarted = false;
  function startCommunitySim() {
    if (communityStarted) return;
    communityStarted = true;
    setInterval(() => {
      const c = state.community;
      const swaps = Math.random() < 0.7 ? 1 + (Math.random() < 0.3 ? 1 : 0) : 0; // 0–2
      if (!swaps) return;
      c.swaps += swaps;
      c.waterLitres += swaps * Math.round(3000 + Math.random() * 4600);
      c.co2Kg += swaps * Math.round(4 + Math.random() * 4);
      if (Math.random() < 0.5) c.itemsInCirculation += Math.random() < 0.5 ? 1 : 2;
      if (state.screen === "home") paintCommunity(true);
    }, 5000);
  }

  /* ongoing trickle of interest while you have active listings */
  let simStarted = false;
  function startMessageSim() {
    if (simStarted) return;
    simStarted = true;
    setInterval(() => {
      if (!state.auth) return;
      const mine = state.listings.filter((l) => state.user.listings.includes(l.id));
      if (!mine.length) return;
      if (Math.random() > 0.45) return; // gentle, ~45% per tick
      const item = mine[Math.floor(Math.random() * mine.length)];
      deliverIncoming(item, pickPersona(), openerFor(item));
    }, 25000);
  }

  /* ============================================================
     EVENT BINDING (per-screen + global delegation)
     ============================================================ */
  function bindScreen(name, el) {
    if (name === "browse") {
      const search = el.querySelector("#searchInput");
      if (search)
        search.addEventListener("input", (e) => {
          state.browse.query = e.target.value;
          el.querySelector("#browseGrid").innerHTML =
            RW.filteredListings().map(UI.listingCard).join("") ||
            `<div class="empty" style="grid-column:1/-1"><div class="ei">⬡</div><div class="tiny">No matches found</div></div>`;
          el.querySelectorAll("#browseGrid .listing").forEach((c) => c.classList.add("rise"));
        });
      const sort = el.querySelector("#sortSelect");
      if (sort)
        sort.addEventListener("change", (e) => {
          state.browse.sort = e.target.value;
          render("browse");
        });
    }

    if (name === "add") {
      const form = el.querySelector("#addForm");
      if (form) form.addEventListener("input", () => { readDraft(); refreshPreview(); });
      el.querySelector("#submitListing")?.addEventListener("click", submitListing);

      // real photo upload via a hidden file input
      const fileInput = el.querySelector("#photoInput");
      el.querySelector("#uploadMock")?.addEventListener("click", (e) => {
        if (e.target.closest("#clearPhoto")) return; // handled below
        fileInput?.click();
      });
      el.querySelector("#clearPhoto")?.addEventListener("click", (e) => {
        e.stopPropagation();
        state.draft.image = null;
        render("add");
      });
      fileInput?.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast("Please choose an image file"); return; }
        const reader = new FileReader();
        reader.onload = () => {
          state.draft.image = reader.result; // data URL, works offline
          render("add");
          toast("Photo added 📸");
        };
        reader.readAsDataURL(file);
      });
    }

    if (name === "chat") {
      const input = el.querySelector("#chatInput");
      el.querySelector("#sendChat")?.addEventListener("click", () => sendChat(input.value));
      input?.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChat(input.value); });

      const photo = el.querySelector("#chatPhoto");
      el.querySelector("#attachBtn")?.addEventListener("click", () => photo?.click());
      photo?.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast("Please choose an image file"); return; }
        const reader = new FileReader();
        reader.onload = () => sendImage(reader.result);
        reader.readAsDataURL(file);
        e.target.value = "";
      });

      const b = el.querySelector("#bubbles");
      if (b) b.scrollTop = b.scrollHeight;
    }

    if (name === "auth") {
      el.querySelector("#authForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        handleAuthSubmit(e.target);
      });
    }

    if (name === "profile") {
      const ai = el.querySelector("#avatarInput");
      el.querySelector("#avatarEdit")?.addEventListener("click", () => ai?.click());
      ai?.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast("Please choose an image file"); return; }
        const reader = new FileReader();
        reader.onload = () => {
          state.user.avatar = reader.result;
          persistSession();
          render("profile");
          toast("Profile picture updated 🌱");
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /* ---------- global click delegation ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-nav],[data-open],[data-save],[data-save-btn],[data-back],[data-filter],[data-onb],[data-auth],[data-theme-toggle],[data-chat],[data-request],[data-delete],[data-close-modal],[data-logout],[data-quick],[data-match-quick],[data-match-arrange],[data-rate],[data-star],[data-rtag],[data-user],[data-msg-user],[data-mark-swapped],[data-goal],[data-link]");
    if (!t) return;

    // nav (gate add behind auth)
    if (t.dataset.nav) {
      const dest = t.dataset.nav;
      if (dest === "add" && !state.auth) { toast("Sign in to add a listing"); go("auth"); return; }
      go(dest);
      return;
    }
    if (t.dataset.open) { state.currentItemId = t.dataset.open; go("detail"); return; }
    if (t.hasAttribute("data-back")) { goBack(); return; }
    if (t.dataset.chat) { state.currentConvoId = t.dataset.chat; markRead(t.dataset.chat); go("chat"); return; }

    // view another user's profile (or your own)
    if (t.dataset.user) {
      const uname = t.dataset.user;
      if (isMe(uname)) { go("profile"); return; }
      state.viewUser = uname; go("userProfile"); return;
    }
    if (t.dataset.msgUser) { startConvoWithUser(t.dataset.msgUser); return; }
    if (t.dataset.markSwapped) { markSwapped(t.dataset.markSwapped); return; }
    if (t.dataset.goal) { adjustGoal(parseInt(t.dataset.goal, 10)); return; }

    // save toggle (card heart or top-bar)
    if (t.dataset.save) { e.stopPropagation(); toggleSave(t.dataset.save); return; }
    if (t.dataset.saveBtn) { toggleSave(t.dataset.saveBtn); render("detail"); return; }

    if (t.dataset.filter) { state.browse.filter = t.dataset.filter; render("browse", { skeleton: true }); setTimeout(() => render("browse"), 380); return; }

    if (t.dataset.onb) { handleOnb(t.dataset.onb); return; }
    if (t.dataset.auth) { state.authMode = t.dataset.auth; render("auth"); return; }
    if (t.hasAttribute("data-theme-toggle")) { toggleTheme(); return; }

    if (t.dataset.request) { requestSwap(t.dataset.request); return; }
    if (t.dataset.delete) { deleteListingModal(t.dataset.delete); return; }
    if (t.hasAttribute("data-close-modal")) { closeModal(); return; }
    if (t.hasAttribute("data-logout")) { logout(); return; }
    if (t.dataset.rate) { rateModal(t.dataset.rate); return; }

    if (t.dataset.quick) { sendChat(t.dataset.quick); return; }
    if (t.dataset.matchQuick) { toast("Reply sent: " + t.dataset.matchQuick); return; }
    if (t.hasAttribute("data-match-arrange")) {
      // reaching out only opens the chat — the swap logs later when you mark it complete
      const theirItem = state.listings.find((l) => l.id === state.match.itemId);
      toast("Reaching out to @" + state.match.user + " 🌱");
      if (theirItem) startConvoFromItem(theirItem.id, `Hey! Loving your ${theirItem.name} 🌱 Keen to swap — when works to meet up?`);
      else startConvoWithUser(state.match.user);
      return;
    }

    // star picker inside modal
    if (t.dataset.star) {
      const n = +t.dataset.star;
      const pick = document.getElementById("starPick");
      pick.dataset.value = n;
      pick.querySelectorAll("[data-star]").forEach((s) => (s.textContent = +s.dataset.star <= n ? "★" : "☆"));
      return;
    }
    if (t.dataset.rtag) {
      document.querySelectorAll("#tagPick .chip").forEach((c) => c.classList.remove("active"));
      t.classList.add("active");
      return;
    }
  });

  /* modal confirm buttons (ids) */
  document.addEventListener("click", (e) => {
    if (e.target.id === "confirmRate") confirmRate(e.target.dataset.user);
    if (e.target.id === "confirmDelete") deleteListing(e.target.dataset.id);
  });

  /* modal: outside click + Escape */
  document.getElementById("modal-bg").addEventListener("click", (e) => {
    if (e.target.id === "modal-bg") closeModal();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function markRead(id) {
    const c = state.conversations.find((x) => x.id === id);
    if (c) c.unread = 0;
  }

  function toggleSave(id) {
    const arr = state.user.savedItems;
    const i = arr.indexOf(id);
    if (i >= 0) { arr.splice(i, 1); toast("Removed from saved"); }
    else { arr.push(id); toast("Saved to your watchlist ♥"); }
    if (state.auth) persistSession();
    // live-update any heart icons for this id on current screen
    document.querySelectorAll(`[data-save="${id}"]`).forEach((node) => {
      const saved = arr.includes(id);
      node.classList.toggle("saved", saved);
      if (node.textContent.trim() === "♥" || node.textContent.trim() === "♡")
        node.textContent = saved ? "♥" : "♡";
    });
  }

  function handleOnb(action) {
    if (action === "next") { state.onbIndex++; render("onboarding"); }
    else { // skip or done
      state.onboarded = true;
      sessionStorage.setItem("rw_onboarded", "1");
      go(state.auth ? "home" : "auth");
    }
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    applyTheme();

    // restore session
    const current = localStorage.getItem("rw_current");
    if (current) {
      const acct = Accounts.get(current);
      if (acct) { state.user = acct; state.auth = true; }
    }

    // loading screen → first real screen
    const loading = document.getElementById("loading");
    setTimeout(() => {
      loading.classList.add("hide");
      const first = !state.onboarded ? "onboarding" : state.auth ? "home" : "auth";
      if (first === "auth") state.authMode = "login";
      render(first);
      setTimeout(() => loading.remove(), 700);
    }, 2100);

    startMessageSim(); // begins trickling messages once you're signed in with listings
    startCommunitySim(); // live-updating community impact numbers
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

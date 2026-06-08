/* ============================================================
   Re:Wear, components.js
   Pure-ish render helpers. Each returns an HTML string.
   State is read from window.RW.state; actions live in app.js.
   ============================================================ */
(function () {
  const D = window.RW_DATA;

  /* ---------- small helpers ---------- */
  const initials = (name) =>
    (name || "?")
      .replace(/^@/, "")
      .split(/[.\s_]+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  /* Resolve a profile photo for a username (current user's custom pic wins). */
  const avatarSrc = (username) => {
    const st = window.RW.state;
    if (st.auth && (username === st.user.username || username === (st.user.name || "").toLowerCase())) {
      return st.user.avatar || D.AVATARS[username] || null;
    }
    return D.AVATARS[username] || null;
  };

  /* Avatar element: photo if we have one, otherwise initials. */
  const avatarHTML = (username, sizeClass = "") => {
    const src = avatarSrc(username);
    return src
      ? `<div class="avatar ${sizeClass} has-img"><img src="${src}" alt="${username}" loading="lazy" onerror="this.parentNode.classList.remove('has-img');this.parentNode.textContent='${initials(username)}'"></div>`
      : `<div class="avatar ${sizeClass}">${initials(username)}</div>`;
  };

  /* Generic person silhouette (circle head + semicircle shoulders).
     Used when no real profile photo has been uploaded. */
  const personSVG = (size = 56) =>
    `<svg class="silo" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
       <circle cx="24" cy="17.5" r="8.5" fill="currentColor"/>
       <path d="M9.5 41.5a14.5 14.5 0 0 1 29 0z" fill="currentColor"/>
     </svg>`;

  const fmt = (n) => n.toLocaleString("en-CA");

  const fmtBig = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  };

  const tint = (hue) => `--ph-tint: hsl(${hue} 30% 22% / 0.5)`;

  const stars = (r) => {
    const full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  };

  /* Brand mark: two arrows chasing in a ring = clothes staying in circulation.
     Uses CSS vars so it adapts to the active theme. */
  const logo = (size = 40) => `
    <svg class="rw-logo" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <g stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M10.84 19.21 A14 14 0 0 1 37.16 19.21" stroke="var(--green)"/>
        <path d="M38.40 12.37 L37.16 19.21 L31.82 14.77" stroke="var(--green)"/>
        <path d="M37.16 28.79 A14 14 0 0 1 10.84 28.79" stroke="var(--amber)"/>
        <path d="M9.60 35.63 L10.84 28.79 L16.18 33.23" stroke="var(--amber)"/>
      </g>
    </svg>`;

  /* Logo + wordmark lockup. */
  const brand = (logoSize = 26, wordSize = 28) => `
    <span class="brand">
      ${logo(logoSize)}
      <span class="wordmark" style="font-size:${wordSize}px"><span class="re">Re:</span><span class="accent">Wear</span></span>
    </span>`;

  /* Crisp line-icon set (replaces fuzzy unicode glyphs). currentColor-driven. */
  const ICONS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/>',
    user: '<circle cx="12" cy="8.3" r="3.8"/><path d="M5 20c1.1-3.9 4-5.6 7-5.6s5.9 1.7 7 5.6"/>',
    theme: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.2v4.6"/><circle cx="12" cy="7.7" r="1.05" fill="currentColor" stroke="none"/>',
    trash: '<path d="M4 7h16"/><path d="M9.5 7V5h5v2"/><path d="M6.5 7l.9 13h9.2l.9-13"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    droplet: '<path d="M12 3.2c3.2 3.6 5.2 6.6 5.2 9.3a5.2 5.2 0 0 1-10.4 0c0-2.7 2-5.7 5.2-9.3z"/><path d="M9.5 13.2a2.6 2.6 0 0 0 2.5 2.6" stroke-width="1.6"/>',
    leaf: '<path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14"/><path d="M5.5 18.5C8 14 11.5 11.5 16 10"/>',
    image: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.7"/><path d="M21 16l-5-5-8 8"/>',
  };
  const icon = (name, size = 18) =>
    `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  /* image placeholder frame, if `src` is given, a real image is layered
     on top; on load error it hides itself so the placeholder shows through. */
  const imgPh = (label, cls = "wide", styleHue, src) =>
    `<div class="imgph ${cls}" ${styleHue != null ? `style="${tint(styleHue)}"` : ""}>
       <div class="ph-icon">⬡</div>
       <div class="ph-label">${label}</div>
       ${src ? `<img class="ph-img" src="${src}" alt="${label}" loading="lazy" onerror="this.remove()">` : ""}
     </div>`;

  /* condition dots (5 total, n filled = quality) */
  const condDots = (condition) => {
    const i = D.CONDITION_SCALE.indexOf(condition); // 0 best
    const on = 5 - i; // Like New -> 5 dots
    let h = '<span class="condition-dots">';
    for (let k = 0; k < 5; k++) h += `<i class="${k < on ? "on" : ""}"></i>`;
    return h + "</span>";
  };

  /* ---------- listing card ---------- */
  const listingCard = (item) => {
    const saved = window.RW.state.user.savedItems.includes(item.id);
    return `
      <article class="card listing pressable rise" data-open="${item.id}">
        ${imgPh(item.category, "tall", item.tone, item.image)}
        <div class="meta">
          <div class="lname">${item.name}</div>
          <div class="lbrand">${item.brand} · @${item.lister}</div>
          <div class="lfoot">
            <span class="size-badge">SIZE ${item.size}</span>
            ${condDots(item.condition)}
          </div>
          <div class="lfoot">
            <span class="swap-score">⇄ ${item.swapScore.toFixed(1)}</span>
            <span class="save-ico ${saved ? "saved" : ""}" data-save="${item.id}">${saved ? "♥" : "♡"}</span>
          </div>
        </div>
      </article>`;
  };

  /* ---------- status bar ---------- */
  const statusBar = () => `
    <div class="statusbar">
      <span>9:41</span>
      <div class="sb-icons">
        <svg class="sb-ico" width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1"/>
          <rect x="5" y="5.5" width="3" height="6.5" rx="1"/>
          <rect x="10" y="2.8" width="3" height="9.2" rx="1"/>
          <rect x="15" y="0" width="3" height="12" rx="1"/>
        </svg>
        <svg class="sb-ico" width="17" height="13" viewBox="0 0 17 13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
          <path d="M1.8 4.4 C5 1.3, 12 1.3, 15.2 4.4"/>
          <path d="M3.9 6.9 C6.2 4.7, 10.8 4.7, 13.1 6.9"/>
          <path d="M6.1 9.3 C7.3 8.1, 9.7 8.1, 10.9 9.3"/>
          <circle cx="8.5" cy="11.4" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
        <span class="sb-battery"></span>
      </div>
    </div>`;

  /* ---------- bottom nav ---------- */
  const bottomNav = (active) => {
    const unread = window.RW.unreadCount();
    const item = (id, ico, label, extra = "") =>
      `<button class="navitem ${extra} ${active === id ? "active" : ""}" data-nav="${id}">
         <span class="ico">${ico}</span><span>${label}</span>
         ${id === "dms" && unread ? `<span class="nav-badge">${unread}</span>` : ""}
       </button>`;
    return `
      <nav class="bottomnav">
        ${item("home", icon("home", 22), "Home")}
        ${item("browse", icon("search", 22), "Browse")}
        ${item("add", icon("plus", 24), "Add", "add")}
        ${item("dms", icon("mail", 22), "Messages")}
        ${item("profile", icon("user", 22), "Profile")}
      </nav>`;
  };

  /* ============================================================
     SCREENS
     ============================================================ */
  const Screens = {};

  /* ---------- ONBOARDING ---------- */
  Screens.onboarding = () => {
    const i = window.RW.state.onbIndex;
    const c = D.ONBOARDING[i];
    const last = i === D.ONBOARDING.length - 1;
    return `
      <div class="onb">
        <div class="row between">
          ${brand(26, 26)}
          <button class="chip" data-onb="skip">Skip</button>
        </div>
        <div class="onb-card mt-24">
          ${imgPh("Editorial image", "wide", c === D.ONBOARDING[0] ? 14 : i === 1 ? 150 : 4, [
            "https://images.pexels.com/photos/5524406/pexels-photo-5524406.jpeg?auto=compress&cs=tinysrgb&w=700",
            "https://images.pexels.com/photos/6996083/pexels-photo-6996083.jpeg?auto=compress&cs=tinysrgb&w=700",
            "https://images.pexels.com/photos/6770027/pexels-photo-6770027.jpeg?auto=compress&cs=tinysrgb&w=700",
          ][i])}
          <div class="chip chip-amber chip-static mt-20" style="align-self:flex-start">Source · ${c.source}</div>
          <div class="onb-stat mt-16">${c.stat}</div>
          <div class="onb-unit">${c.unit}</div>
          <div class="onb-context">${c.context}</div>
        </div>
        <div class="dots">
          ${D.ONBOARDING.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}
        </div>
        <button class="btn btn-primary" data-onb="${last ? "done" : "next"}">
          ${last ? "Get started" : "Next"}
        </button>
      </div>`;
  };

  /* ---------- AUTH ---------- */
  Screens.auth = () => {
    const mode = window.RW.state.authMode; // 'login' | 'signup'
    const signup = mode === "signup";
    return `
      <div class="auth-wrap">
        ${brand(38, 34)}
        <p class="muted tiny mt-8">Swap, don't shop. Keep clothes in circulation.</p>
        <h1 class="auth-hero mt-24">${signup ? "Create your<br>swap account" : "Welcome<br>back"}</h1>

        <form id="authForm" class="mt-16">
          ${
            signup
              ? `<div class="field"><label>Name</label>
                  <input class="input" name="name" placeholder="e.g. Alex Rivera" autocomplete="off" required></div>`
              : `<div class="field"><label>Name or email</label>
                  <input class="input" name="name" placeholder="Your name" autocomplete="off" required></div>`
          }
          <div class="field"><label>Password</label>
            <input class="input" name="password" type="password" placeholder="••••••••" required></div>

          <button class="btn btn-primary mt-20" type="submit">
            ${signup ? "Create account" : "Log in"}
          </button>
        </form>

        ${!signup ? `<p class="demo-note">Forgot your password? In this demo, any password works for an existing name.</p>` : ""}

        <p class="auth-switch">
          ${signup
            ? `Already swapping? <b data-auth="login">Log in</b>`
            : `New here? <b data-auth="signup">Create an account</b>`}
        </p>
        <p class="demo-note">This is a demo account system. Details are stored only on this device for the prototype.</p>
      </div>`;
  };

  /* ---------- HOME ---------- */
  Screens.home = () => {
    // newest first, so your own fresh listings show up in Featured too
    const featured = window.RW.state.listings.slice(0, 4);
    return `
      <div class="topbar">
        ${brand(28, 28)}
        <div class="row gap-8">
          <button class="iconbtn" data-theme-toggle title="Theme">${icon("theme")}</button>
          <button class="iconbtn" data-nav="about" title="About">${icon("info")}</button>
        </div>
      </div>

      <!-- community impact -->
      <section class="card rise" style="padding:16px">
        <div class="eyebrow">Community impact</div>
        <div class="stat-grid mt-12">
          <div class="stat-tile"><div class="num" style="color:var(--green)" data-live="swaps" data-count="${window.RW.state.community.swaps}">0</div><div class="lbl">Swaps made</div></div>
          <div class="stat-tile"><div class="num" style="color:var(--water)" data-live="water" data-count="${(window.RW.state.community.waterLitres / 1e6).toFixed(2)}" data-suffix="M">0</div><div class="lbl">Litres saved</div></div>
          <div class="stat-tile"><div class="num" style="color:var(--amber)" data-live="co2" data-count="${window.RW.state.community.co2Kg}" data-suffix="kg">0</div><div class="lbl">CO₂ avoided</div></div>
        </div>
        <div class="row gap-6 mt-12" style="justify-content:center"><span class="live-dot"></span><span class="tiny" style="color:var(--text-3)"><span data-live="items">${window.RW.state.community.itemsInCirculation.toLocaleString()}</span> items in circulation right now</span></div>
      </section>

      <!-- hero -->
      <section class="card glow rise mt-16" style="padding:18px;overflow:hidden">
        <div class="row between">
          <div class="chip chip-green chip-static">● Live in Nepean, ON</div>
          <div class="sdg mini">
            <div class="n">12</div>
            <div class="t">Responsible<br>Consumption</div>
          </div>
        </div>
        <h1 class="display mt-16" style="font-size:38px">Wear it again.<br>Then pass it on.</h1>
        <p class="muted mt-8" style="font-size:14px;line-height:1.5">A peer-to-peer clothing swap for students. No money, no waste, just clothes finding their next chapter.</p>
        <button class="btn btn-primary mt-16" data-nav="browse">Start swapping →</button>
      </section>

      <!-- featured -->
      <div class="section-h"><h3>Featured swaps</h3><span class="link" data-nav="browse">See all</span></div>
      <div class="grid-2">${featured.map(listingCard).join("")}</div>

      <!-- nearby -->
      <div class="section-h"><h3>Nearby</h3><span class="chip chip-amber chip-static">📍 Nepean, ON</span></div>
      <div class="scroll-x">
        ${D.LISTINGS.filter((l) => l.distanceKm < 3)
          .map(
            (l) => `
          <article class="card listing pressable" style="width:150px;flex:0 0 auto" data-open="${l.id}">
            ${imgPh(l.category, "square", l.tone, l.image)}
            <div class="meta">
              <div class="lname">${l.name}</div>
              <div class="lbrand">${l.distanceKm} km away</div>
            </div>
          </article>`
          )
          .join("")}
      </div>

      <!-- why swap -->
      <div class="section-h"><h3>Why swap?</h3></div>
      <div class="card pill-list rise" style="padding:16px">
        <div class="fact"><div class="fi">♻</div><div class="fb"><b>Cuts overproduction.</b> Every swap is one less new garment demanded from a wasteful supply chain.</div></div>
        <div class="divider"></div>
        <div class="fact"><div class="fi">💧</div><div class="fb"><b>Saves real resources.</b> Reusing one tee keeps ~2,700 L of water from being spent on a new one.</div></div>
        <div class="divider"></div>
        <div class="fact"><div class="fi">🌍</div><div class="fb"><b>Keeps clothes in use.</b> The average garment is worn just 7 times, swapping extends its life.</div></div>
      </div>`;
  };

  /* ---------- BROWSE ---------- */
  Screens.browse = (skeleton = false) => {
    const st = window.RW.state.browse;
    const items = window.RW.filteredListings();
    const grid = skeleton
      ? Array(6).fill('<div class="skel skel-card"></div>').join("")
      : items.length
      ? items.map(listingCard).join("")
      : `<div class="empty" style="grid-column:1/-1">
           <div class="ei">⬡</div>
           <div style="font-weight:600;color:var(--text-2)">No matches found</div>
           <div class="tiny mt-8">Try a different filter or search term.</div>
         </div>`;

    return `
      <div class="topbar"><h1 class="display" style="font-size:30px">Browse</h1>
        <button class="iconbtn" data-theme-toggle>${icon("theme")}</button></div>

      <div class="card row" style="padding:4px 6px 4px 14px;gap:8px">
        <span style="color:var(--text-3)">⌕</span>
        <input class="input" id="searchInput" placeholder="Search items, brands…"
          value="${st.query}" style="border:none;background:none;padding:12px 0;flex:1">
      </div>

      <div class="scroll-x mt-12">
        ${D.FILTERS.map(
          (f) => `<button class="chip ${st.filter === f ? "active" : ""}" data-filter="${f}">${f}</button>`
        ).join("")}
      </div>

      <div class="row between mt-12">
        <span class="tiny muted">${items.length} item${items.length === 1 ? "" : "s"}</span>
        <select class="input chip" id="sortSelect" style="width:auto;padding:8px 30px 8px 14px;font-size:12.5px">
          ${D.SORTS.map((s) => `<option ${st.sort === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>

      <div class="grid-2 mt-12" id="browseGrid">${grid}</div>`;
  };

  /* ---------- ITEM DETAIL ---------- */
  Screens.detail = () => {
    const item = window.RW.currentItem();
    if (!item) return `<div class="empty">Item not found.</div>`;
    const sv = window.RW.computeImpact(item);
    const own = window.RW.isOwn(item);
    const saved = window.RW.state.user.savedItems.includes(item.id);
    const reviews = D.REVIEWS[item.lister] || [];
    const similar = D.LISTINGS.filter((l) => l.category === item.category && l.id !== item.id).slice(0, 4);
    const similarRow = (similar.length ? similar : D.LISTINGS.filter((l) => l.id !== item.id).slice(0, 4))
      .map(
        (l) => `<article class="card listing pressable" style="width:130px;flex:0 0 auto" data-open="${l.id}">
            ${imgPh(l.category, "square", l.tone, l.image)}
            <div class="meta"><div class="lname" style="font-size:12px">${l.name}</div></div>
          </article>`
      )
      .join("");

    return `
      <div class="topbar">
        <button class="iconbtn backbtn" data-back>${icon("back")}</button>
        <span style="font-weight:600;font-size:14px">${own ? "Your listing" : "Item"}</span>
        ${own
          ? `<button class="iconbtn" data-delete="${item.id}" title="Delete">${icon("trash")}</button>`
          : `<button class="iconbtn save-ico ${saved ? "saved" : ""}" data-save="${item.id}">${saved ? "♥" : "♡"}</button>`}
      </div>

      ${imgPh("Item photo", "tall", item.tone, item.image)}

      <div class="row wrap gap-8 mt-16">
        ${item.tags.map((t) => `<span class="chip chip-static">${t}</span>`).join("")}
      </div>

      <h1 class="display mt-12" style="font-size:34px">${item.name}</h1>
      <div class="row wrap gap-8 mt-8 muted tiny">
        <span>${item.brand}</span><span>·</span><span>${item.category}</span><span>·</span>
        <span>Size ${item.size}</span><span>·</span><span>${item.condition}</span>
        ${item.material ? `<span>·</span><span>${item.material}</span>` : ""}
      </div>

      <!-- condition scale -->
      <div class="card mt-16" style="padding:16px">
        <div class="eyebrow">Condition</div>
        <div class="cond-scale mt-12">
          ${D.CONDITION_SCALE.map(
            (c) => `<div class="step ${c === item.condition ? "on" : ""}">
              <div class="seg"></div><div class="cl">${c}</div></div>`
          ).join("")}
        </div>
      </div>

      <!-- environmental savings -->
      <div class="env-card mt-16">
        <div class="row between">
          <div class="eyebrow" style="color:var(--green)">Impact of swapping this</div>
          <span class="chip chip-green chip-static">vs buying new</span>
        </div>
        <div class="env-row">
          <div class="env-stat">
            <span class="impact-ico water">${icon("droplet", 20)}</span>
            <div class="impact-meta"><div class="v" data-count="${sv.water}">0</div><div class="k">litres of water saved</div></div>
          </div>
          <div class="env-stat">
            <span class="impact-ico co2">${icon("leaf", 20)}</span>
            <div class="impact-meta"><div class="v" data-count="${sv.co2}" data-suffix="kg">0</div><div class="k">kg CO₂ avoided</div></div>
          </div>
        </div>
        <p class="tiny" style="color:var(--text-3);margin-top:12px">Based on ${item.category.toLowerCase()} · ${item.material || "mixed"} · ${item.dimensions || "standard"} cut</p>
      </div>

      <!-- swap preference -->
      <div class="card mt-16" style="padding:14px 16px">
        <div class="eyebrow">Swap preference</div>
        <p class="mt-8" style="font-size:14px;line-height:1.45">${item.note}</p>
      </div>

      <!-- lister + trust -->
      <div class="section-h"><h3>Lister</h3>${own ? "" : `<span class="link" data-user="${item.lister}">View profile</span>`}</div>
      <div class="card lister-chip pressable" data-user="${item.lister}">
        ${avatarHTML(item.lister)}
        <div style="flex:1">
          <div class="row between"><b style="font-size:14.5px">@${item.lister}</b>
            <span class="chip chip-green chip-static">★ ${item.reputation.toFixed(1)}</span></div>
          <div class="tiny muted mt-8">Swap score ${item.swapScore.toFixed(1)} · Reputation</div>
          <div class="bar repbar mt-8"><i data-bar="${(item.reputation / 5) * 100}"></i></div>
        </div>
        <span class="tiny" style="color:var(--green)">›</span>
      </div>

      ${
        reviews.length
          ? `<div class="section-h"><h3>Reviews</h3><span class="link" data-rate="${item.lister}">Leave one</span></div>
             <div class="stack gap-10">
               ${reviews
                 .map(
                   (r) => `<div class="card review">
                     <div class="rh"><span class="chip chip-amber chip-static">${r.tag}</span>
                       <span class="stars">${stars(r.rating)}</span></div>
                     <div class="rb">"${r.body}"</div>
                     <div class="tiny" style="color:var(--text-3);margin-top:7px">by ${r.anon ? "Anonymous swapper" : "@" + r.by}</div>
                   </div>`
                 )
                 .join("")}
             </div>`
          : ""
      }

      <!-- similar -->
      <div class="section-h"><h3>Similar items</h3></div>
      <div class="scroll-x">${similarRow}</div>

      <div class="stack gap-10 mt-24">
        ${
          own
            ? `<div class="card" style="padding:13px 16px;text-align:center;color:var(--text-2);font-size:13px">This is your listing, so you can't swap with yourself. It's live for others to request.</div>
               <button class="btn btn-ghost" data-delete="${item.id}" style="color:var(--amber)">Delete listing</button>`
            : `<button class="btn btn-primary" data-request="${item.id}">Request swap ⇄</button>
               <button class="btn btn-ghost" data-save-btn="${item.id}">${saved ? "♥ Saved for later" : "♡ Save for later"}</button>`
        }
      </div>`;
  };

  /* ---------- ADD LISTING ---------- */
  Screens.add = () => {
    const f = window.RW.state.draft;
    return `
      <div class="topbar"><h1 class="display" style="font-size:30px">Add a listing</h1>
        <button class="iconbtn" data-theme-toggle>${icon("theme")}</button></div>

      <div class="imgph wide pressable" id="uploadMock">
        ${
          f.image
            ? `<img class="ph-img" src="${f.image}" alt="Your photo">
               <button class="img-clear" id="clearPhoto" title="Remove photo">✕</button>`
            : `<div class="ph-icon">📷</div><div class="ph-label">Tap to add photo</div>`
        }
      </div>
      <input type="file" id="photoInput" accept="image/*" hidden>
      <p class="tiny muted" style="text-align:center;margin-top:8px">${f.image ? "Looking good. Tap the photo to change it." : "Add a real photo from your device, or skip it."}</p>

      <form id="addForm" class="mt-16 stack gap-12">
        <div class="field" style="margin:0">
          <label>Category</label>
          <select class="input" name="category">
            ${D.FILTERS.filter((x) => x !== "All")
              .map((c) => `<option ${f.category === c ? "selected" : ""}>${c}</option>`)
              .join("")}
          </select>
        </div>
        <div class="row gap-12">
          <div class="field" style="margin:0;flex:1"><label>Brand</label>
            <input class="input" name="brand" placeholder="e.g. Levi's" value="${f.brand}"></div>
          <div class="field" style="margin:0;width:96px"><label>Size</label>
            <input class="input" name="size" placeholder="M" value="${f.size}"></div>
        </div>
        <div class="field" style="margin:0"><label>Item name</label>
          <input class="input" name="name" placeholder="e.g. Vintage Denim Jacket" value="${f.name}"></div>
        <div class="field" style="margin:0"><label>Condition</label>
          <select class="input" name="condition">
            ${D.CONDITION_SCALE.map((c) => `<option ${f.condition === c ? "selected" : ""}>${c}</option>`).join("")}
          </select></div>
        <div class="row gap-12">
          <div class="field" style="margin:0;flex:1"><label>Material</label>
            <select class="input" name="material">
              ${Object.keys(D.MATERIALS).map((m) => `<option ${f.material === m ? "selected" : ""}>${m}</option>`).join("")}
            </select></div>
          <div class="field" style="margin:0;flex:1"><label>Size & cut</label>
            <select class="input" name="dimensions">
              ${Object.keys(D.SIZE_PROFILES).map((s) => `<option ${f.dimensions === s ? "selected" : ""}>${s}</option>`).join("")}
            </select></div>
        </div>
        <div class="impact-card">
          <div class="row between">
            <span class="impact-title">Estimated impact if swapped</span>
            <span class="chip chip-green chip-static">vs buying new</span>
          </div>
          <div class="impact-grid mt-12">
            <div class="impact-stat">
              <span class="impact-ico water">${icon("droplet", 20)}</span>
              <div class="impact-meta">
                <div class="impact-num" id="impWater">${window.RW.estImpact().water.toLocaleString()}</div>
                <div class="impact-unit">litres of water</div>
              </div>
            </div>
            <div class="impact-divider"></div>
            <div class="impact-stat">
              <span class="impact-ico co2">${icon("leaf", 20)}</span>
              <div class="impact-meta">
                <div class="impact-num" id="impCo2">${window.RW.estImpact().co2}</div>
                <div class="impact-unit">kg CO₂ avoided</div>
              </div>
            </div>
          </div>
        </div>
        <div class="field" style="margin:0"><label>Style tags <span class="muted">(comma separated)</span></label>
          <input class="input" name="tags" placeholder="Vintage, Cozy, Neutral" value="${f.tags}"></div>
        <div class="field" style="margin:0"><label>Swap preference note</label>
          <textarea class="input" name="note" placeholder="What are you hoping to swap for?">${f.note}</textarea></div>
      </form>

      <!-- live preview -->
      <div class="section-h"><h3>Live preview</h3><span class="tiny muted">Updates as you type</span></div>
      <div class="grid-2"><div id="previewSlot">${window.RW.previewCard()}</div></div>

      <button class="btn btn-primary mt-24" id="submitListing">Post listing</button>`;
  };

  /* ---------- DMS (list) ---------- */
  Screens.dms = () => {
    const convos = window.RW.state.conversations;
    if (!convos.length) {
      return `
        <div class="topbar"><h1 class="display" style="font-size:30px">Messages</h1>
          <button class="iconbtn" data-theme-toggle>${icon("theme")}</button></div>
        <div class="card empty" style="padding:40px 24px;margin-top:8px">
          <div class="ei">✉</div>
          <div style="font-weight:600;color:var(--text-2)">No messages yet</div>
          <div class="tiny mt-8">List an item and swappers will reach out, or start a chat from any listing.</div>
          <button class="btn btn-primary mt-20" data-nav="browse" style="width:auto;margin:20px auto 0">Browse listings</button>
        </div>`;
    }
    return `
      <div class="topbar"><h1 class="display" style="font-size:30px">Messages</h1>
        <button class="iconbtn" data-theme-toggle>${icon("theme")}</button></div>
      <p class="muted tiny" style="margin-bottom:6px">Reach out about listings and arrange your swaps.</p>
      ${convos
        .map((c) => {
          const item = window.RW.state.listings.find((l) => l.id === c.itemId);
          const last = c.messages[c.messages.length - 1];
          const preview = last.type === "image" ? "📷 Photo" : last.text;
          return `
          <div class="convo" data-chat="${c.id}">
            ${avatarHTML(c.user)}
            <div class="ct">
              <div class="ctop"><span class="cname">@${c.user}</span><span class="ctime">${c.time}</span></div>
              <div class="citem">${c.swapped ? "✓ Swapped · " : "⇄ "}${item ? item.name : "Listing"}</div>
              <div class="clast">${last.from === "me" ? "You: " : ""}${preview}</div>
            </div>
            ${c.swapped ? `<span class="convo-done">✓</span>` : c.unread ? `<span class="unread">${c.unread}</span>` : ""}
          </div>`;
        })
        .join("")}`;
  };

  /* ---------- CHAT ---------- */
  Screens.chat = () => {
    const c = window.RW.currentConvo();
    if (!c) return `<div class="empty">Conversation not found.</div>`;
    const item = window.RW.state.listings.find((l) => l.id === c.itemId);
    return `
      <div class="topbar">
        <button class="iconbtn backbtn" data-back>${icon("back")}</button>
        <div class="row gap-8 pressable" data-user="${c.user}">${avatarHTML(c.user, "sm")}
          <b style="font-size:15px">@${c.user}</b></div>
        <button class="iconbtn" data-theme-toggle>${icon("theme")}</button>
      </div>

      ${
        item
          ? `<div class="card chat-ctx pressable" data-open="${item.id}">
              <div class="imgph square" style="width:46px;height:46px;flex:0 0 auto;${tint(item.tone)}"><div class="ph-icon" style="width:20px;height:20px;font-size:10px">⬡</div>${item.image ? `<img class="ph-img" src="${item.image}" alt="" onerror="this.remove()">` : ""}</div>
              <div style="flex:1"><div style="font-weight:600;font-size:13px">${item.name}</div>
                <div class="tiny muted">${item.brand} · Size ${item.size}</div></div>
              <span class="tiny" style="color:var(--green)">View ›</span>
            </div>
            ${
              window.RW.isOwn(item)
                ? ""
                : c.swapped
                ? `<div class="swap-done">✓ Swap completed${c.swappedOn ? " · " + c.swappedOn : ""}</div>`
                : c.iAgreed && c.theyAgreed
                ? `<button class="btn btn-ghost btn-sm swap-cta" data-mark-swapped="${c.id}">Mark swap as complete</button>`
                : `<div class="swap-hint">🤝 Once you both agree to swap, you can mark it complete here</div>`
            }`
          : ""
      }

      <div class="bubbles" id="bubbles">
        ${c.messages
          .map((m) =>
            m.type === "image"
              ? `<div class="bubble ${m.from} img"><img class="msg-img" src="${m.src}" alt="shared photo"><div class="bt">${m.time || ""}</div></div>`
              : `<div class="bubble ${m.from}">${m.text}<div class="bt">${m.time || ""}</div></div>`
          )
          .join("")}
      </div>

      <div class="scroll-x quickbar">
        ${(() => {
          const u = window.RW.state.user;
          const wl = (u && u.wishlist) || [];
          const quicks = [...D.QUICK_REPLIES];
          if (wl.length) {
            const desc = wl
              .map((w) => (w.size && w.size !== "Any" ? `${w.type} (${w.size})` : w.type))
              .join(", ");
            quicks.unshift(`I'm looking for ${desc} 🌱`);
          }
          return quicks.map((q) => `<button class="chip" data-quick="${q}">${q}</button>`).join("");
        })()}
      </div>

      <div class="chat-input">
        <button class="iconbtn" id="attachBtn" title="Attach a photo">${icon("image")}</button>
        <input class="input" id="chatInput" placeholder="Message…" style="flex:1">
        <button class="btn btn-primary btn-sm" id="sendChat" style="width:auto">Send</button>
        <input type="file" id="chatPhoto" accept="image/*" hidden>
      </div>`;
  };

  /* ---------- SWAP COMPLETE CELEBRATION (reuses the match-screen layout) ---------- */
  Screens.match = () => {
    const m = window.RW.state.match;
    const u = window.RW.state.user;
    // Your side shows your profile picture: uploaded photo if you have one,
    // otherwise the generic circle + semicircle silhouette.
    const selfPic = u && u.avatar
      ? `<div class="imgph tall mc1 self-pic has-photo"><img src="${u.avatar}" alt="you"></div>`
      : `<div class="imgph tall mc1 self-pic silo-card">${personSVG(72)}</div>`;
    return `
      <div class="match-wrap">
        <div class="confetti" id="confetti"></div>
        <div class="chip chip-green chip-static">Swap complete</div>
        <div class="match-cards">
          ${selfPic}
          ${imgPh(m.theirCategory || "Their item", "tall", m.theirTone, m.theirImage).replace("imgph tall", "imgph tall mc2")}
        </div>
        <h1 class="match-head">Swap complete!</h1>
        <p class="muted" style="font-size:15px;max-width:290px">You swapped with <b style="color:var(--text)">@${m.user}</b>. Two more clothes kept in circulation 🌱</p>

        <div class="env-card" style="width:100%;margin-top:20px">
          <div class="row between">
            <div class="eyebrow" style="color:var(--green)">Impact you just made</div>
            <span class="chip chip-green chip-static">vs buying new</span>
          </div>
          <div class="env-row">
            <div class="env-stat">
              <span class="impact-ico water">${icon("droplet", 20)}</span>
              <div class="impact-meta"><div class="v" data-count="${m.impactWater || 0}">0</div><div class="k">litres of water saved</div></div>
            </div>
            <div class="env-stat">
              <span class="impact-ico co2">${icon("leaf", 20)}</span>
              <div class="impact-meta"><div class="v" data-count="${m.impactCo2 || 0}" data-suffix="kg">0</div><div class="k">kg CO₂ avoided</div></div>
            </div>
          </div>
        </div>

        <div class="stack gap-10" style="width:100%;margin-top:20px">
          <button class="btn btn-primary" data-nav="profile">See your impact</button>
          <button class="btn btn-ghost" data-nav="dms">Back to messages</button>
        </div>
      </div>`;
  };

  /* Wishlist section: chips of {type, size}. Editable adds a + and delete ✕. */
  const wishlistSection = (items, editable, ownerLabel) => {
    const list = items || [];
    const chips = list
      .map(
        (w, i) =>
          `<span class="wish-chip">${w.type}${w.size && w.size !== "Any" ? ` · ${w.size}` : ""}${
            editable ? `<button class="wish-x" data-wish-del="${i}" title="Remove">✕</button>` : ""
          }</span>`
      )
      .join("");
    const empty = editable
      ? `<div class="tiny muted">Add the clothes and sizes you're hoping to find so swappers know what you want.</div>`
      : `<div class="tiny muted">${ownerLabel} hasn't shared a wishlist yet.</div>`;
    return `
      <div class="section-h"><h3>Wishlist</h3>${
        editable ? `<span class="link" data-wish-add>+ Add</span>` : `<span class="tiny muted">${list.length}</span>`
      }</div>
      <div class="card" style="padding:16px">
        ${list.length ? `<div class="wish-wrap">${chips}</div>` : empty}
      </div>`;
  };

  /* ---------- PROFILE ---------- */
  Screens.profile = () => {
    const u = window.RW.state.user;
    const signedIn = window.RW.state.auth;
    const goalPct = Math.min(100, (u.swapsMade / u.monthlyGoal) * 100);
    const all = window.RW.state.listings; // includes anything the user has added
    const myListings = all.filter((l) => u.listings.includes(l.id));
    const savedListings = all.filter((l) => u.savedItems.includes(l.id));

    return `
      <div class="topbar"><h1 class="display" style="font-size:30px">Profile</h1>
        <div class="row gap-8">
          <button class="iconbtn" data-theme-toggle>${icon("theme")}</button>
          <button class="iconbtn" data-nav="about">${icon("info")}</button>
        </div>
      </div>

      <div class="card rise" style="padding:18px">
        <div class="row gap-14">
          <div class="avatar lg pfp ${u.avatar ? "has-img" : ""}" ${signedIn ? 'id="avatarEdit"' : ""}>
            ${u.avatar ? `<img src="${u.avatar}" alt="you">` : signedIn ? initials(u.name) : "?"}
            ${signedIn ? `<span class="pfp-cam">${icon("image", 13)}</span>` : ""}
          </div>
          <input type="file" id="avatarInput" accept="image/*" hidden>
          <div style="flex:1">
            <h2 class="display" style="font-size:26px">${u.name}</h2>
            <div class="tiny muted mt-8">📍 ${u.location}</div>
            <div class="row gap-8 mt-8">
              <span class="chip chip-green chip-static">⇄ ${u.swapScore.toFixed(1)} swap</span>
              <span class="chip chip-amber chip-static">★ ${u.reputation.toFixed(1)} rep</span>
            </div>
          </div>
        </div>
        ${
          !signedIn
            ? `<button class="btn btn-primary mt-16" data-nav="auth">Sign in to start swapping</button>`
            : `<div class="mt-16"><div class="row between tiny"><span class="muted">Reputation</span><span>${u.reputation.toFixed(1)} / 5</span></div>
               <div class="bar repbar mt-8"><i data-bar="${(u.reputation / 5) * 100}"></i></div></div>`
        }
      </div>

      <!-- stats -->
      <div class="stat-grid mt-16">
        <div class="card stat-tile"><div class="num" style="color:var(--green)" data-count="${u.swapsMade}">0</div><div class="lbl">Swaps made</div></div>
        <div class="card stat-tile"><div class="num" style="color:var(--water)" data-count="${u.waterSaved}">0</div><div class="lbl">Litres saved</div></div>
        <div class="card stat-tile"><div class="num" style="color:var(--amber)" data-count="${u.co2Saved}" data-suffix="kg">0</div><div class="lbl">CO₂ avoided</div></div>
      </div>

      <!-- monthly goal -->
      <div class="card mt-16" style="padding:16px">
        <div class="row between">
          <div class="eyebrow">Monthly swap goal</div>
          <div class="row gap-8">
            <button class="stepper" data-goal="-1" title="Lower goal">−</button>
            <span class="tiny" style="min-width:46px;text-align:center"><b>${u.swapsMade}</b> / ${u.monthlyGoal}</span>
            <button class="stepper" data-goal="1" title="Raise goal">+</button>
          </div>
        </div>
        <div class="bar mt-12"><i data-bar="${goalPct}"></i></div>
        <div class="tiny muted mt-8">${u.swapsMade >= u.monthlyGoal ? "Goal smashed this month 🎉" : `${u.monthlyGoal - u.swapsMade} more to hit your goal`}</div>
      </div>

      <!-- wishlist -->
      ${signedIn ? wishlistSection(u.wishlist, true) : ""}

      <!-- saved items -->
      <div class="section-h"><h3>Saved items</h3><span class="tiny muted">${u.savedItems.length}</span></div>
      ${
        u.savedItems.length
          ? `<div class="grid-2">${savedListings.map(listingCard).join("")}</div>`
          : `<div class="card empty" style="padding:28px"><div class="ei">♡</div><div class="tiny">No saved items yet. Tap the heart on any listing.</div></div>`
      }

      <!-- active listings -->
      <div class="section-h"><h3>Active listings</h3><span class="link" data-nav="add">+ Add</span></div>
      ${
        myListings.length
          ? `<div class="grid-2">${myListings
              .map((l) => `<div class="own-listing">${listingCard(l)}<button class="own-del" data-delete="${l.id}" title="Delete listing">${icon("trash", 15)}</button></div>`)
              .join("")}</div>`
          : `<div class="card empty" style="padding:28px"><div class="ei">⬡</div><div class="tiny">No active listings. Share something you no longer wear.</div></div>`
      }

      <!-- completed swaps timeline -->
      <div class="section-h"><h3>Completed swaps</h3></div>
      ${
        u.activity.length
          ? `<div class="card" style="padding:18px 16px"><div class="timeline">
              ${u.activity
                .map(
                  (a) => `<div class="tl-item"><div class="tt">${a.title}</div><div class="td">${a.detail}</div></div>`
                )
                .join("")}
            </div></div>`
          : `<div class="card empty" style="padding:28px"><div class="ei">⇄</div><div class="tiny">Your swap history will appear here.</div></div>`
      }

      <div class="stack gap-10 mt-24">
        <button class="btn btn-primary" data-nav="browse">Find a swap</button>
        ${signedIn ? `<button class="btn btn-ghost" data-logout>Log out</button>` : ""}
      </div>
      <p class="tiny muted" style="text-align:center;margin-top:14px">Swaps log automatically once you mark them complete 🌱</p>`;
  };

  /* ---------- OTHER USER PROFILE ---------- */
  Screens.userProfile = () => {
    const p = window.RW.userProfile(window.RW.state.viewUser);
    if (!p) return `<div class="empty">Profile not found.</div>`;
    const theirListings = window.RW.state.listings.filter((l) => l.lister === p.username);
    const reviews = D.REVIEWS[p.username] || [];
    return `
      <div class="topbar">
        <button class="iconbtn backbtn" data-back>${icon("back")}</button>
        <span style="font-weight:600;font-size:14px">Profile</span>
        <button class="iconbtn" data-theme-toggle>${icon("theme")}</button>
      </div>

      <div class="card rise" style="padding:18px">
        <div class="row gap-14">
          ${avatarHTML(p.username, "lg")}
          <div style="flex:1">
            <h2 class="display" style="font-size:26px">@${p.username}</h2>
            <div class="tiny muted mt-8">📍 ${p.location}</div>
            <div class="row gap-8 mt-8">
              <span class="chip chip-green chip-static">⇄ ${p.swapScore.toFixed(1)} swap</span>
              <span class="chip chip-amber chip-static">★ ${p.reputation.toFixed(1)} rep</span>
            </div>
          </div>
        </div>
        <div class="mt-16"><div class="row between tiny"><span class="muted">Reputation</span><span>${p.reputation.toFixed(1)} / 5</span></div>
          <div class="bar repbar mt-8"><i data-bar="${(p.reputation / 5) * 100}"></i></div></div>
        <button class="btn btn-primary mt-16" data-msg-user="${p.username}">Message @${p.username}</button>
      </div>

      <div class="stat-grid mt-16">
        <div class="card stat-tile"><div class="num" style="color:var(--green)" data-count="${p.swapsMade}">0</div><div class="lbl">Swaps made</div></div>
        <div class="card stat-tile"><div class="num" style="color:var(--water)" data-count="${p.waterSaved}">0</div><div class="lbl">Litres saved</div></div>
        <div class="card stat-tile"><div class="num" style="color:var(--amber)" data-count="${p.co2Saved}" data-suffix="kg">0</div><div class="lbl">CO₂ avoided</div></div>
      </div>

      <!-- monthly goal (read-only) -->
      <div class="card mt-16" style="padding:16px">
        <div class="row between"><div class="eyebrow">Monthly swap goal</div>
          <span class="tiny muted"><b>${p.goalProgress}</b> / ${p.monthlyGoal}</span></div>
        <div class="bar mt-12"><i data-bar="${Math.min(100, (p.goalProgress / p.monthlyGoal) * 100)}"></i></div>
        <div class="tiny muted mt-8">${p.goalProgress >= p.monthlyGoal ? "Goal smashed this month 🎉" : `${p.monthlyGoal - p.goalProgress} more to hit their goal`}</div>
      </div>

      <div class="section-h"><h3>Active listings</h3><span class="tiny muted">${theirListings.length}</span></div>
      ${
        theirListings.length
          ? `<div class="grid-2">${theirListings.map(listingCard).join("")}</div>`
          : `<div class="card empty" style="padding:28px"><div class="ei">⬡</div><div class="tiny">No active listings right now.</div></div>`
      }

      ${wishlistSection(p.wishlist, false, "@" + p.username)}

      ${
        reviews.length
          ? `<div class="section-h"><h3>Reviews</h3><span class="link" data-rate="${p.username}">Leave one</span></div>
             <div class="stack gap-10">
               ${reviews
                 .map(
                   (r) => `<div class="card review">
                     <div class="rh"><span class="chip chip-amber chip-static">${r.tag}</span><span class="stars">${stars(r.rating)}</span></div>
                     <div class="rb">"${r.body}"</div>
                     <div class="tiny" style="color:var(--text-3);margin-top:7px">by ${r.anon ? "Anonymous swapper" : "@" + r.by}</div>
                   </div>`
                 )
                 .join("")}
             </div>`
          : ""
      }`;
  };

  /* ---------- ABOUT / SDG ---------- */
  Screens.about = () => `
    <div class="topbar"><button class="iconbtn backbtn" data-back>${icon("back")}</button>
      <span style="font-weight:600;font-size:14px">About</span>
      <button class="iconbtn" data-theme-toggle>${icon("theme")}</button></div>

    <div class="sdg lg rise">
      <div class="row between"><div class="n">12</div><div class="icon">♾</div></div>
      <div class="t mt-12">Responsible Consumption & Production</div>
    </div>
    <p class="muted tiny mt-12">Re:Wear is built around UN Sustainable Development Goal 12, doing more and better with less.</p>

    <div class="section-h"><h3>Our mission</h3></div>
    <div class="card" style="padding:16px">
      <p style="font-size:15px;line-height:1.55">Fast fashion's culture of overproduction and disposable consumption normalizes waste worldwide. <b style="font-family:var(--serif);font-size:18px">Re:Wear</b> replaces buying new with local reuse, a peer-to-peer swap built for students, where no money changes hands and clothes stay in circulation.</p>
    </div>

    <div class="section-h"><h3>How Re:Wear helps</h3></div>
    <div class="card pill-list" style="padding:16px">
      <div class="fact"><div class="fi">①</div><div class="fb"><b>Addresses real needs.</b> Students get a free, low-pressure way to refresh their wardrobe without funding overproduction, meeting both budget and values.</div></div>
      <div class="divider"></div>
      <div class="fact"><div class="fi">②</div><div class="fb"><b>The impact we want.</b> Fewer new garments demanded, less water and CO₂ spent, and fewer clothes in landfill as items get worn far past the 7-wear average.</div></div>
      <div class="divider"></div>
      <div class="fact"><div class="fi">③</div><div class="fb"><b>Ethical by design.</b> Unlike Depop or Vinted, Re:Wear removes money entirely. Pure swapping kills the resale-for-profit incentive that quietly keeps fast fashion churning.</div></div>
    </div>

    <div class="section-h"><h3>Why it's ethical</h3></div>
    <div class="card" style="padding:16px">
      <p style="font-size:14px;line-height:1.55" class="muted">Existing resale apps still revolve around transactions, which can encourage buying cheap fast fashion just to flip it. Re:Wear fills that gap: a non-commercial, community-first swap that complements, rather than competes with, donation drives and thrift culture. It adds reach and consistency without commercializing generosity.</p>
    </div>

    <div class="section-h"><h3>Works cited</h3></div>
    <div class="card" style="padding:6px 16px">
      ${D.SOURCES.map(
        (s, i) => `<div class="fact" style="padding:13px 0;${i < D.SOURCES.length - 1 ? "border-bottom:1px solid var(--border)" : ""}">
          <div class="fi" style="background:var(--amber-soft);color:var(--amber)">${i + 1}</div>
          <div class="fb"><b>${s.author}.</b> <i>${s.title}.</i> ${s.year}</div>
        </div>`
      ).join("")}
    </div>

    <p class="demo-note mt-24">Re:Wear · A student summative on responsible consumption · SDG 12</p>`;

  /* expose */
  window.RW_UI = { Screens, statusBar, bottomNav, listingCard, imgPh, initials, fmt, fmtBig, stars, condDots, tint, logo, brand, icon };
})();

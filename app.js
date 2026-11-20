// ============================================================================
// SSG HOLIDAY WISHLIST BOARD - APPLICATION LOGIC (3-Color Scheme & Stepped Modal)
// ============================================================================

(function () {
  const CFG = window.SSG_CONFIG || {};
  const STORAGE_KEY_CARDS = "ssg_wishlist_cards_v1";
  const STORAGE_KEY_BACKEND = "ssg_wishlist_backend_url_v1";
  const STORAGE_KEY_THEME = "ssg_wishlist_theme_v1";

  const STAMPS = ["🎄", "🎅", "🦌", "⛄", "🎁", "⭐", "🍪", "🔔", "🕯️", "❄️", "🧸", "🧦"];

  // Starter sample data
  const SAMPLE_CARDS = [
    {
      id: "sample-ssg-1",
      name: "Karl Mendoza",
      codename: "Captain Rudolph",
      committee: "Executive Board",
      stamp: "🦌",
      pin: "",
      items: [
        {
          title: "AquaFlask / Owala 24oz Insulated Tumbler (Forest Green or Black)",
          priority: "top",
          price: "₱650 - ₱850",
          link: "https://shopee.ph/search?keyword=insulated%20tumbler%2024oz",
          photo: "",
          notes: "For long SSG general assemblies and council meetings"
        },
        {
          title: "Muji 0.38mm Gel Pens (Black & Dark Blue Pack)",
          priority: "love",
          price: "₱250",
          link: "https://www.lazada.com.ph/catalog/?q=muji+gel+pen+0.38",
          photo: "",
          notes: "Always running out of ink signing resolutions"
        },
        {
          title: "Desk Organizer / Wooden Pen Holder",
          priority: "surprise",
          price: "₱180",
          link: "",
          photo: "",
          notes: "Minimalist wood or matte style"
        }
      ],
      color: "Forest Green, Matte Black, Navy",
      size: "Unisex Large (Shirt)",
      dos: "Dark chocolate, iced americano, stationery, hardcover notebooks",
      donts: "No spicy snacks or strong citrus scents please",
      santaNote: "Merry Christmas Monito/Monita! Thank you for serving the student body with me this year. Anything thoughtful is appreciated!",
      updatedAt: "2026-11-18T14:00:00.000Z"
    },
    {
      id: "sample-ssg-2",
      name: "Cheska Villanueva",
      codename: "Matcha Elf",
      committee: "Secretariat",
      stamp: "🎄",
      pin: "",
      items: [
        {
          title: "Corduroy Canvas Tote Bag with Zipper (Cream or Olive)",
          priority: "top",
          price: "₱250 - ₱380",
          link: "https://shopee.ph/search?keyword=corduroy%20tote%20bag%20zipper",
          photo: "",
          notes: "Fits a 13-inch laptop and minutes binder"
        },
        {
          title: "Pastel Mildliner Highlighters Set",
          priority: "love",
          price: "₱320",
          link: "https://www.lazada.com.ph/catalog/?q=zebra+mildliner+pastel",
          photo: "",
          notes: "Soft/muted tones preferred"
        }
      ],
      color: "Sage Green, Cream, Warm Sand",
      size: "Women's Small / Unisex Small",
      dos: "Matcha treats, scented soy candles (vanilla/lavender), claw clips",
      donts: "Allergic to peanuts and tree nuts",
      santaNote: "Happy Holidays Secret Santa! Even a handwritten Christmas card + snacks would make me super happy.",
      updatedAt: "2026-11-18T14:30:00.000Z"
    },
    {
      id: "sample-ssg-3",
      name: "Miguel Santos",
      codename: "Santa's Auditor",
      committee: "Finance & Audit",
      stamp: "🎁",
      pin: "",
      items: [
        {
          title: "Anker / UGREEN Braided Type-C Fast Charging Cable (2m)",
          priority: "top",
          price: "₱250 - ₱350",
          link: "https://shopee.ph/search?keyword=ugreen%20usb%20c%20cable%20braided",
          photo: "",
          notes: "USB-C to USB-C, 60W or 100W"
        },
        {
          title: "Cozy Crew Socks (3-Pack Neutral Colors)",
          priority: "love",
          price: "₱220",
          link: "",
          photo: "",
          notes: "Size US 9-11 (Men's)"
        }
      ],
      color: "Charcoal, Beige, Burgundy",
      size: "Unisex Medium",
      dos: "Coffee drip bags, tech pouch, minimalist accessories",
      donts: "None! Open to surprises",
      santaNote: "May our SSG budget always balance and may your holidays be merry and bright!",
      updatedAt: "2026-11-18T15:00:00.000Z"
    }
  ];

  // Application State
  let cards = [];
  let selectedStamp = STAMPS[0];
  let currentStep = 1;
  let snowEnabled = true;
  let currentThemeIndex = 0;
  const THEMES = [
    { id: "pine", label: "Forest Pine", className: "" },
    { id: "corkboard", label: "Warm Cork", className: "theme-corkboard" }
  ];
  let backendUrl = "";
  let syncIntervalId = null;
  let isSyncingWrite = false;
  let lastWriteAt = 0;

  // DOM Elements
  const gridEl = document.getElementById("wishlist-grid");
  const searchInput = document.getElementById("search-input");
  const committeeFilter = document.getElementById("committee-filter");
  const sortSelect = document.getElementById("sort-select");
  const statsCountEl = document.getElementById("board-stats-count");

  const wishlistModal = document.getElementById("wishlist-modal");
  const wishlistForm = document.getElementById("wishlist-form");
  const wishItemsContainer = document.getElementById("wish-items-container");
  const stampPickerEl = document.getElementById("stamp-picker");
  const memberCommitteeSelect = document.getElementById("member-committee");

  const btnPrevStep = document.getElementById("btn-prev-step");
  const btnNextStep = document.getElementById("btn-next-step");
  const btnSaveWishlist = document.getElementById("btn-save-wishlist");

  const syncModal = document.getElementById("sync-modal");
  const syncStatusDot = document.getElementById("sync-status-dot");
  const syncStatusText = document.getElementById("sync-status-text");
  const backendUrlInput = document.getElementById("backend-url-input");

  const backupModal = document.getElementById("backup-modal");

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    applyConfigText();
    populateCommitteeDropdowns();
    renderStampPicker();
    initTheme();
    initSnowfall();

    const params = new URLSearchParams(window.location.search);
    const urlSyncParam = params.get("sync");
    if (urlSyncParam) {
      localStorage.setItem(STORAGE_KEY_BACKEND, urlSyncParam.trim());
    }

    backendUrl =
      (CFG.BACKEND_URL && CFG.BACKEND_URL.trim()) ||
      localStorage.getItem(STORAGE_KEY_BACKEND) ||
      "";

    loadLocalCards();
    renderBoard();

    if (backendUrl) {
      connectBackend(backendUrl, false);
    } else {
      updateSyncIndicator(false, "Cloud Sync");
    }

    bindEvents();
  }

  function applyConfigText() {
    if (CFG.orgName) {
      document.getElementById("org-badge-text").textContent = CFG.orgName.toUpperCase();
    }
    if (CFG.eventSubtitle) {
      document.getElementById("hero-subtitle-text").textContent = CFG.eventSubtitle;
    }
  }

  function populateCommitteeDropdowns() {
    const currentSelection = committeeFilter.value || "ALL";
    const rawCommittees = CFG.committees;
    const isGrouped = rawCommittees && !Array.isArray(rawCommittees) && typeof rawCommittees === "object";

    const knownPositions = new Set();
    committeeFilter.innerHTML = `<option value="ALL">All Committees / Positions</option>`;
    memberCommitteeSelect.innerHTML = `<option value="" disabled selected>Select your position...</option>`;

    function appendOptionToBoth(label, targetFilter, targetMember) {
      knownPositions.add(label);
      const opt1 = document.createElement("option");
      opt1.value = label;
      opt1.textContent = label;
      targetFilter.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = label;
      opt2.textContent = label;
      targetMember.appendChild(opt2);
    }

    if (isGrouped) {
      Object.entries(rawCommittees).forEach(([groupName, items]) => {
        if (!Array.isArray(items) || !items.length) return;
        const g1 = document.createElement("optgroup");
        g1.label = groupName;
        const g2 = document.createElement("optgroup");
        g2.label = groupName;

        items.forEach((pos) => appendOptionToBoth(pos, g1, g2));
        committeeFilter.appendChild(g1);
        memberCommitteeSelect.appendChild(g2);
      });
    } else if (Array.isArray(rawCommittees)) {
      rawCommittees.forEach((pos) => appendOptionToBoth(pos, committeeFilter, memberCommitteeSelect));
    }

    // Include any custom/legacy positions already saved on cards
    const extraPositions = cards
      .map((c) => (c.committee || "").trim())
      .filter((pos) => pos && !knownPositions.has(pos));
    if (extraPositions.length) {
      Array.from(new Set(extraPositions)).forEach((pos) => {
        appendOptionToBoth(pos, committeeFilter, memberCommitteeSelect);
      });
    }

    if (knownPositions.has(currentSelection)) {
      committeeFilter.value = currentSelection;
    }
  }

  function renderStampPicker() {
    stampPickerEl.innerHTML = "";
    STAMPS.forEach((emoji) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stamp-option" + (emoji === selectedStamp ? " selected" : "");
      btn.textContent = emoji;
      btn.addEventListener("click", () => {
        selectedStamp = emoji;
        Array.from(stampPickerEl.children).forEach((c) =>
          c.classList.toggle("selected", c.textContent === emoji)
        );
      });
      stampPickerEl.appendChild(btn);
    });
  }

  // ==========================================================================
  // DATA STORAGE & LIVE CLOUD SYNC
  // ==========================================================================
  function loadLocalCards() {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (raw) {
      try {
        cards = JSON.parse(raw);
        if (!Array.isArray(cards)) cards = [];
      } catch (e) {
        cards = [];
      }
    } else {
      cards = SAMPLE_CARDS.slice();
      saveLocalCards();
    }
  }

  function saveLocalCards() {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  }

  function isFirebaseUrl(url) {
    return /firebaseio\.com|firebasedatabase\.app/i.test(url);
  }

  function normalizeFirebaseBase(url) {
    return url.trim().replace(/\/+$/, "").replace(/\/wishlists\.json$/i, "");
  }

  function updateSyncIndicator(isOnline, message) {
    if (syncStatusDot) syncStatusDot.classList.toggle("online", isOnline);
    if (syncStatusText) syncStatusText.textContent = message;
  }

  async function connectBackend(url, notifyUser = true) {
    backendUrl = url.trim();
    if (!backendUrl) {
      updateSyncIndicator(false, "Cloud Sync");
      return;
    }

    localStorage.setItem(STORAGE_KEY_BACKEND, backendUrl);
    updateSyncIndicator(false, "Syncing...");

    try {
      await fetchFromBackend();
      const label = isFirebaseUrl(backendUrl)
        ? "Synced (Firebase)"
        : "Synced (Sheets)";
      updateSyncIndicator(true, label);
      if (notifyUser) showToast("☁️ Connected to live shared wishlist board!");

      if (syncIntervalId) clearInterval(syncIntervalId);
      syncIntervalId = setInterval(() => {
        fetchFromBackend(true);
      }, 12000);
    } catch (err) {
      console.error("Cloud sync error:", err);
      updateSyncIndicator(false, "Sync Error");
      if (notifyUser) {
        showToast("⚠️ Could not reach shared URL. Check your Firebase or Apps Script URL.");
      }
    }
  }

  function mergeRemoteCards(remoteCards) {
    const localMap = new Map(cards.map((c) => [c.id, c]));
    const now = Date.now();
    return remoteCards.map((rc) => {
      const lc = localMap.get(rc.id);
      if (lc && lc.updatedAt && rc.updatedAt) {
        const localTime = new Date(lc.updatedAt).getTime();
        const remoteTime = new Date(rc.updatedAt).getTime();
        if (localTime > remoteTime && now - localTime < 60000) {
          return lc;
        }
      }
      return rc;
    });
  }

  async function fetchFromBackend(isBackgroundPoll = false) {
    if (!backendUrl) return;
    if (isBackgroundPoll && (isSyncingWrite || Date.now() - lastWriteAt < 8000)) {
      return;
    }

    if (isFirebaseUrl(backendUrl)) {
      const endpoint = `${normalizeFirebaseBase(backendUrl)}/wishlists.json?_t=${Date.now()}`;
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const remoteCards = data && typeof data === "object"
        ? Object.values(data).filter((c) => c && c.id)
        : [];
      cards = mergeRemoteCards(remoteCards);
      saveLocalCards();
      populateCommitteeDropdowns();
      renderBoard();
    } else {
      const sep = backendUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${backendUrl}${sep}_t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.cards)) {
        cards = mergeRemoteCards(data.cards);
        saveLocalCards();
        populateCommitteeDropdowns();
        renderBoard();
      }
    }
  }

  async function pushCardToBackend(card) {
    if (!backendUrl) return;
    isSyncingWrite = true;
    lastWriteAt = Date.now();

    try {
      if (isFirebaseUrl(backendUrl)) {
        const endpoint = `${normalizeFirebaseBase(backendUrl)}/wishlists/${encodeURIComponent(card.id)}.json`;
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card)
        });
        if (!res.ok) throw new Error(`Firebase PUT failed: ${res.status}`);
      } else {
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "upsert", card })
        });
        if (!res.ok) throw new Error(`Sheets POST failed: ${res.status}`);
        const resData = await res.json();
        if (resData && resData.status === "error") {
          throw new Error(resData.message || "Google Sheets rejected the update");
        }
      }
    } catch (err) {
      console.error("Failed to push card to cloud:", err);
      showToast("⚠️ Cloud sync failed (if you uploaded large photos, try fewer/smaller photos).");
    } finally {
      isSyncingWrite = false;
      lastWriteAt = Date.now();
    }
  }

  async function deleteCardFromBackend(cardId) {
    if (!backendUrl) return;
    isSyncingWrite = true;
    lastWriteAt = Date.now();

    try {
      if (isFirebaseUrl(backendUrl)) {
        const endpoint = `${normalizeFirebaseBase(backendUrl)}/wishlists/${encodeURIComponent(cardId)}.json`;
        await fetch(endpoint, { method: "DELETE" });
      } else {
        await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "delete", id: cardId })
        });
      }
    } catch (err) {
      console.error("Failed to delete card from cloud:", err);
    } finally {
      isSyncingWrite = false;
      lastWriteAt = Date.now();
    }
  }

  // ==========================================================================
  // RENDERING THE BOARD (STRICT 3-COLOR CARD OUTPUT)
  // ==========================================================================
  function detectStoreLabel(url) {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes("shopee")) return "Shopee Link";
    if (lower.includes("lazada")) return "Lazada Link";
    if (lower.includes("tiktok")) return "TikTok Shop";
    if (lower.includes("shein")) return "SHEIN Link";
    if (lower.includes("amazon")) return "Amazon Link";
    return "Reference Link";
  }

  function getPriorityInfo(priority) {
    if (priority === "top") return { text: "Top Wish", className: "priority-top" };
    if (priority === "love") return { text: "Would Love", className: "priority-love" };
    return { text: "Option", className: "priority-surprise" };
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderBoard() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const committeeVal = committeeFilter.value;
    const sortVal = sortSelect.value;

    const filtered = cards.filter((c) => {
      if (committeeVal !== "ALL" && c.committee !== committeeVal) return false;
      if (!query) return true;

      const itemsText = (c.items || [])
        .map((i) => `${i.title || ""} ${i.notes || ""} ${i.price || ""}`)
        .join(" ");
      const haystack = `${c.name || ""} ${c.codename || ""} ${c.committee || ""} ${c.color || ""} ${c.size || ""} ${c.dos || ""} ${c.donts || ""} ${c.santaNote || ""} ${itemsText}`.toLowerCase();
      return haystack.includes(query);
    });

    filtered.sort((a, b) => {
      if (sortVal === "name") return (a.name || "").localeCompare(b.name || "");
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    const isBoardEmpty = cards.length === 0 && !query && committeeVal === "ALL";
    const cardsToRender = isBoardEmpty
      ? [{ ...SAMPLE_CARDS[0], isExample: true }]
      : filtered;

    statsCountEl.textContent = isBoardEmpty
      ? "0 Wishlists (Showing Example)"
      : `${filtered.length} ${filtered.length === 1 ? "Wishlist" : "Wishlists"}`;

    if (cardsToRender.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎄</div>
          <h3>No Wishlists Found</h3>
          <p>Try clearing your search or filter, or pin a new wishlist card.</p>
          <button type="button" class="btn-primary" id="btn-empty-add">📌 Pin My Wishlist</button>
        </div>
      `;
      const emptyBtn = document.getElementById("btn-empty-add");
      if (emptyBtn) emptyBtn.addEventListener("click", () => openWishlistModal());
      return;
    }

    gridEl.innerHTML = "";
    cardsToRender.forEach((card) => {
      const cardEl = document.createElement("article");
      cardEl.className = "wish-card";
      cardEl.dataset.id = card.id;

      const displayName = escapeHtml(card.name);
      const displaySub = "";

      const itemsHtml = (card.items || [])
        .map((item) => {
          const prio = getPriorityInfo(item.priority);
          const storeLabel = detectStoreLabel(item.link);
          const photoHtml = item.photo
            ? `<img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.title)}" class="wish-item-thumb" loading="lazy" onclick="window.open(this.src, '_blank')" title="Click to view full photo" />`
            : "";

          const linkHtml =
            item.link && storeLabel
              ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="store-link-pill">${storeLabel} &nearr;</a>`
              : "";
          const priceHtml = item.price
            ? `<span class="price-tag-pill">${escapeHtml(item.price)}</span>`
            : "";

          return `
            <div class="wish-item">
              ${photoHtml}
              <div class="wish-item-body">
                <div class="wish-item-top">
                  <div class="wish-item-title">${escapeHtml(item.title)}</div>
                  <span class="priority-badge ${prio.className}">${prio.text}</span>
                </div>
                ${item.notes ? `<div class="wish-item-notes">${escapeHtml(item.notes)}</div>` : ""}
                ${
                  linkHtml || priceHtml
                    ? `<div class="wish-item-links">${priceHtml}${linkHtml}</div>`
                    : ""
                }
              </div>
            </div>
          `;
        })
        .join("");

      const hasPrefs = card.color || card.size || card.dos || card.donts;
      const prefsHtml = hasPrefs
        ? `
          <div class="prefs-box">
            ${
              card.color || card.size
                ? `<div class="prefs-pills-row">
                    ${card.color ? `<span class="pref-pill">Color: ${escapeHtml(card.color)}</span>` : ""}
                    ${card.size ? `<span class="pref-pill">Size: ${escapeHtml(card.size)}</span>` : ""}
                  </div>`
                : ""
            }
            ${
              card.dos
                ? `<div class="pref-line"><strong>Likes / Do's:</strong> ${escapeHtml(card.dos)}</div>`
                : ""
            }
            ${
              card.donts
                ? `<div class="pref-dont"><strong>Avoid / Allergies:</strong> ${escapeHtml(card.donts)}</div>`
                : ""
            }
          </div>
        `
        : "";

      const noteHtml = card.santaNote
        ? `<div class="santa-note">“${escapeHtml(card.santaNote)}”</div>`
        : "";

      const dateFormatted = card.updatedAt
        ? new Date(card.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "Pinned";

      cardEl.innerHTML = `
        <div class="card-pin" aria-hidden="true">&bull;</div>
        <div class="card-header">
          <div class="member-identity">
            <span class="committee-tag">${escapeHtml(card.committee || "SSG Member")}</span>
            <h3 class="member-name">${displayName}</h3>
            ${displaySub}
          </div>
          <div class="card-stamp" title="Holiday Stamp">${escapeHtml(card.stamp || "🎄")}</div>
        </div>

        <div>
          <div class="wishes-section-title">
            Wishlist Items (${(card.items || []).length})
          </div>
          <div class="wish-items-list">
            ${itemsHtml}
          </div>
        </div>

        ${prefsHtml}
        ${noteHtml}

        <div class="card-footer">
          <span>${card.isExample ? "Example Guide Card" : `Updated ${dateFormatted}`}</span>
          <div class="card-action-btns">
            <button type="button" class="card-icon-btn btn-download-card" title="Download card as PNG sticker">Save</button>
            ${
              card.isExample
                ? `<button type="button" class="card-icon-btn btn-pin-example">Pin Yours</button>`
                : `<button type="button" class="card-icon-btn btn-edit-card">Edit</button>
                   <button type="button" class="card-icon-btn btn-delete-card">Remove</button>`
            }
          </div>
        </div>
      `;

      cardEl.querySelector(".btn-download-card").addEventListener("click", () => handleDownloadCardImage(cardEl, card));
      if (card.isExample) {
        cardEl.querySelector(".btn-pin-example").addEventListener("click", () => openWishlistModal());
      } else {
        cardEl.querySelector(".btn-edit-card").addEventListener("click", () => handleEditCard(card.id));
        cardEl.querySelector(".btn-delete-card").addEventListener("click", () => handleDeleteCard(card.id));
      }

      gridEl.appendChild(cardEl);
    });
  }

  // ==========================================================================
  // ORGANIZED 3-STEP "PIN MY WISHLIST" MODAL
  // ==========================================================================
  function setModalStep(stepNum) {
    currentStep = stepNum;

    document.querySelectorAll(".stepper-tab").forEach((tab) => {
      tab.classList.toggle("active", Number(tab.dataset.step) === stepNum);
    });

    document.querySelectorAll(".form-step-panel").forEach((panel) => {
      panel.classList.toggle("active", Number(panel.dataset.stepPanel) === stepNum);
    });

    btnPrevStep.style.display = stepNum > 1 ? "inline-block" : "none";

    if (stepNum === 1) {
      btnNextStep.style.display = "inline-block";
      btnNextStep.textContent = "Next: Wishlist Items \u2192";
      btnSaveWishlist.style.display = "none";
    } else if (stepNum === 2) {
      btnNextStep.style.display = "inline-block";
      btnNextStep.textContent = "Next: Sizes & Note \u2192";
      btnSaveWishlist.style.display = "none";
    } else {
      btnNextStep.style.display = "none";
      btnSaveWishlist.style.display = "inline-block";
    }
  }

  function validateStep(stepNum) {
    if (stepNum === 1) {
      const nameVal = document.getElementById("member-name").value.trim();
      if (!nameVal) {
        showToast("Please enter your Full Name or Nickname first.");
        document.getElementById("member-name").focus();
        return false;
      }
      const committeeVal = document.getElementById("member-committee").value.trim();
      if (!committeeVal) {
        showToast("Please select your Committee or Position.");
        document.getElementById("member-committee").focus();
        return false;
      }
    }
    if (stepNum === 2) {
      const titles = Array.from(wishItemsContainer.querySelectorAll(".item-title-input"))
        .map((inp) => inp.value.trim())
        .filter(Boolean);
      if (titles.length === 0) {
        showToast("Please enter at least 1 wishlist item name.");
        const firstInput = wishItemsContainer.querySelector(".item-title-input");
        if (firstInput) firstInput.focus();
        return false;
      }
    }
    return true;
  }

  function createWishItemRow(itemData = {}, index = 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "wish-entry-card";

    wrapper.innerHTML = `
      <div class="wish-entry-header">
        <span class="wish-entry-number">Wish Item #${index + 1}</span>
        <button type="button" class="remove-wish-btn">Remove</button>
      </div>

      <div class="wish-item-main-row">
        <div class="form-field">
          <label>Item Name / Gift Idea *</label>
          <input type="text" class="item-title-input" required placeholder="e.g., Insulated Tumbler, Tote Bag, Pens" value="${escapeHtml(itemData.title || "")}" />
        </div>
        <div class="form-field">
          <label>Priority</label>
          <select class="item-priority-input">
            <option value="top" ${itemData.priority === "top" ? "selected" : ""}>Top Wish</option>
            <option value="love" ${itemData.priority === "love" ? "selected" : ""}>Would Love</option>
            <option value="surprise" ${itemData.priority === "surprise" ? "selected" : ""}>Option</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label>Store Link <span class="optional">(Shopee / Lazada / etc.)</span></label>
          <input type="url" class="item-link-input" placeholder="https://shopee.ph/..." value="${escapeHtml(itemData.link || "")}" />
        </div>
        <div class="form-field">
          <label>Est. Price / Budget <span class="optional">(Optional)</span></label>
          <input type="text" class="item-price-input" placeholder="e.g., ₱250 - ₱350" value="${escapeHtml(itemData.price || "")}" />
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-field">
          <label>Variation / Notes <span class="optional">(Optional)</span></label>
          <input type="text" class="item-notes-input" placeholder="e.g., Color: Cream, Size M" value="${escapeHtml(itemData.notes || "")}" />
        </div>
        <div class="form-field">
          <label>Photo <span class="optional">(Link or Upload)</span></label>
          <div class="photo-upload-row">
            <input type="text" class="item-photo-input" placeholder="Image link or upload &rarr;" value="${escapeHtml(itemData.photo || "")}" style="flex:1;" />
            <label class="photo-upload-label" title="Upload screenshot or photo">
              📷 Upload
              <input type="file" class="item-photo-file" accept="image/*" style="display:none;" />
            </label>
          </div>
        </div>
      </div>
    `;

    const fileInput = wrapper.querySelector(".item-photo-file");
    const photoUrlInput = wrapper.querySelector(".item-photo-input");
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      compressImageFile(file, (dataUrl) => {
        photoUrlInput.value = dataUrl;
        showToast("📷 Photo attached!");
      });
    });

    wrapper.querySelector(".remove-wish-btn").addEventListener("click", () => {
      if (wishItemsContainer.children.length <= 1) {
        showToast("Keep at least 1 wishlist item on your card.");
        return;
      }
      wrapper.remove();
      renumberWishRows();
    });

    return wrapper;
  }

  function renumberWishRows() {
    Array.from(wishItemsContainer.children).forEach((row, idx) => {
      const label = row.querySelector(".wish-entry-number");
      if (label) label.textContent = `Wish Item #${idx + 1}`;
    });
  }

  function compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 180;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else if (h >= w && h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function openWishlistModal(cardToEdit = null) {
    wishlistForm.reset();
    wishItemsContainer.innerHTML = "";

    if (cardToEdit) {
      document.getElementById("modal-form-title").textContent = "Edit Your Holiday Wishlist";
      document.getElementById("card-id").value = cardToEdit.id;
      document.getElementById("member-name").value = cardToEdit.name || "";
      document.getElementById("member-committee").value = cardToEdit.committee || "";
      document.getElementById("member-pin").value = cardToEdit.pin || "";
      document.getElementById("pref-color").value = cardToEdit.color || "";
      document.getElementById("pref-size").value = cardToEdit.size || "";
      document.getElementById("pref-dos").value = cardToEdit.dos || "";
      document.getElementById("pref-donts").value = cardToEdit.donts || "";
      document.getElementById("santa-note").value = cardToEdit.santaNote || "";

      selectedStamp = cardToEdit.stamp || STAMPS[0];
      renderStampPicker();

      const items = Array.isArray(cardToEdit.items) && cardToEdit.items.length
        ? cardToEdit.items
        : [{}];
      items.forEach((it, idx) => {
        wishItemsContainer.appendChild(createWishItemRow(it, idx));
      });
    } else {
      document.getElementById("modal-form-title").textContent = "Pin Your Holiday Wishlist";
      document.getElementById("card-id").value = "";
      selectedStamp = STAMPS[Math.floor(Math.random() * STAMPS.length)];
      renderStampPicker();
      wishItemsContainer.appendChild(createWishItemRow({ priority: "top" }, 0));
    }

    setModalStep(1);
    wishlistModal.classList.add("open");
  }

  function closeWishlistModal() {
    wishlistModal.classList.remove("open");
  }

  function verifyCardPin(card) {
    if (!card.pin) return true;
    const entered = window.prompt(
      `Enter the 4-digit Edit PIN for ${card.name}'s card (or SSG Admin Passcode):`
    );
    if (entered === null) return false;
    const adminPin = CFG.ADMIN_PIN || "SSG2026";
    if (entered.trim() === card.pin || entered.trim() === adminPin) {
      return true;
    }
    showToast("Incorrect PIN.");
    return false;
  }

  function handleEditCard(cardId) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    if (!verifyCardPin(card)) return;
    openWishlistModal(card);
  }

  async function handleDeleteCard(cardId) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    if (!verifyCardPin(card)) return;

    const ok = window.confirm(`Remove ${card.name}'s wishlist card from the board?`);
    if (!ok) return;

    cards = cards.filter((c) => c.id !== cardId);
    saveLocalCards();
    renderBoard();
    await deleteCardFromBackend(cardId);
    showToast("Wishlist card removed.");
  }

  async function handleDownloadCardImage(cardEl, card) {
    if (typeof window.html2canvas !== "function") {
      showToast("Image exporter is still loading, please try again.");
      return;
    }

    const btn = cardEl.querySelector(".btn-download-card");
    const originalText = btn ? btn.textContent : "Save";
    if (btn) {
      btn.textContent = "Saving...";
      btn.disabled = true;
    }

    try {
      const canvas = await window.html2canvas(cardEl, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        y: -16,
        x: -6,
        width: cardEl.offsetWidth + 12,
        height: cardEl.offsetHeight + 22,
        ignoreElements: (el) => el.classList && el.classList.contains("card-action-btns")
      });

      const safeName = (card.name || "ssg-wishlist")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const link = document.createElement("a");
      link.download = `ssg-wishlist-${safeName || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Saved card as PNG sticker!");
    } catch (err) {
      console.error("Failed to export card image:", err);
      showToast("Could not export card image.");
    } finally {
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  }

  // ==========================================================================
  // THEME & SNOWFALL ANIMATION
  // ==========================================================================
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) {
      const idx = THEMES.findIndex((t) => t.id === saved);
      if (idx >= 0) currentThemeIndex = idx;
    }
    applyTheme();
  }

  function applyTheme() {
    const theme = THEMES[currentThemeIndex];
    document.body.classList.remove("theme-corkboard");
    if (theme.className) document.body.classList.add(theme.className);
    document.getElementById("current-theme-label").textContent = theme.label;
    localStorage.setItem(STORAGE_KEY_THEME, theme.id);
  }

  function initSnowfall() {
    const canvas = document.getElementById("snow-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const flakes = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.8,
      d: Math.random() * 0.5 + 0.25,
      drift: Math.random() * 0.5 - 0.25
    }));

    function drawSnow() {
      ctx.clearRect(0, 0, width, height);
      if (snowEnabled) {
        ctx.fillStyle = "rgba(244, 239, 226, 0.55)";
        ctx.beginPath();
        for (const f of flakes) {
          ctx.moveTo(f.x, f.y);
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
          f.y += f.d;
          f.x += f.drift;
          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }
          if (f.x > width) f.x = 0;
          if (f.x < 0) f.x = width;
        }
        ctx.fill();
      }
      requestAnimationFrame(drawSnow);
    }
    drawSnow();
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================
  function bindEvents() {
    document.getElementById("btn-add-wishlist").addEventListener("click", () => openWishlistModal());
    document.getElementById("btn-close-wishlist-modal").addEventListener("click", closeWishlistModal);
    document.getElementById("btn-cancel-wishlist").addEventListener("click", closeWishlistModal);

    // Stepper tab clicks
    document.querySelectorAll(".stepper-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetStep = Number(tab.dataset.step);
        if (targetStep > currentStep && !validateStep(currentStep)) return;
        setModalStep(targetStep);
      });
    });

    btnPrevStep.addEventListener("click", () => {
      if (currentStep > 1) setModalStep(currentStep - 1);
    });

    btnNextStep.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < 3) setModalStep(currentStep + 1);
    });

    // Add Wish Item Row
    document.getElementById("btn-add-wish-row").addEventListener("click", () => {
      if (wishItemsContainer.children.length >= 5) {
        showToast("Maximum of 5 wishlist items per card.");
        return;
      }
      wishItemsContainer.appendChild(
        createWishItemRow({ priority: "love" }, wishItemsContainer.children.length)
      );
    });

    // Submit Wishlist Card
    wishlistForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateStep(1)) {
        setModalStep(1);
        return;
      }
      if (!validateStep(2)) {
        setModalStep(2);
        return;
      }

      const existingId = document.getElementById("card-id").value;
      const itemRows = Array.from(wishItemsContainer.children);
      const items = itemRows
        .map((row) => ({
          title: row.querySelector(".item-title-input").value.trim(),
          priority: row.querySelector(".item-priority-input").value,
          link: row.querySelector(".item-link-input").value.trim(),
          price: row.querySelector(".item-price-input").value.trim(),
          notes: row.querySelector(".item-notes-input").value.trim(),
          photo: row.querySelector(".item-photo-input").value.trim()
        }))
        .filter((it) => it.title);

      const cardObj = {
        id: existingId || "ssg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        name: document.getElementById("member-name").value.trim(),
        committee: document.getElementById("member-committee").value.trim(),
        pin: document.getElementById("member-pin").value.trim(),
        stamp: selectedStamp,
        items,
        color: document.getElementById("pref-color").value.trim(),
        size: document.getElementById("pref-size").value.trim(),
        dos: document.getElementById("pref-dos").value.trim(),
        donts: document.getElementById("pref-donts").value.trim(),
        santaNote: document.getElementById("santa-note").value.trim(),
        updatedAt: new Date().toISOString()
      };

      const existingIdx = cards.findIndex((c) => c.id === cardObj.id);
      if (existingIdx >= 0) {
        cards[existingIdx] = cardObj;
      } else {
        cards.unshift(cardObj);
      }

      saveLocalCards();
      populateCommitteeDropdowns();
      renderBoard();
      closeWishlistModal();
      showToast("Your wishlist card is pinned to the board!");

      await pushCardToBackend(cardObj);
    });

    // Search & Filter
    searchInput.addEventListener("input", renderBoard);
    committeeFilter.addEventListener("change", renderBoard);
    sortSelect.addEventListener("change", renderBoard);

    // Random Spotlight
    document.getElementById("btn-random-pick").addEventListener("click", () => {
      const cardEls = Array.from(gridEl.querySelectorAll(".wish-card"));
      if (!cardEls.length) return;
      const pick = cardEls[Math.floor(Math.random() * cardEls.length)];
      pick.scrollIntoView({ behavior: "smooth", block: "center" });
      pick.style.outline = "3px solid #8C332A";
      setTimeout(() => {
        pick.style.outline = "none";
      }, 2400);
      showToast("Spotlighted a random SSG wishlist!");
    });

    // Theme Cycle
    document.getElementById("btn-theme-cycle").addEventListener("click", () => {
      currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
      applyTheme();
    });

    // Snow Toggle
    const snowBtn = document.getElementById("btn-toggle-snow");
    snowBtn.addEventListener("click", () => {
      snowEnabled = !snowEnabled;
      snowBtn.classList.toggle("active", snowEnabled);
    });

    // Cloud Sync Modal
    const openSyncBtn = document.getElementById("btn-open-sync");
    if (openSyncBtn) {
      openSyncBtn.addEventListener("click", () => {
        backendUrlInput.value = backendUrl;
        syncModal.classList.add("open");
      });
    }
    document.getElementById("btn-close-sync-modal").addEventListener("click", () => {
      syncModal.classList.remove("open");
    });
    document.getElementById("btn-done-sync-modal").addEventListener("click", () => {
      syncModal.classList.remove("open");
    });

    document.getElementById("btn-save-sync-url").addEventListener("click", async () => {
      const val = backendUrlInput.value.trim();
      if (!val) {
        showToast("Please paste a Firebase RTDB or Google Apps Script URL.");
        return;
      }
      await connectBackend(val, true);
    });

    document.getElementById("btn-disconnect-sync").addEventListener("click", () => {
      backendUrl = "";
      backendUrlInput.value = "";
      localStorage.removeItem(STORAGE_KEY_BACKEND);
      if (syncIntervalId) clearInterval(syncIntervalId);
      updateSyncIndicator(false, "Cloud Sync");
      showToast("Disconnected from cloud database.");
    });

    function copyShareableBoardLink() {
      const urlObj = new URL(window.location.href);
      const activeSync = backendUrlInput.value.trim() || backendUrl;
      if (activeSync) {
        urlObj.searchParams.set("sync", activeSync);
      }
      navigator.clipboard
        .writeText(urlObj.toString())
        .then(() => {
          showToast("Shareable board link copied to clipboard!");
        })
        .catch(() => {
          window.prompt("Copy this link to share with your SSG:", urlObj.toString());
        });
    }

    document.getElementById("btn-copy-magic-link").addEventListener("click", copyShareableBoardLink);
    document.getElementById("btn-share-board").addEventListener("click", copyShareableBoardLink);

    document.querySelectorAll(".sync-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".sync-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.dataset.tab;
        document.getElementById("sync-guide-firebase").style.display =
          tab === "firebase" ? "flex" : "none";
        document.getElementById("sync-guide-gsheets").style.display =
          tab === "gsheets" ? "flex" : "none";
      });
    });

    // Backup / Import JSON Modal
    document.getElementById("btn-export-json").addEventListener("click", () => {
      backupModal.classList.add("open");
    });
    document.getElementById("btn-close-backup-modal").addEventListener("click", () => {
      backupModal.classList.remove("open");
    });

    document.getElementById("btn-download-json").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ssg-wishlists-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showToast("Downloaded JSON backup!");
    });

    document.getElementById("import-json-file").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!Array.isArray(imported)) throw new Error("Invalid format");
          const map = new Map(cards.map((c) => [c.id, c]));
          for (const item of imported) {
            if (item && item.id && item.name) {
              map.set(item.id, item);
              if (backendUrl) await pushCardToBackend(item);
            }
          }
          cards = Array.from(map.values());
          saveLocalCards();
          renderBoard();
          backupModal.classList.remove("open");
          showToast(`Imported ${imported.length} wishlist cards!`);
        } catch (err) {
          showToast("Invalid JSON backup file.");
        }
      };
      reader.readAsText(file);
    });

    document.getElementById("btn-load-samples").addEventListener("click", async () => {
      const map = new Map(cards.map((c) => [c.id, c]));
      for (const sample of SAMPLE_CARDS) {
        map.set(sample.id, sample);
        if (backendUrl) await pushCardToBackend(sample);
      }
      cards = Array.from(map.values());
      saveLocalCards();
      populateCommitteeDropdowns();
      renderBoard();
      backupModal.classList.remove("open");
      showToast("Sample SSG wishlist cards loaded!");
    });
  }

  function showToast(message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  document.addEventListener("DOMContentLoaded", init);
})();

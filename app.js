/* ===========================================
   Green Chilli — Menu App
   =========================================== */

(() => {
  let menuData = [];
  let activeCategory = '';
  let searchQuery = '';

  // ---- Category filters ----
  const CATEGORY_ORDER = {
    'Menu': ['Starter Indian', 'Veg Starters', 'Non Veg Starters', 'Kabab Veg', 'Kabab Non Veg', 'Main Course: Paneer Special', 'Main Course: Mushroom & Cashew', 'Main Course: Vegetable Delights', 'Main Course: Indian Non-Veg', 'Mutton', 'Chinese Rice', 'Indian Rice', 'Naan Roti', 'Salad/Papad', 'Drinks'],
    'Snacks': ['Soup', 'Chowmein', 'Rolls'],
  };

  // ---- Utility: tag → CSS class ----
  const tagClass = (tag) => ({
    'Bestseller': 'tag-bestseller',
    'Spicy': 'tag-spicy',
    'Must Try': 'tag-must-try',
    "Chef's Pick": 'tag-chefs-pick',
    'Seasonal': 'tag-seasonal',
    'Signature': 'tag-signature',
  }[tag] || '');

  // ---- Build category nav buttons ----
  function buildCategoryNav(data) {
    const nav = document.getElementById('categoryNav');

    // Gather all unique categories in order
    const allCategories = [
      ...CATEGORY_ORDER['Menu'],
      ...CATEGORY_ORDER['Snacks'],
    ].filter(cat => data.some(i => i.category === cat));

    if (!activeCategory || activeCategory === 'All') {
      activeCategory = allCategories[0] || '';
    }

    const buttons = allCategories;

    nav.innerHTML = buttons.map(cat => {
      const isSnacksCat = CATEGORY_ORDER['Snacks'].includes(cat);
      return `
      <button class="cat-btn ${cat === activeCategory ? 'active' : ''} ${isSnacksCat ? 'snacks-cat' : ''}"
              data-cat="${cat}"
              aria-label="Filter by ${cat}">
        ${cat}
      </button>`;
    }).join('');

    // Add "Snacks" group label separator in nav
    const snacksFirstBtn = nav.querySelector(`.cat-btn[data-cat="${CATEGORY_ORDER['Snacks'][0]}"]`);
    if (snacksFirstBtn) {
      const sep = document.createElement('span');
      sep.className = 'nav-separator';
      sep.textContent = '·';
      nav.insertBefore(sep, snacksFirstBtn);
    }

    nav.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        renderMenu();
        nav.querySelectorAll('.cat-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.cat === activeCategory)
        );
        if (activeCategory !== 'All') {
          const id = `section-${activeCategory.replace(/[\s&]/g, '-')}`;
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---- Render a single card ----
  function renderCard(item, delay) {
    const vegClass = item.veg ? 'veg' : 'non-veg';
    const tagHtml = item.tag
      ? `<span class="card-tag ${tagClass(item.tag)}">${item.tag}</span>`
      : '';

    return `
    <article class="menu-card" style="animation-delay:${delay}ms" role="listitem">
      <div class="card-body">
        <div class="card-top">
          <h3 class="card-name">${item.name}</h3>
          <div class="veg-indicator ${vegClass}" title="${item.veg ? 'Vegetarian' : 'Non-Vegetarian'}"></div>
        </div>
        <p class="card-desc">${item.description}</p>
        <div class="card-footer">
          <div class="card-price"><span>₹</span>${item.price.toFixed(2)}</div>
          ${tagHtml}
        </div>
      </div>
    </article>`;
  }

  // ---- Emoji map for categories ----
  const catEmoji = {
    'Starter Indian': '🧆',
    'Veg Starters': '🥦',
    'Non Veg Starters': '🍗',
    'Kabab Veg': '🍢',
    'Kabab Non Veg': '🍢',
    'Salad/Papad': '🥗',
    'Main Course: Paneer Special': '🧀',
    'Main Course: Mushroom & Cashew': '🍄',
    'Main Course: Vegetable Delights': '🥦',
    'Main Course: Indian Non-Veg': '🍗',
    'Mutton': '🥩',
    'Chinese Rice': '🍚',
    'Indian Rice': '🍛',
    'Naan Roti': '🫓',
    'Drinks': '🥤',
    'Soup': '🍲',
    'Chowmein': '🍜',
    'Rolls': '🌯',
  };

  // ---- Render a category section ----
  function renderSection(category, items, isSnacksSection) {
    const sectionId = `section-${category.replace(/[\s&]/g, '-')}`;
    const emoji = catEmoji[category] || '🍽️';
    const cardsHtml = items.map((item, i) => renderCard(item, i * 55)).join('');
    const extraClass = isSnacksSection ? 'snacks-subsection' : '';

    return `
    <section id="${sectionId}" class="menu-section ${extraClass}" aria-label="${category} menu">
      <div class="section-heading">
        <h2>${emoji} ${category}</h2>
        <div class="section-line"></div>
        <span class="section-count">${items.length} items</span>
      </div>
      <div class="menu-grid" role="list">
        ${cardsHtml}
      </div>
    </section>`;
  }

  // ---- Render the full Snacks group block ----
  function renderSnacksGroup(grouped) {
    const innerHtml = CATEGORY_ORDER['Snacks']
      .filter(cat => grouped[cat])
      .map(cat => renderSection(cat, grouped[cat], true))
      .join('');

    if (!innerHtml) return '';

    return `
    <div class="group-block snacks-group" id="group-snacks">
      <div class="group-header">
        <div class="group-header-line"></div>
        <div class="group-title">
          <span class="group-icon">🍟</span>
          <h2 class="group-name">Snacks</h2>
        </div>
        <div class="group-header-line"></div>
      </div>
      ${innerHtml}
    </div>`;
  }

  // ---- Main render ----
  function renderMenu() {
    const container = document.getElementById('menuContainer');
    const emptyState = document.getElementById('emptyState');

    // Filter
    const lowerQuery = searchQuery.toLowerCase();
    let filtered = menuData.filter(item => {
      const nameMatch = item.name ? item.name.toLowerCase().includes(lowerQuery) : false;
      const descMatch = item.description ? item.description.toLowerCase().includes(lowerQuery) : false;
      const matchSearch = nameMatch || descMatch;

      // If there is a search query, show from all categories, else filter by active category
      const matchCat = searchQuery ? true : (activeCategory === 'All' ? true : item.category === activeCategory);
      return matchSearch && matchCat;
    });

    if (!filtered.length) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    // Group by category
    const grouped = filtered.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});

    // Check if we're showing snacks only or all
    const showingSnacksOnly = !searchQuery && CATEGORY_ORDER['Snacks'].includes(activeCategory);
    const showingMenuOnly = !searchQuery && CATEGORY_ORDER['Menu'].includes(activeCategory);

    let html = '';

    // ---- Render Menu group ----
    if (!showingSnacksOnly) {
      html += CATEGORY_ORDER['Menu']
        .filter(cat => grouped[cat])
        .map(cat => renderSection(cat, grouped[cat], false))
        .join('');
    }

    // ---- Render Snacks group ----
    const hasSnacksItems = CATEGORY_ORDER['Snacks'].some(cat => grouped[cat]);
    if (hasSnacksItems && !showingMenuOnly) {
      html += renderSnacksGroup(grouped);
    }

    container.innerHTML = html;
  }

  // ---- Fetch & init ----
  async function init() {
    try {
      const res = await fetch('./menuData.json');
      const raw = await res.text();
      // Strip JS-style comments from JSON (// ...) so we can parse it
      const clean = raw.replace(/\/\/.*$/gm, '');
      menuData = JSON.parse(clean);
      buildCategoryNav(menuData);
      renderMenu();
    } catch (err) {
      document.getElementById('menuContainer').innerHTML =
        `<p style="text-align:center;color:#ef4444;padding:40px;">
         ⚠️ Could not load menu data. Ensure menuData.json is in the same folder.
       </p>`;
      console.error('Failed to load menuData.json:', err);
    }
  }

  // ---- Search ----
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    if (searchQuery) {
      document.querySelectorAll('.cat-btn').forEach(b =>
        b.classList.remove('active')
      );
    } else {
      document.querySelectorAll('.cat-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === activeCategory)
      );
    }
    renderMenu();
  });

  // ---- Scroll to top ----
  const scrollBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---- Theme Toggle ----
  const themeToggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark as requested previously
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  init();

})();

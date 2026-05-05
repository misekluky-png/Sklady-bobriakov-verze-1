const app = document.getElementById('app');

const state = {
  page: 'home',
  category: null,
  productId: null,
  reviews: loadReviews(),
  sellMessage: '',
  showContact: false,
  sellImageData: null,
  interested: loadInterested(),
  searchQuery: '',
  sortBy: 'newest',
  filterPriceMin: 0,
  filterPriceMax: 10000,
};

const categories = [
  { id: 'auta', name: 'Auta', image: 'images/category-auta.svg' },
  { id: 'plysaci', name: 'Plyšáci', image: 'images/category-plysaci.svg' },
  { id: 'lego', name: 'LEGO', image: 'images/category-lego.svg' },
  { id: '3d-tisk', name: '3D tisk na zakázku', image: 'images/category-3d-tisk.svg' },
  { id: 'pokemon', name: 'Pokémoni', image: 'images/category-pokemon.svg' },
];

const products = loadProducts();

function loadProducts() {
  const saved = localStorage.getItem('bobriakovProducts');
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(item => ({
      ...item,
      id: item.id || generateId(),
    }));
  } catch {
    return [];
  }
}
    return [...defaultProds];
  }
}

function generateId() {
  return `prod-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function saveProducts() {
  localStorage.setItem('bobriakovProducts', JSON.stringify(products));
}

function loadReviews() {
  const saved = localStorage.getItem('bobriakovReviews');
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReviews() {
  localStorage.setItem('bobriakovReviews', JSON.stringify(state.reviews));
}

function loadInterested() {
  const saved = localStorage.getItem('bobriakovInterested');
  if (!saved) {
    return [];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveInterested() {
  localStorage.setItem('bobriakovInterested', JSON.stringify(state.interested));
}

function render() {
  if (state.page === 'home') {
    renderHome();
  } else if (state.page === 'buy') {
    renderBuy();
  } else if (state.page === 'category') {
    renderCategory(state.category);
  } else if (state.page === 'product-detail') {
    renderProductDetail(state.productId);
  } else if (state.page === 'sell') {
    renderSell();
  } else if (state.page === 'reviews') {
    renderReviews();
  } else if (state.page === 'interested') {
    renderInterested();
  }
}

function renderHome() {
  app.innerHTML = `
    <main class="home-screen">
      <button class="button-card home-side" data-action="sell">Chci prodat</button>
      <div class="home-center">
        <h1 class="home-title">Sklady Bobriakov</h1>
        <p class="home-subtitle">Online bazar pro použité věci, hračky a 3D tisk.</p>
        <div class="home-actions">
          <button class="action-button" data-action="interested">Mám zájem (${state.interested.length})</button>
        </div>
      </div>
      <button class="button-card home-side" data-action="buy">Chci koupit</button>
    </main>
    <footer>
      <button class="link-button" data-action="reviews">Kontaktovat</button>
    </footer>
  `;
  attachListeners();
}

function renderBuy() {
  app.innerHTML = `
    <header>
    </header>
    <h2>Chci koupit</h2>
    <button class="back-button" data-action="home">← Zpět</button>
    <section class="search-filters">
      <div class="search-bar">
        <input type="text" id="search-input" placeholder="Hledat produkty..." value="${state.searchQuery}" />
        <button id="search-button">🔍</button>
      </div>
      <div class="filters">
        <select id="sort-select">
          <option value="newest" ${state.sortBy === 'newest' ? 'selected' : ''}>Nejnovější</option>
          <option value="oldest" ${state.sortBy === 'oldest' ? 'selected' : ''}>Nejstarší</option>
          <option value="price-low" ${state.sortBy === 'price-low' ? 'selected' : ''}>Cena: nízká-vysoká</option>
          <option value="price-high" ${state.sortBy === 'price-high' ? 'selected' : ''}>Cena: vysoká-nízká</option>
        </select>
        <input type="number" id="price-min" placeholder="Cena od" value="${state.filterPriceMin || ''}" min="0" />
        <input type="number" id="price-max" placeholder="Cena do" value="${state.filterPriceMax || ''}" min="0" />
        <button id="filter-button">Filtrovat</button>
      </div>
    </section>
    <section class="cards">${categories.map(cat => `
      <button class="card" data-action="category" data-id="${cat.id}">
        <img src="${cat.image}" alt="${cat.name}" />
        <div class="card-title">${cat.name}</div>
      </button>
    `).join('')}</section>
    <footer>
      <button class="link-button" data-action="reviews">Kontaktovat</button>
    </footer>
  `;
  attachListeners();
  document.getElementById('search-button').addEventListener('click', handleSearch);
  document.getElementById('filter-button').addEventListener('click', handleFilter);
}

function renderCategory(categoryId) {
  const category = categories.find(cat => cat.id === categoryId);
  const productsForCategory = products.map((product, idx) => ({ product, idx })).filter(item => item.product.category === categoryId);
  const filteredProducts = filterAndSortProducts(productsForCategory);

  app.innerHTML = `
    <header>
    </header>
    <h2>${category?.name || 'Kategorie'}</h2>
    <button class="back-button" data-action="buy">← Zpět</button>
    <section class="cards">${filteredProducts.length ? filteredProducts.map(({ product, idx }) => `
      <article class="card ${product.owner === 'me' ? 'own-product' : ''}" data-product-idx="${idx}">
        <img src="${product.image}" alt="${product.title}" />
        <div class="card-title">${product.title}</div>
        <p class="card-text">${product.description}</p>
        <div class="card-footer">
          <div class="badge">Stav: ${product.condition}</div>
          <div class="price">${product.price || 0} Kč</div>
        </div>
        <div class="card-actions">
          <button class="action-btn interest-btn ${state.interested.includes(product.id) ? 'active' : ''}" data-action="toggle-interest" data-product-id="${product.id}">Mám zájem</button>
        </div>
        ${product.owner === 'me' ? '<p class="delete-hint">Klikni pravým tlačítkem pro smazání své nabídky.</p>' : ''}
      </article>
    `).join('') : `
      <article class="card">
        <div class="card-title">Žádné produkty</div>
        <p class="card-text">V této kategorii ještě není žádná nabídka. Přidej svůj produkt ve stránce Chci prodat.</p>
      </article>
    `}</section>
    <footer>
      <button class="link-button" data-action="reviews">Kontaktovat</button>
    </footer>
  `;
  attachListeners();
  
  app.querySelectorAll('.card:not(.own-product)').forEach(card => {
    const dataIdx = card.dataset.productIdx;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      state.productId = parseInt(dataIdx);
      state.page = 'product-detail';
      render();
    });
  });
}

function renderProductDetail(productIdx) {
  const product = products[productIdx];
  if (!product) {
    state.page = 'category';
    render();
    return;
  }

  app.innerHTML = `
    <header>
    </header>
    <button class="back-button" data-action="category">← Zpět</button>
    <h2>${product.title}</h2>
    <section class="product-detail">
      <img src="${product.image}" alt="${product.title}" class="detail-image" />
      <div class="detail-info">
        <h3>${product.title}</h3>
        <p class="detail-description">${product.description}</p>
        <div class="detail-meta">
          <span class="badge">Stav: ${product.condition}</span>
          <span class="price-large">${product.price || 0} Kč</span>
        </div>
        <div class="detail-actions">
          <button class="action-btn interest-btn ${state.interested.includes(product.id) ? 'active' : ''}" data-action="toggle-interest" data-product-id="${product.id}">Mám zájem</button>
        </div>
        <button id="interested-btn" class="button-card" style="margin-top: 20px;">Zobrazit kontakt</button>
        ${state.showContact ? `<div class="contact-info"><strong>Kontakt:</strong> ${product.contact || 'Není zadáno'}</div>` : ''}
      </div>
    </section>
    <footer>
      <button class="link-button" data-action="reviews">Kontaktovat</button>
    </footer>
  `;
  attachListeners();
  
  document.getElementById('interested-btn').addEventListener('click', () => {
    state.showContact = true;
    renderProductDetail(productIdx);
  });
}

function renderSell() {
  app.innerHTML = `
    <header>
    </header>
    <h2>Chci prodat</h2>
    <button class="back-button" data-action="home">← Zpět</button>
    <section class="review-form">
      <p class="card-text">Vyplň nabídku svého produktu a nahraj jeho obrázek ze svého zařízení.</p>
      <label for="sell-title">Název produktu</label>
      <input id="sell-title" placeholder="Např. Retro auto" />
      <label for="sell-category">Kategorie</label>
      <select id="sell-category">${categories.map(cat => `
        <option value="${cat.id}">${cat.name}</option>
      `).join('')}</select>
      <label for="sell-price">Cena (Kč)</label>
      <input id="sell-price" type="number" placeholder="Např. 150" min="0" />
      <label for="sell-contact">Telefonní číslo nebo email</label>
      <input id="sell-contact" placeholder="Např. +420 777 123 456 nebo tvuj@email.com" />
      <label for="sell-image-file">Obrázek produktu</label>
      <input id="sell-image-file" type="file" accept="image/*" />
      <div class="image-preview" id="sell-image-preview">${state.sellImageData ? `<img src="${state.sellImageData}" alt="Náhled obrázku" />` : '<div class="preview-empty">Žádný obrázek</div>'}</div>
      <label for="sell-description">Popis</label>
      <textarea id="sell-description" rows="4" placeholder="Přidej krátký popis produktu"></textarea>
      <label for="sell-condition">Stav</label>
      <input id="sell-condition" placeholder="Např. Jako nové" />
      <button id="submit-sell">Přidat nabídku</button>
      ${state.sellMessage ? `<div class="success-banner">${state.sellMessage}</div>` : ''}
    </section>
    <footer>
      <button class="link-button" data-action="reviews">Kontaktovat</button>
    </footer>
  `;
  attachListeners();
  const fileInput = document.getElementById('sell-image-file');
  if (fileInput) {
    fileInput.addEventListener('change', handleSellImageChange);
  }
  updateSellPreview();
  document.getElementById('submit-sell').addEventListener('click', handleSellSubmit);
}

function renderReviews() {
  app.innerHTML = `
    <header>
    </header>
    <h2>Recenze</h2>
    <button class="back-button" data-action="home">← Zpět</button>
      <p class="card-text">Přidej veřejnou recenzi a napiš nám, jak se ti líbí náš bazar.</p>
      <label for="review-author">Tvé jméno</label>
      <input id="review-author" placeholder="Jméno" />
      <label for="review-text">Hodnocení</label>
      <textarea id="review-text" rows="5" placeholder="Napiš svou veřejnou recenzi..."></textarea>
      <button id="submit-review">Napsat recenzi</button>
    </section>
    <section class="review-list">
      <h3>Veřejné recenze</h3>
      ${state.reviews.length ? state.reviews.map(review => `
        <article class="review-item">
          <div class="review-author">${review.author}</div>
          <p class="review-text">${review.text}</p>
        </article>
      `).join('') : '<p class="card-text">Zatím žádné recenze. Buď první!</p>'}
    </section>
  `;
  attachListeners();
  document.getElementById('submit-review').addEventListener('click', handleReviewSubmit);
}

function renderInterested() {
  const interestedProducts = products.filter(product => state.interested.includes(product.id));
  
  app.innerHTML = `
    <header>
    </header>
    <h2>Mám zájem (${interestedProducts.length})</h2>
    <button class="back-button" data-action="home">← Zpět</button>
    <section class="cards">${interestedProducts.length ? interestedProducts.map((product, idx) => `
      <article class="card" data-product-idx="${idx}">
        <img src="${product.image}" alt="${product.title}" />
        <div class="card-title">${product.title}</div>
        <p class="card-text">${product.description}</p>
        <div class="card-footer">
          <div class="badge">Stav: ${product.condition}</div>
          <div class="price">${product.price || 0} Kč</div>
        </div>
        <div class="card-actions">
          <button class="action-btn interest-btn active" data-action="toggle-interest" data-product-id="${product.id}">Mám zájem</button>
        </div>
      </article>
    `).join('') : `
      <article class="card">
        <div class="card-title">Žádné produkty se zájmem</div>
        <p class="card-text">Označ produkty kliknutím na "Mám zájem".</p>
      </article>
    `}</section>
    <footer>
      <button class="link-button" data-action="reviews">Kontaktovat</button>
    </footer>
  `;
  attachListeners();
  
  app.querySelectorAll('.card').forEach(card => {
    const dataIdx = card.dataset.productIdx;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      state.productId = parseInt(dataIdx);
      state.page = 'product-detail';
      render();
    });
  });
}

function attachListeners() {
  app.querySelectorAll('[data-action]').forEach(element => {
    element.addEventListener('click', event => {
      const action = event.currentTarget.dataset.action;
      const id = event.currentTarget.dataset.id;
      const productId = event.currentTarget.dataset.productId;
      
      if (action === 'toggle-favorite' && productId) {
        event.stopPropagation();
        toggleFavorite(productId);
      } else if (action === 'toggle-interest' && productId) {
        event.stopPropagation();
        toggleInterest(productId);
      } else {
        navigate(action, id);
      }
    });
  });

  app.querySelectorAll('.card[data-product-idx]').forEach(card => {
    card.addEventListener('contextmenu', event => {
      event.preventDefault();
      const productIdx = parseInt(card.dataset.productIdx);
      const product = products[productIdx];
      if (!product || product.owner !== 'me') {
        return;
      }
      const confirmed = confirm('Chceš tento produkt smazat?');
      if (!confirmed) {
        return;
      }
      products.splice(productIdx, 1);
      saveProducts();
      renderCategory(state.category);
    });
  });
}

function navigate(action, id) {
  if (action === 'home') {
    state.page = 'home';
    state.showContact = false;
  } else if (action === 'buy') {
    state.page = 'buy';
    state.showContact = false;
  } else if (action === 'sell') {
    state.page = 'sell';
    state.showContact = false;
  } else if (action === 'reviews') {
    state.page = 'reviews';
    state.showContact = false;
  } else if (action === 'interested') {
    state.page = 'interested';
    state.showContact = false;
  } else if (action === 'category' && id) {
    state.page = 'category';
    state.category = id;
    state.showContact = false;
  }
  render();
}
    state.page = 'sell';
    state.showContact = false;
  } else if (action === 'reviews') {
    state.page = 'reviews';
    state.showContact = false;
  } else if (action === 'category' && id) {
    state.page = 'category';
    state.category = id;
    state.showContact = false;
  }
  render();
}

function handleReviewSubmit() {
  const authorInput = document.getElementById('review-author');
  const textInput = document.getElementById('review-text');
  const author = authorInput.value.trim() || 'Anonym';
  const text = textInput.value.trim();
  if (!text) {
    alert('Napiš prosím recenzi.');
    return;
  }
  state.reviews.unshift({ author, text });
  saveReviews();
  authorInput.value = '';
  textInput.value = '';
  renderReviews();
}

function handleSellImageChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    state.sellImageData = null;
    updateSellPreview();
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.sellImageData = reader.result;
    updateSellPreview();
  };
  reader.readAsDataURL(file);
}

function updateSellPreview() {
  const preview = document.getElementById('sell-image-preview');
  if (!preview) return;
  preview.innerHTML = state.sellImageData
    ? `<img src="${state.sellImageData}" alt="Náhled obrázku" />`
    : '<div class="preview-empty">Žádný obrázek</div>';
}

function handleSellSubmit() {
  const title = document.getElementById('sell-title').value.trim();
  const category = document.getElementById('sell-category').value;
  const price = parseFloat(document.getElementById('sell-price').value) || 0;
  const contact = document.getElementById('sell-contact').value.trim();
  const description = document.getElementById('sell-description').value.trim();
  const condition = document.getElementById('sell-condition').value.trim();
  const image = state.sellImageData;

  if (!title || !description || !condition) {
    alert('Vyplň prosím název, popis a stav produktu.');
    return;
  }

  if (!contact) {
    alert('Vyplň prosím telefonní číslo nebo email.');
    return;
  }

  products.unshift({
    id: generateId(),
    owner: 'me',
    category,
    title,
    description,
    condition,
    price,
    contact,
    image: image || 'images/product-placeholder.svg',
  });
  saveProducts();
  state.category = category;
  state.page = 'category';
  state.showContact = false;
  state.sellImageData = null;
  render();
}

function handleSearch() {
  const query = document.getElementById('search-input').value.trim();
  state.searchQuery = query;
  render();
}

function handleFilter() {
  const sortBy = document.getElementById('sort-select').value;
  const priceMin = parseFloat(document.getElementById('price-min').value) || 0;
  const priceMax = parseFloat(document.getElementById('price-max').value) || 10000;
  
  state.sortBy = sortBy;
  state.filterPriceMin = priceMin;
  state.filterPriceMax = priceMax;
  render();
}

function filterAndSortProducts(productsList) {
  let filtered = productsList.filter(({ product }) => {
    const matchesSearch = !state.searchQuery || 
      product.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    const matchesPrice = product.price >= state.filterPriceMin && product.price <= state.filterPriceMax;
    
    return matchesSearch && matchesPrice;
  });
  
  filtered.sort((a, b) => {
    switch (state.sortBy) {
      case 'oldest':
        return a.product.id.localeCompare(b.product.id);
      case 'price-low':
        return a.product.price - b.product.price;
      case 'price-high':
        return b.product.price - a.product.price;
      case 'newest':
      default:
        return b.product.id.localeCompare(a.product.id);
    }
  });
  
  return filtered;
}

function toggleInterest(productId) {
  if (state.interested.includes(productId)) {
    state.interested = state.interested.filter(id => id !== productId);
  } else {
    state.interested.push(productId);
  }
  saveInterested();
  render();
}

render();

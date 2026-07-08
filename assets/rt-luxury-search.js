class LuxurySearch {
  constructor() {
    this.overlay = document.getElementById('rt-luxury-search-overlay');
    if (!this.overlay) return;

    this.input = this.overlay.querySelector('.rt-search-input');
    this.closeBtn = this.overlay.querySelector('.rt-search-close');
    this.form = this.overlay.querySelector('form');
    
    // Containers
    this.emptyState = this.overlay.querySelector('.rt-search-empty-state');
    this.resultsState = this.overlay.querySelector('.rt-search-results-state');
    
    // Recent Searches
    this.recentSearchesContainer = this.overlay.querySelector('.rt-recent-searches-list');
    this.clearAllBtn = this.overlay.querySelector('.rt-search-clear-all');
    this.recentSearches = JSON.parse(localStorage.getItem('rt-recent-searches')) || [];
    
    // Suggest API
    this.debounceTimer = null;
    this.apiUrl = '/search/suggest.json';
    
    this.bindEvents();
    this.renderRecentSearches();
  }

  bindEvents() {
    // Open triggers (any element with data-luxury-search-trigger)
    document.querySelectorAll('[data-luxury-search-trigger]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close trigger
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('is-active')) {
        this.close();
      }
    });

    // Input handling with debounce
    this.input.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      const query = this.input.value.trim();
      
      if (query.length === 0) {
        this.showEmptyState();
        return;
      }
      
      this.debounceTimer = setTimeout(() => {
        this.fetchResults(query);
      }, 300);
    });

    // Form submit (Save recent search)
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.input.value.trim();
      if (query) this.saveRecentSearch(query);
    });

    // Clear all recent searches
    if (this.clearAllBtn) {
      this.clearAllBtn.addEventListener('click', () => {
        this.recentSearches = [];
        this.saveToStorage();
        this.renderRecentSearches();
      });
    }

    // Click outside to close (Optional, since background blur is heavy, might be nice)
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  open() {
    this.overlay.classList.add('is-active');
    document.body.classList.add('rt-search-active');
    
    // Small timeout to allow display transition before focus
    setTimeout(() => {
      this.input.focus();
    }, 100);
  }

  close() {
    this.overlay.classList.remove('is-active');
    document.body.classList.remove('rt-search-active');
  }

  showEmptyState() {
    this.emptyState.classList.remove('rt-d-none');
    this.resultsState.classList.add('rt-d-none');
    this.renderRecentSearches();
  }

  showResultsState() {
    this.emptyState.classList.add('rt-d-none');
    this.resultsState.classList.remove('rt-d-none');
  }

  async fetchResults(query) {
    try {
      const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&resources[type]=product,collection,page,article&resources[limit]=4`;
      const response = await fetch(url);
      const data = await response.json();
      
      this.renderResults(data.resources.results, query);
    } catch (error) {
      console.error('LuxurySearch Fetch Error:', error);
    }
  }

  renderResults(results, query) {
    this.showResultsState();
    
    const productsContainer = this.resultsState.querySelector('.rt-results-products');
    const categoriesContainer = this.resultsState.querySelector('.rt-results-categories');
    const noResultsContainer = this.resultsState.querySelector('.rt-search-no-results');
    
    productsContainer.innerHTML = '';
    categoriesContainer.innerHTML = '';
    
    let hasResults = false;

    // Render Products
    if (results.products && results.products.length > 0) {
      hasResults = true;
      let html = `<h3 class="rt-search-section-title">Products</h3><div class="rt-search-grid">`;
      results.products.forEach(product => {
        const image = product.featured_image ? product.featured_image.url : '';
        const price = product.price || '';
        const comparePrice = product.compare_at_price ? `<del>${product.compare_at_price}</del>` : '';
        
        html += `
          <a href="${product.url}" class="rt-search-product-card" data-luxury-product>
            <img src="${image}" alt="${product.title}" class="rt-search-product-image" loading="lazy">
            <div class="rt-search-product-info">
              ${product.vendor ? `<span class="rt-search-product-vendor">${product.vendor}</span>` : ''}
              <h4 class="rt-search-product-title">${product.title}</h4>
              <div class="rt-search-product-price">${comparePrice} ${price}</div>
            </div>
          </a>
        `;
      });
      html += `</div>`;
      productsContainer.innerHTML = html;
    }

    // Render Collections, Pages, Articles
    let pagesHtml = '';
    
    if (results.collections && results.collections.length > 0) {
      hasResults = true;
      pagesHtml += `<h3 class="rt-search-section-title" style="margin-top: 40px;">Collections</h3><div class="rt-search-pages-list">`;
      results.collections.forEach(col => {
        pagesHtml += `<a href="${col.url}" class="rt-search-page-item"><span class="rt-search-page-title">${col.title}</span></a>`;
      });
      pagesHtml += `</div>`;
    }

    if (results.pages && results.pages.length > 0) {
      hasResults = true;
      pagesHtml += `<h3 class="rt-search-section-title" style="margin-top: 40px;">Pages</h3><div class="rt-search-pages-list">`;
      results.pages.forEach(page => {
        pagesHtml += `<a href="${page.url}" class="rt-search-page-item"><span class="rt-search-page-title">${page.title}</span></a>`;
      });
      pagesHtml += `</div>`;
    }
    
    if (results.articles && results.articles.length > 0) {
      hasResults = true;
      pagesHtml += `<h3 class="rt-search-section-title" style="margin-top: 40px;">Articles</h3><div class="rt-search-pages-list">`;
      results.articles.forEach(article => {
        pagesHtml += `<a href="${article.url}" class="rt-search-page-item"><span class="rt-search-page-title">${article.title}</span></a>`;
      });
      pagesHtml += `</div>`;
    }
    
    categoriesContainer.innerHTML = pagesHtml;

    // Handle No Results
    if (!hasResults) {
      productsContainer.innerHTML = '';
      categoriesContainer.innerHTML = '';
      noResultsContainer.classList.remove('rt-d-none');
    } else {
      noResultsContainer.classList.add('rt-d-none');
    }
    
    // Save search context for clicking products
    this.resultsState.querySelectorAll('[data-luxury-product]').forEach(card => {
      card.addEventListener('click', () => this.saveRecentSearch(query));
    });
  }

  saveRecentSearch(query) {
    if (!query) return;
    // Remove if exists to push to front
    this.recentSearches = this.recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
    this.recentSearches.unshift(query);
    // Keep max 8
    if (this.recentSearches.length > 8) this.recentSearches.pop();
    
    this.saveToStorage();
  }

  removeRecentSearch(query) {
    this.recentSearches = this.recentSearches.filter(q => q !== query);
    this.saveToStorage();
    this.renderRecentSearches();
  }

  saveToStorage() {
    localStorage.setItem('rt-recent-searches', JSON.stringify(this.recentSearches));
  }

  renderRecentSearches() {
    if (!this.recentSearchesContainer) return;
    
    if (this.recentSearches.length === 0) {
      this.recentSearchesContainer.innerHTML = '<span class="rt-search-muted" style="font-size: 13px;">No recent searches</span>';
      if(this.clearAllBtn) this.clearAllBtn.style.display = 'none';
      return;
    }
    
    if(this.clearAllBtn) this.clearAllBtn.style.display = 'inline-block';
    
    let html = '';
    this.recentSearches.forEach(query => {
      html += `
        <div class="rt-search-chip">
          <span class="rt-chip-text" style="cursor:pointer;" onclick="document.querySelector('.rt-search-input').value='${query}'; document.querySelector('.rt-search-input').dispatchEvent(new Event('input'));">${query}</span>
          <button type="button" class="rt-search-chip-remove" data-query="${query}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
    });
    
    this.recentSearchesContainer.innerHTML = html;
    
    this.recentSearchesContainer.querySelectorAll('.rt-search-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeRecentSearch(btn.getAttribute('data-query'));
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.LuxurySearchController = new LuxurySearch();
});

/**
 * RoyalTick - Premium Collections & Filters Controller
 * Controls live search card filtering and scroll-reveal entrance animations.
 */

(function () {
  const initCollections = () => {
    const container = document.querySelector('.rt-collections-container');
    if (!container) return;

    const enableAnimation = container.dataset.enableAnimation === 'true';

    // --- 1. Client-Side Instant Search Filtering ---
    const searchInput = document.getElementById('rt-collection-search-input');
    const productItems = container.querySelectorAll('.rt-product-grid__item');
    
    if (searchInput && productItems.length > 0) {
      searchInput.addEventListener('input', (e) => {
        const query = (e.target.value || '').toLowerCase().trim();
        
        productItems.forEach(item => {
          const title = (item.dataset.productTitle || '').toLowerCase();
          
          if (title.includes(query)) {
            item.style.display = '';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          } else {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
          }
        });
      });
    }

    // --- 2. Scroll Reveal Animations ---
    if (enableAnimation) {
      const animElements = container.querySelectorAll('.rt-collection-anim');
      
      const animObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rt-animate');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      animElements.forEach(el => animObserver.observe(el));
    } else {
      container.querySelectorAll('.rt-collection-anim').forEach(el => {
        el.classList.add('rt-animate');
      });
    }
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollections);
  } else {
    initCollections();
  }

  // Hook into Shopify Theme Editor reload/load events
  document.addEventListener('shopify:section:load', (e) => {
    const target = e.target;
    if (target instanceof Element && (target.classList.contains('rt-collections-section') || target.querySelector('.rt-collections-container'))) {
      initCollections();
    }
  });
})();

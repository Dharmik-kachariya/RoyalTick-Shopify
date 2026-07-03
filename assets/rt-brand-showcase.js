/**
 * RoyalTick - Brand Showcase & Trust Cards Controller
 * Manages card border hover glow tracking and viewport entry animations.
 */

(function () {
  const initBrandShowcase = () => {
    const section = document.querySelector('.rt-brand-showcase');
    if (!section) return;

    const enableAnimation = section.dataset.enableAnimation === 'true';

    // --- 1. Card Glow Movement Tracking ---
    const cards = section.querySelectorAll('.rt-brand-showcase__card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // --- 2. Viewport Scroll Reveal ---
    if (enableAnimation) {
      const animElements = section.querySelectorAll('.rt-brand-showcase-anim');
      
      const animObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rt-animate');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      animElements.forEach(el => animObserver.observe(el));
    } else {
      section.querySelectorAll('.rt-brand-showcase-anim').forEach(el => {
        el.classList.add('rt-animate');
      });
    }

    // --- 3. Logo Slider Seamless Looping check ---
    // If the window is wide and logos are few, we duplicate the logos to guarantee the loop doesn't break
    const tracks = section.querySelectorAll('.rt-brand-showcase__marquee-track');
    tracks.forEach(track => {
      const containerWidth = track.parentElement ? track.parentElement.clientWidth : window.innerWidth;
      const trackWidth = track.scrollWidth;
      
      // If the content is narrow, copy children once to ensure seamless scrolling
      if (trackWidth < containerWidth * 2) {
        const children = Array.from(track.children);
        children.forEach(child => {
          const clone = child.cloneNode(true);
          track.appendChild(clone);
        });
      }
    });
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandShowcase);
  } else {
    initBrandShowcase();
  }

  // Hook into Shopify Theme Editor reload/load events
  document.addEventListener('shopify:section:load', (e) => {
    const target = e.target;
    if (target instanceof Element && (target.classList.contains('rt-brand-showcase-section') || target.querySelector('.rt-brand-showcase'))) {
      initBrandShowcase();
    }
  });
})();

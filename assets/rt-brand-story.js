/**
 * RoyalTick - Brand Story Section Controller
 * Handles viewport animations and animated stats counters.
 */

(function () {
  const initBrandStory = () => {
    const section = document.querySelector('.rt-brand-story');
    if (!section) return;

    const enableAnimation = section.dataset.enableAnimation === 'true';

    // --- 1. Intersection Observer for Scroll Animations ---
    if (enableAnimation) {
      const animElements = section.querySelectorAll('.rt-brand-story-anim');
      
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
      // If animation is disabled, instantly show all elements
      section.querySelectorAll('.rt-brand-story-anim').forEach(el => {
        el.classList.add('rt-animate');
      });
    }

    // --- 2. Stats Counters Animation ---
    const counters = section.querySelectorAll('.rt-brand-story__counter-number');
    if (counters.length > 0) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const targetEl = entry.target;
            if (targetEl.dataset.animated === 'true') return;
            
            targetEl.dataset.animated = 'true';
            animateCounter(targetEl);
            observer.unobserve(targetEl);
          }
        });
      }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      counters.forEach(counter => counterObserver.observe(counter));
    }
  };

  /**
   * Animates a single counter element from 0 to its target number
   * @param {HTMLElement} el
   */
  const animateCounter = (el) => {
    const rawText = el.textContent || '';
    const numberMatch = rawText.match(/(\d+)/);
    if (!numberMatch) return;

    const targetNum = parseInt(numberMatch[0]);
    const prefix = rawText.split(numberMatch[0])[0] || '';
    const suffix = rawText.split(numberMatch[0])[1] || '';
    
    let startTimestamp = null;
    const duration = 1500; // Animation duration in ms

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * targetNum);
      
      el.textContent = `${prefix}${currentVal}${suffix}`;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = rawText; // Ensure exact final value is set
      }
    };

    window.requestAnimationFrame(step);
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandStory);
  } else {
    initBrandStory();
  }

  // Hook into Shopify Theme Editor reload/load events
  document.addEventListener('shopify:section:load', (e) => {
    const target = e.target;
    if (target instanceof Element && (target.classList.contains('rt-brand-story-section') || target.querySelector('.rt-brand-story'))) {
      initBrandStory();
    }
  });
})();

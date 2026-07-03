/**
 * RoyalTick - Featured Collections Scroll animations
 * Staggered animations using Intersection Observer.
 */

(function () {
  const initAnimations = () => {
    const animatedElements = document.querySelectorAll('.rt-fade-up');
    if (animatedElements.length === 0) return;

    const observerOptions = {
      root: null, // use viewport
      rootMargin: '0px 0px -80px 0px', // trigger slightly before entering view
      threshold: 0.15 // 15% visibility
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('rt-animate');
          // Unobserve once animation is applied
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      animationObserver.observe(element);
    });
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

  // Support Shopify Theme Editor re-renders
  document.addEventListener('shopify:section:load', (e) => {
    const target = e.target;
    if (target instanceof Element && (target.classList.contains('rt-featured-collections-section') || target.querySelector('.rt-featured-collections'))) {
      initAnimations();
    }
  });
})();

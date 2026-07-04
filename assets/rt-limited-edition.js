
(function () {
  let timerInterval = null;

  const initLimitedEdition = () => {
    const section = document.querySelector('.rt-limited-edition');
    if (!section) return;

    const enableAnimation = section.dataset.enableAnimation === 'true';

    // --- 1. Viewport Scroll Animations ---
    if (enableAnimation) {
      const animElements = section.querySelectorAll('.rt-limited-edition-anim');
      
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
      section.querySelectorAll('.rt-limited-edition-anim').forEach(el => {
        el.classList.add('rt-animate');
      });
    }

    // --- 2. Countdown Timer Controller ---
    const countdownWrapper = section.querySelector('.rt-limited-edition__countdown');
    const timerContainer = section.querySelector('.rt-limited-edition__timer');
    
    if (countdownWrapper && timerContainer) {
      const expiryString = timerContainer.dataset.expiry;
      if (!expiryString) {
        countdownWrapper.style.display = 'none';
        return;
      }

      const targetDate = new Date(expiryString).getTime();
      if (isNaN(targetDate)) {
        console.warn('RoyalTick: Invalid expiry date configured:', expiryString);
        countdownWrapper.style.display = 'none';
        return;
      }

      // Clear previous intervals if re-initializing
      if (timerInterval) clearInterval(timerInterval);

      const updateTimer = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
          clearInterval(timerInterval);
          countdownWrapper.style.display = 'none';
          return;
        }

        // Calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update DOM
        const dEl = timerContainer.querySelector('[data-days]');
        const hEl = timerContainer.querySelector('[data-hours]');
        const mEl = timerContainer.querySelector('[data-minutes]');
        const sEl = timerContainer.querySelector('[data-seconds]');

        if (dEl) dEl.textContent = String(days).padStart(2, '0');
        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
        if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
      };

      // Run immediately once
      updateTimer();
      // Tick every second
      timerInterval = setInterval(updateTimer, 1000);
    }
  };

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLimitedEdition);
  } else {
    initLimitedEdition();
  }

  // Hook into Shopify Theme Editor reload/load events
  document.addEventListener('shopify:section:load', (e) => {
    const target = e.target;
    if (target instanceof Element && (target.classList.contains('rt-limited-edition-section') || target.querySelector('.rt-limited-edition'))) {
      initLimitedEdition();
    }
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll reveal animations
  const revealElements = document.querySelectorAll('.rt-reveal, .rt-reveal-left, .rt-reveal-right, .rt-scale-zoom, .rt-timeline-item');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Statistics Counter Animation
  const statsSection = document.querySelector('.rt-stats');
  const counters = document.querySelectorAll('.rt-counter');
  
  if (statsSection && counters.length > 0) {
    let countTriggered = false;
    
    const countObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countTriggered) {
        countTriggered = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 2000; // 2 seconds duration
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target.toLocaleString() + (counter.getAttribute('data-suffix') || '');
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current).toLocaleString() + (counter.getAttribute('data-suffix') || '');
            }
          }, stepTime);
        });
      }
    }, { threshold: 0.5 });
    
    countObserver.observe(statsSection);
  }

  // Lightbox functionality for Masonry Gallery
  const galleryItems = document.querySelectorAll('.rt-gallery-item');
  const lightbox = document.querySelector('.rt-lightbox');
  const lightboxImg = document.querySelector('.rt-lightbox-img');
  const lightboxClose = document.querySelector('.rt-lightbox-close');

  if (galleryItems.length > 0 && lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const fullImgUrl = item.getAttribute('data-src');
        if (fullImgUrl) {
          lightboxImg.src = fullImgUrl;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

});

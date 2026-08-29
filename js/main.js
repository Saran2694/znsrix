/* ==========================================================================
   ZNSRIX — Modern Interactive Motion & UI/UX Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  removeLogoBackground();
  initLoader();
  initSideProgressBar();
  initCustomCursor();
  initNavbar();
  initMobileNav();
  initMagneticButtons();
  initSectionIndicators();
  initHeadlineReveals();
  initPinnedServicesScroll();
  initMobilePackageAccordion();
  initQuoteForm();
  initContactForm();
  initCareerForm();
  initPageTransitions();
  initServicesTabs();
  initGlassCardReveal();
});

/* Glass Card Scroll Reveal */
function initGlassCardReveal() {
  const cards = document.querySelectorAll('.glass-card');
  if (!cards.length) return;

  cards.forEach(card => card.classList.add('sr-hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.remove('sr-hidden');
          entry.target.classList.add('sr-visible');
          observer.unobserve(entry.target);
        }, i * 80);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
}

/* Global Voyager 3D Carousel Logic (Voyager2 & Glassmorphism reference layout) */
let voyagerCurrentIndex = 0;

function switchServiceTab(index) {
  // Fallback for custom link routing to active carousel index
  voyagerCurrentIndex = index;
  updateVoyagerCarousel();
}

function initServicesTabs() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  
  // Set up carousel controls listeners
  const prevBtn = document.getElementById('voyagerPrev');
  const nextBtn = document.getElementById('voyagerNext');
  const cards = document.querySelectorAll('.voyager-card');
  
  if (cards.length) {
    if (prevBtn) prevBtn.addEventListener('click', () => {
      voyagerCurrentIndex = (voyagerCurrentIndex - 1 + cards.length) % cards.length;
      updateVoyagerCarousel();
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      voyagerCurrentIndex = (voyagerCurrentIndex + 1) % cards.length;
      updateVoyagerCarousel();
    });

    // Touch support / Drag support for swipe actions
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselWrapper = document.querySelector('.voyager-carousel-wrapper');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      carouselWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) {
        voyagerCurrentIndex = (voyagerCurrentIndex + 1) % cards.length;
        updateVoyagerCarousel();
      }
      if (touchEndX > touchStartX + 50) {
        voyagerCurrentIndex = (voyagerCurrentIndex - 1 + cards.length) % cards.length;
        updateVoyagerCarousel();
      }
    }

    // Direct click selector for quick preview
    cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (idx !== voyagerCurrentIndex) {
          e.preventDefault();
          voyagerCurrentIndex = idx;
          updateVoyagerCarousel();
        }
      });
    });

    const serviceMap = {
      'web-development': 0,
      'software-development': 1,
      'ui-ux-design': 2,
      'mobile-app': 3,
      'e-commerce': 4,
      'ai-automation': 5,
      'maintenance': 6,
      'seo-optimization': 7
    };

    if (serviceParam && serviceMap[serviceParam] !== undefined) {
      voyagerCurrentIndex = serviceMap[serviceParam];
    }
    
    updateVoyagerCarousel();
  }
}

function updateVoyagerCarousel() {
  const cards = document.querySelectorAll('.voyager-card');
  if (!cards.length) return;

  cards.forEach((card, idx) => {
    card.className = 'voyager-card glass-ref-card'; // reset classes
    
    const diff = idx - voyagerCurrentIndex;
    const absDiff = Math.abs(diff);
    const totalCards = cards.length;

    // Correct wrap-around logic for circular list rendering
    let relativePosition = diff;
    if (diff > totalCards / 2) relativePosition -= totalCards;
    else if (diff < -totalCards / 2) relativePosition += totalCards;

    if (relativePosition === 0) {
      card.classList.add('active-slide');
    } else if (relativePosition === -1) {
      card.classList.add('prev-slide');
    } else if (relativePosition === 1) {
      card.classList.add('next-slide');
    } else if (relativePosition === -2) {
      card.classList.add('far-prev-slide');
    } else if (relativePosition === 2) {
      card.classList.add('far-next-slide');
    } else {
      card.classList.add('hidden-slide');
    }
  });
}

/* 0. Remove White Background from sri.png Logo */
function removeLogoBackground() {
  const logoImgs = document.querySelectorAll('.brand-logo-img');
  logoImgs.forEach(img => {
    const tempImg = new Image();
    tempImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = tempImg.naturalWidth;
      canvas.height = tempImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(tempImg, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 220 && g > 220 && b > 220) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      img.src = canvas.toDataURL('image/png');
      img.style.mixBlendMode = 'normal';
    };
    if (img.complete) {
      tempImg.src = img.src;
    } else {
      img.addEventListener('load', () => { tempImg.src = img.src; });
    }
  });
}

/* 1. Ultra-Fast Brand Loader */
function initLoader() {
  const loader = document.createElement('div');
  loader.className = 'znsrix-loader';
  loader.innerHTML = `
    <div class="loader-content">
      <div class="loader-logo">ZNSRIX<span class="dot"></span></div>
      <div class="loader-bar"><div class="loader-progress"></div></div>
    </div>
  `;
  document.body.appendChild(loader);

  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 400);
  }, 450);
}

/* 2. Side Scroll Progress Bar */
function initSideProgressBar() {
  const progressBar = document.createElement('div');
  progressBar.className = 'side-progress-bar';
  progressBar.innerHTML = '<div class="side-progress-fill"></div>';
  document.body.appendChild(progressBar);

  const fill = progressBar.querySelector('.side-progress-fill');

  window.addEventListener('scroll', () => {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    if (fill) fill.style.height = `${progress}%`;
  });
}

/* 3. Custom Interactive Cursor */
function initCustomCursor() {
  if (window.innerWidth <= 1024 || 'ontouchstart' in window) return;

  const cursorDot = document.createElement('div');
  const cursorRing = document.createElement('div');
  const cursorBadge = document.createElement('span');

  cursorDot.className = 'custom-cursor-dot';
  cursorRing.className = 'custom-cursor-ring';
  cursorBadge.className = 'cursor-badge';

  cursorRing.appendChild(cursorBadge);
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderRing);
  }
  renderRing();

  document.querySelectorAll('a, button, .card-dark, .package-card, .project-card, .job-card, .service-row').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hovered');
      if (el.classList.contains('project-card')) {
        cursorBadge.textContent = 'OPEN PROJECT';
        cursorRing.classList.add('has-badge');
      } else if (el.classList.contains('service-row')) {
        cursorBadge.textContent = 'EXPLORE';
        cursorRing.classList.add('has-badge');
      }
    });

    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hovered', 'has-badge');
      cursorBadge.textContent = '';
    });
  });
}

/* 4. Magnetic Buttons */
function initMagneticButtons() {
  if (window.innerWidth <= 1024 || 'ontouchstart' in window) return;

  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.22}px, ${y * 0.22}px, 0) scale(1.02)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
    });
  });
}

/* 5. Section Indicator Labels */
function initSectionIndicators() {
  const sections = document.querySelectorAll('.section, .hero-section');
  const sectionNames = ['HOME', 'ABOUT', 'SERVICES', 'PACKAGES', 'PROJECTS', 'CAREERS', 'CONTACT'];

  sections.forEach((sec, idx) => {
    if (!sec.querySelector('.section-number-tag')) {
      const tag = document.createElement('div');
      tag.className = 'section-number-tag';
      const num = String(idx + 1).padStart(2, '0');
      const name = sectionNames[idx] || 'ZNSRIX';
      tag.innerHTML = `<span class="num-orange">${num}</span> / ${name}`;
      sec.appendChild(tag);
    }
  });
}

/* 6. Sticky Navbar */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* 7. Mobile Drawer Nav */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !mobileNav) return;

  function toggleNav(forceClose = false) {
    if (forceClose) {
      hamburger.classList.remove('is-active');
      mobileNav.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      return;
    }
    hamburger.classList.toggle('is-active');
    mobileNav.classList.toggle('is-open');
    if (overlay) overlay.classList.toggle('is-open');
    document.body.style.overflow = mobileNav.classList.contains('is-open') ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleNav());
  if (overlay) overlay.addEventListener('click', () => toggleNav(true));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleNav(true);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      toggleNav(true);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && mobileNav.classList.contains('is-open')) {
      toggleNav(true);
    }
  });
}

/* 8. Clip-Path Headline Reveals */
function initHeadlineReveals() {
  const headings = document.querySelectorAll('.heading-xl, .heading-lg');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  headings.forEach(h => observer.observe(h));
}

/* 9. Pinned Services Scroll */
function initPinnedServicesScroll() {
  const pinnedSection = document.querySelector('.pinned-services-section');
  if (!pinnedSection || window.innerWidth <= 768) return;

  const cards = pinnedSection.querySelectorAll('.service-card-pinned');
  
  window.addEventListener('scroll', () => {
    const rect = pinnedSection.getBoundingClientRect();
    const sectionHeight = pinnedSection.offsetHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / (sectionHeight - window.innerHeight)));

    const activeIndex = Math.min(cards.length - 1, Math.floor(progress * cards.length));

    cards.forEach((card, idx) => {
      if (idx === activeIndex) {
        card.classList.add('active');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      } else if (idx < activeIndex) {
        card.classList.remove('active');
        card.style.opacity = '0.3';
        card.style.transform = 'translateY(-24px) scale(0.95)';
      } else {
        card.classList.remove('active');
        card.style.opacity = '0.3';
        card.style.transform = 'translateY(40px) scale(0.95)';
      }
    });
  });
}

/* 10. Mobile Package Accordion (No Pricing) */
function initMobilePackageAccordion() {
  const accordionHeaders = document.querySelectorAll('.mobile-package-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
}

/* 11. Quote Estimator Form (No Pricing Display) */
function initQuoteForm() {
  const quoteForm = document.getElementById('quoteForm');
  if (!quoteForm) return;

  const serviceSelect = document.getElementById('quoteService');
  const packageSelect = document.getElementById('quotePackage');
  const businessTypeSelect = document.getElementById('quoteBusinessType');
  
  const summaryService = document.getElementById('summaryService');
  const summaryBusiness = document.getElementById('summaryBusiness');
  const summaryPackage = document.getElementById('summaryPackage');

  function updateSummary() {
    if (summaryService && serviceSelect) {
      summaryService.textContent = serviceSelect.options[serviceSelect.selectedIndex]?.text || 'Not selected';
    }
    if (summaryBusiness && businessTypeSelect) {
      summaryBusiness.textContent = businessTypeSelect.options[businessTypeSelect.selectedIndex]?.text || 'Not selected';
    }
    if (summaryPackage && packageSelect) {
      summaryPackage.textContent = packageSelect.options[packageSelect.selectedIndex]?.text || 'Not selected';
    }
  }

  if (serviceSelect) serviceSelect.addEventListener('change', updateSummary);
  if (packageSelect) packageSelect.addEventListener('change', updateSummary);
  if (businessTypeSelect) businessTypeSelect.addEventListener('change', updateSummary);

  // Quote form change listeners remain active for summary updates.
}

/* 12. Contact Form Submission */
function initContactForm() {
  // Configured via HTML FormSubmit action
}

/* 13. Careers Form Submission */
function initCareerForm() {
  // Configured via HTML FormSubmit action
}

/* Page Transition Overlay */
function initPageTransitions() {
  const links = document.querySelectorAll('a[href^=""]:not([href^="#"]):not([target="_blank"])');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      e.preventDefault();
      const overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
}

/* Helper Toast Notification */
function showToast(message) {
  let toast = document.querySelector('.toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6500" stroke-width="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

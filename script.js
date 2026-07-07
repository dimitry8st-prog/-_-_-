document.addEventListener('DOMContentLoaded', () => {
  initBurgerMenu();
  initSmoothScroll();
  initHeaderScroll();
  initFadeIn();
  initReviewsSlider();
  initDiagramTooltips();
  initModal();
  initForms();
  initPromoTimer();
});

/* Burger menu */
function initBurgerMenu() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Smooth scroll for anchor links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.getElementById('header').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* Header shadow on scroll */
function initHeaderScroll() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* Fade-in on scroll */
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* Reviews slider */
function initReviewsSlider() {
  const track = document.getElementById('reviewsTrack');
  const cards = track.querySelectorAll('.review-card');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsContainer = document.getElementById('reviewsDots');

  if (!cards.length) return;

  let current = 0;
  let visibleCount = getVisibleCount();

  function getVisibleCount() {
    if (window.innerWidth >= 768) return Math.min(3, cards.length);
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - visibleCount);
  }

  function createDots() {
    dotsContainer.innerHTML = '';
    const total = getMaxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'reviews-slider__dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.reviews-slider__dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, getMaxIndex()));
    const cardWidth = cards[0].offsetWidth;
    const gap = window.innerWidth >= 768 ? 24 : 0;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      visibleCount = getVisibleCount();
      current = Math.min(current, getMaxIndex());
      createDots();
      goTo(current);
    }, 200);
  });

  createDots();
}

/* Diagram tooltips */
function initDiagramTooltips() {
  const points = document.querySelectorAll('.diagram-point');
  const tooltip = document.getElementById('diagramTooltip');

  points.forEach(point => {
    const show = () => {
      tooltip.textContent = point.dataset.tip;
      tooltip.classList.add('visible');
      points.forEach(p => p.classList.remove('active'));
      point.classList.add('active');
    };

    const hide = () => {
      tooltip.classList.remove('visible');
      point.classList.remove('active');
    };

    point.addEventListener('mouseenter', show);
    point.addEventListener('focus', show);
    point.addEventListener('mouseleave', hide);
    point.addEventListener('blur', hide);
  });
}

/* Modal */
function initModal() {
  const modal = document.getElementById('orderModal');

  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(modal));
  });

  modal.querySelectorAll('[data-modal-close]').forEach(el => {
    el.addEventListener('click', () => closeModal(modal));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal(modal);
  });
}

function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector('input');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

/* Forms */
function initForms() {
  const ctaForm = document.getElementById('ctaForm');
  const modalForm = document.getElementById('modalForm');

  ctaForm.addEventListener('submit', (e) => handleFormSubmit(e, ctaForm, 'ctaSuccess'));
  modalForm.addEventListener('submit', (e) => handleFormSubmit(e, modalForm, 'modalSuccess'));
}

function handleFormSubmit(e, form, successId) {
  e.preventDefault();
  const name = form.querySelector('[name="name"]');
  const phone = form.querySelector('[name="phone"]');

  if (!name.value.trim() || !phone.value.trim()) {
    if (!name.value.trim()) name.focus();
    else phone.focus();
    return;
  }

  form.hidden = true;
  document.getElementById(successId).hidden = false;

  setTimeout(() => {
    form.reset();
    form.hidden = false;
    document.getElementById(successId).hidden = true;
    const modal = document.getElementById('orderModal');
    if (!modal.hidden) closeModal(modal);
  }, 3000);
}

/* Promo countdown — 7 days from first visit */
function initPromoTimer() {
  const STORAGE_KEY = 'healthband_promo_end';
  let endTime = localStorage.getItem(STORAGE_KEY);

  if (!endTime) {
    endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, endTime);
  }

  const daysEl = document.getElementById('timerDays');
  const hoursEl = document.getElementById('timerHours');
  const minutesEl = document.getElementById('timerMinutes');
  const secondsEl = document.getElementById('timerSeconds');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const diff = Math.max(0, Number(endTime) - Date.now());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

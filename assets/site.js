const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  document.documentElement.classList.add('motion-ready');
}

requestAnimationFrame(() => {
  body.classList.add('is-ready');
});

document.querySelectorAll('[data-reveal-group]').forEach((group) => {
  [...group.querySelectorAll('[data-reveal]')].forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${index * 60}ms`);
  });
});

const revealItems = [...document.querySelectorAll('[data-reveal]')];

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const imageShells = document.querySelectorAll('.photo-card, .section-photo, .page-hero-photo, .contact-hero-photo, .advantage-photo');

imageShells.forEach((shell) => {
  const image = shell.querySelector('img');
  if (!image) return;
  const finishLoading = () => shell.classList.add('is-loaded');
  if (image.complete) finishLoading();
  else image.addEventListener('load', finishLoading, { once: true });
});

const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('.site-nav');

const closeMenu = () => {
  if (!menuButton || !nav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Меню';
  nav.classList.remove('is-open');
  body.classList.remove('is-locked');
};

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Закрыть' : 'Меню';
  nav?.classList.toggle('is-open', open);
  body.classList.toggle('is-locked', open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const privacyMarkup = `
  <div class="modal-backdrop" data-privacy-backdrop hidden>
    <section class="privacy-dialog" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <button class="privacy-dialog-close" type="button" data-privacy-close>Закрыть</button>
      <h2 id="privacy-title">Как прототип работает с данными</h2>
      <p>Это демонстрационный прототип. Он не содержит форм, аналитики, рекламных cookies и скрытой передачи персональных данных.</p>
      <ul>
        <li>Изображения, стили и скрипты загружаются локально вместе с сайтом.</li>
        <li>Кнопка записи открывает YCLIENTS только после осознанного нажатия пользователя.</li>
        <li>Перед запуском реального сайта потребуются реквизиты оператора и отдельные юридические документы клиента.</li>
        <li>Если появится форма, её обработку нужно разместить на российской инфраструктуре и добавить отдельное согласие.</li>
      </ul>
      <button class="button button-primary" type="button" data-privacy-close>Понятно</button>
    </section>
  </div>`;

body.insertAdjacentHTML('beforeend', privacyMarkup);

const backdrop = document.querySelector('[data-privacy-backdrop]');
const dialog = backdrop?.querySelector('.privacy-dialog');
let lastFocused = null;
let closeTimer = 0;

const openPrivacy = () => {
  if (!backdrop) return;
  window.clearTimeout(closeTimer);
  lastFocused = document.activeElement;
  backdrop.hidden = false;
  body.classList.add('is-locked');
  requestAnimationFrame(() => backdrop.classList.add('is-open'));
  backdrop.querySelector('[data-privacy-close]')?.focus();
};

const closePrivacy = () => {
  if (!backdrop || backdrop.hidden) return;
  backdrop.classList.remove('is-open');
  body.classList.remove('is-locked');

  if (reduceMotion) {
    backdrop.hidden = true;
  } else {
    closeTimer = window.setTimeout(() => {
      backdrop.hidden = true;
    }, 230);
  }

  lastFocused?.focus?.();
};

document.querySelectorAll('[data-privacy-open]').forEach((button) => {
  button.addEventListener('click', openPrivacy);
});

backdrop?.querySelectorAll('[data-privacy-close]').forEach((button) => {
  button.addEventListener('click', closePrivacy);
});

backdrop?.addEventListener('click', (event) => {
  if (event.target === backdrop) closePrivacy();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    closePrivacy();
  }

  if (event.key === 'Tab' && backdrop && !backdrop.hidden && dialog) {
    const focusable = [...dialog.querySelectorAll('button, a[href]')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});

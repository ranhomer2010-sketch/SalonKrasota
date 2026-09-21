const body = document.body;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduceMotion) {
  document.documentElement.classList.add('motion-ready');
}

requestAnimationFrame(() => {
  body.classList.add('is-ready');
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
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.14 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const heroStage = document.querySelector('[data-hero-stage]');
const heroImage = document.querySelector('[data-hero-image]');

if (heroStage && heroImage && finePointer && !reduceMotion) {
  let pointerFrame = 0;

  const updateHeroImage = (event) => {
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      const bounds = heroStage.getBoundingClientRect();
      const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 7;
      const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
      heroImage.classList.add('is-interactive');
      heroImage.style.transform = `translate3d(${horizontal}px, ${vertical}px, 0) scale(1.045)`;
      pointerFrame = 0;
    });
  };

  heroStage.addEventListener('pointermove', updateHeroImage);
  heroStage.addEventListener('pointerleave', () => {
    heroImage.classList.add('is-interactive');
    heroImage.style.transform = 'translate3d(0, 0, 0) scale(1.035)';
  });
}

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

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

const animatePanel = (panel) => {
  if (!panel || reduceMotion || !panel.animate) return;
  const rows = [...panel.querySelectorAll('.price-item')];
  rows.forEach((row, index) => {
    row.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      {
        duration: 320,
        delay: index * 38,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
        fill: 'both'
      }
    );
  });
};

const activateTab = (tab, focus = false) => {
  if (!tab) return;
  const panelId = tab.getAttribute('aria-controls');
  let activePanel = null;

  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });

  panels.forEach((panel) => {
    const selected = panel.id === panelId;
    panel.hidden = !selected;
    if (selected) activePanel = panel;
  });

  animatePanel(activePanel);
  if (focus) tab.focus();
};

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    activateTab(tabs[nextIndex], true);
  });
});

const privacyMarkup = `
  <div class="modal-backdrop" data-privacy-backdrop hidden>
    <section class="privacy-dialog" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
      <button class="privacy-dialog-close" type="button" data-privacy-close>Закрыть</button>
      <h2 id="privacy-title">Как сайт работает с данными</h2>
      <p>Это демонстрационный прототип. Он не содержит форм, не устанавливает аналитические или рекламные cookies и не сохраняет персональные данные посетителей.</p>
      <ul>
        <li>Кнопка «Записаться» открывает внешний сервис онлайн-записи YCLIENTS в новой вкладке.</li>
        <li>До перехода на YCLIENTS данные посетителя не передаются этому сервису.</li>
        <li>Перед запуском реального сайта сюда необходимо добавить реквизиты оператора и актуальные юридические документы клиента.</li>
      </ul>
      <button class="button button-primary" type="button" data-privacy-close>Понятно</button>
    </section>
  </div>`;

body.insertAdjacentHTML('beforeend', privacyMarkup);
const backdrop = document.querySelector('[data-privacy-backdrop]');
const dialog = backdrop?.querySelector('.privacy-dialog');
let lastFocused = null;

const openPrivacy = () => {
  if (!backdrop) return;
  lastFocused = document.activeElement;
  backdrop.hidden = false;
  body.classList.add('is-locked');

  if (!reduceMotion && backdrop.animate && dialog?.animate) {
    backdrop.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
    dialog.animate(
      [
        { opacity: 0, transform: 'scale(0.96)' },
        { opacity: 1, transform: 'scale(1)' }
      ],
      { duration: 250, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
  }

  backdrop.querySelector('[data-privacy-close]')?.focus();
};

const closePrivacy = () => {
  if (!backdrop) return;
  backdrop.hidden = true;
  body.classList.remove('is-locked');
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
    if (backdrop && !backdrop.hidden) closePrivacy();
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

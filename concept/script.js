(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const form = document.querySelector('[data-lead-form]');

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle?.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const setError = (field, message) => {
    field.classList.toggle('is-invalid', Boolean(message));
    const target = form?.querySelector(`[data-error-for="${field.name}"]`);
    if (target) target.textContent = message;
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const consentError = form.querySelector('[data-consent-error]');
    const name = form.elements.name;
    const contact = form.elements.contact;
    const consent = form.elements.consent;
    let valid = true;

    setError(name, '');
    setError(contact, '');
    consentError.textContent = '';
    status.textContent = '';
    status.classList.remove('is-error');

    if (name.value.trim().length < 2) {
      setError(name, 'Укажите имя');
      valid = false;
    }
    if (contact.value.trim().length < 5) {
      setError(contact, 'Укажите телефон или мессенджер');
      valid = false;
    }
    if (!consent.checked) {
      consentError.textContent = 'Нужно подтвердить согласие на обработку данных';
      valid = false;
    }

    if (!valid) {
      status.textContent = 'Проверьте обязательные поля.';
      status.classList.add('is-error');
      return;
    }

    status.textContent = 'Спасибо. Это демонстрационная версия формы — подключение отправки выполним перед запуском.';
    form.querySelector('.button-submit').disabled = true;
    window.setTimeout(() => {
      form.querySelector('.button-submit').disabled = false;
    }, 1400);
  });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();

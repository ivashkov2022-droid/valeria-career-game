(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const form = document.querySelector('[data-form]');

  const setHeaderState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767) closeMenu();
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
    }, { threshold: 0.1, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details[open]').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  document.querySelectorAll('[data-topic]').forEach((link) => {
    link.addEventListener('click', () => {
      const topic = link.getAttribute('data-topic');
      const topicInput = document.querySelector('[data-topic-input]');
      if (topic && topicInput) topicInput.value = topic;
    });
  });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const utmNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  utmNames.forEach((name) => {
    const field = form.elements.namedItem(name);
    if (!field) return;
    const current = params.get(name);
    if (current) {
      field.value = current;
      try { sessionStorage.setItem(name, current); } catch (_) { /* private mode */ }
    } else {
      try { field.value = sessionStorage.getItem(name) || ''; } catch (_) { field.value = ''; }
    }
  });

  const pageField = form.elements.namedItem('page_url');
  if (pageField) pageField.value = window.location.href;

  const showFieldError = (field, message) => {
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    const error = field.closest('label')?.querySelector('.field-error');
    if (error) error.textContent = message;
  };

  const validate = () => {
    let valid = true;
    const name = form.elements.namedItem('name');
    const phone = form.elements.namedItem('phone');
    const email = form.elements.namedItem('email');
    const consent = form.elements.namedItem('consent');

    const nameError = name.value.trim().length >= 2 ? '' : 'Укажите имя';
    const phoneError = phone.value.replace(/\D/g, '').length >= 10 ? '' : 'Проверьте номер телефона';
    const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'Проверьте email';

    showFieldError(name, nameError);
    showFieldError(phone, phoneError);
    showFieldError(email, emailError);
    valid = !nameError && !phoneError && !emailError;

    const consentError = form.querySelector('.consent-error');
    if (consentError) consentError.textContent = consent.checked ? '' : 'Необходимо согласие на обработку данных';
    if (!consent.checked) valid = false;

    return valid;
  };

  ['name', 'phone', 'email'].forEach((name) => {
    form.elements.namedItem(name)?.addEventListener('input', (event) => showFieldError(event.target, ''));
  });
  form.elements.namedItem('consent')?.addEventListener('change', () => {
    const consentError = form.querySelector('.consent-error');
    if (consentError) consentError.textContent = '';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const button = form.querySelector('button[type="submit"]');

    if (!validate()) {
      const firstInvalid = form.querySelector('.is-invalid');
      firstInvalid?.focus();
      if (status) {
        status.textContent = 'Проверьте обязательные поля.';
        status.classList.add('is-error');
      }
      return;
    }

    if (status) {
      status.textContent = 'Отправляем заявку…';
      status.classList.remove('is-error');
    }
    if (button) button.disabled = true;

    const isPreview = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.hostname.endsWith('.github.io');
    if (isPreview) {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      if (status) status.textContent = 'Демонстрация: форма заполнена корректно. На хостинге заявка будет отправлена Валерии.';
      if (button) button.disabled = false;
      return;
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'Не удалось отправить заявку');
      window.location.href = 'thank-you.html';
    } catch (error) {
      if (status) {
        status.textContent = error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.';
        status.classList.add('is-error');
      }
      if (button) button.disabled = false;
    }
  });
})();

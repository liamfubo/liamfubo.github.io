const loader = document.getElementById('page-loader');

function showLoader() {
  if (!loader) return;
  loader.classList.add('is-active');
  document.body.classList.add('is-loading');
}

function hideLoader() {
  if (!loader) return;
  loader.classList.remove('is-active');
  document.body.classList.remove('is-loading');
}

function getPageKey(pathname) {
  if (pathname.endsWith('about.html')) return 'about.html';
  if (pathname.endsWith('projects.html')) return 'projects.html';
  return 'index.html';
}

function updateActiveNav() {
  const nav = document.querySelector('.navlinks');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a'));
  const activeHref = getPageKey(window.location.pathname);
  links.forEach((a) => {
    if (a.getAttribute('href') === activeHref) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    } else {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
  });
  const indicator = nav.querySelector('.nav-indicator');
  if (!indicator) return;
  const active = nav.querySelector('a[aria-current="page"]') || links[0];
  if (!active) return;
  const rect = active.getBoundingClientRect();
  const navRect = nav.getBoundingClientRect();
  indicator.style.width = rect.width + 'px';
  indicator.style.transform = 'translateX(' + (rect.left - navRect.left) + 'px)';
}

function initReveal() {
  const elements = Array.from(document.querySelectorAll('.reveal'));
  if (!elements.length) return;
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );
  elements.forEach((el) => io.observe(el));
}

async function pjaxNavigate(href) {
  const currentMain = document.querySelector('main.container.main');
  if (currentMain) {
    currentMain.classList.add('fade-out');
  }
  try {
    const res = await fetch(href, { headers: { 'X-Requested-With': 'PJAX' } });
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const newMain = doc.querySelector('main.container.main');
    if (!newMain || !currentMain) {
      window.location.href = href;
      return;
    }
    currentMain.replaceWith(newMain);
    document.title = doc.title || document.title;
    window.history.pushState({}, '', href);
    initReveal();
    updateActiveNav();
    newMain.classList.add('fade-in');
    requestAnimationFrame(() => {
      newMain.classList.remove('fade-in');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    window.location.href = href;
  }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
  if (link.target === '_blank') return;
  if (!href.endsWith('.html')) return;
  e.preventDefault();
  pjaxNavigate(href);
});

window.addEventListener('popstate', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  pjaxNavigate(path);
});

window.addEventListener('load', () => {
  hideLoader();
  initReveal();
  updateActiveNav();
});

window.smoothBack = function () {
  window.history.back();
};

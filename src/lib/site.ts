export const siteMeta = {
  name: 'Phillip Trummer',
  tagline: 'ML systems / Zurich',
  title: 'Phillip Trummer - personal site',
  description: 'ML systems engineer focused on LLM inference and AI agent & harness engineering. Research notes and selected projects from Zurich.',
  email: 'pstrummer@outlook.com',
  github: 'https://github.com/phillip-trummer',
  linkedin: 'https://www.linkedin.com/in/phillip-trummer/',
  scholar: '',
  // Shared identity line shown in every page header (.identity).
  get identity() {
    return `${this.name} / ${this.tagline}`;
  },
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(pathname: string) {
  if (/^(https?:)?\/\//.test(pathname) || pathname.startsWith('mailto:')) {
    return pathname;
  }

  if (pathname === '/') {
    return base ? `${base}/` : '/';
  }

  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${cleanPath}`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function sortByDateDesc<T extends { data: { date: Date } }>(entries: T[]) {
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

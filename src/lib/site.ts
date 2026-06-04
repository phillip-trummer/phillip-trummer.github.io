export const siteMeta = {
  name: 'Phil Trummer',
  title: 'Phil Trummer - personal site',
  description: 'Notes, projects, photos, and contact links.',
  email: 'hello@example.com',
  github: 'https://github.com/phillip-trummer',
  linkedin: 'https://www.linkedin.com/in/yourname',
  scholar: 'https://scholar.google.com/',
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

export const siteMeta = {
  name: 'Phillip Trummer',
  title: 'Phillip Trummer - personal site',
  description: 'AI systems, research notes, and selected projects from Zurich.',
  email: 'pstrummer@outlook.com',
  github: 'https://github.com/phillip-trummer',
  linkedin: 'https://www.linkedin.com/in/phillip-trummer/',
  scholar: '',
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

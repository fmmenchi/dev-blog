import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('rss.xml', './routes/rss.ts'),
  route('sitemap.xml', './routes/sitemap.ts'),
  route('robots.txt', './routes/robots.ts'),
  route('blog/:slug', './routes/post.tsx'),
  route('projects', './routes/projects.tsx'),
  route('about', './routes/about.tsx'),
  route('colophon', './routes/colophon.tsx'),
  route('uses', './routes/uses.tsx'),
  route('*', './routes/not-found.tsx'),
] satisfies RouteConfig;

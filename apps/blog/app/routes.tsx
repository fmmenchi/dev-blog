import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('rss.xml', './routes/rss.ts'),
  route('blog/:slug', './routes/post.tsx'),
  route('projects', './routes/projects.tsx'),
  route('about', './routes/about.tsx'),
] satisfies RouteConfig;

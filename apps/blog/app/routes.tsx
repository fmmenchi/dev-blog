import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('progetti', './routes/progetti.tsx'),
  route('about', './routes/about.tsx'),
] satisfies RouteConfig;

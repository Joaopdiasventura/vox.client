import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'access', renderMode: RenderMode.Prerender },
  { path: 'group/:token/:id', renderMode: RenderMode.Server },
  { path: 'group/add', renderMode: RenderMode.Prerender },
  { path: 'participant/add', renderMode: RenderMode.Prerender },
  { path: 'votes/start', renderMode: RenderMode.Prerender },
  { path: 'votes/follow', renderMode: RenderMode.Prerender },
];

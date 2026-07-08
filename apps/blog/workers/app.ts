import { createRequestHandler } from 'react-router';

import { isMaintenance, maintenanceResponse } from '../app/lib/maintenance';

interface Env {
  MAINTENANCE?: string;
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

export default {
  fetch(request, env) {
    if (isMaintenance(env)) {
      return maintenanceResponse();
    }
    return requestHandler(request);
  },
} satisfies ExportedHandler<Env>;

import { createRequestHandler } from 'react-router';

import {
  isMaintenance,
  maintenanceResponse,
  type MaintenanceEnv,
} from '../app/lib/maintenance';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env) {
    if (await isMaintenance(env)) {
      return maintenanceResponse();
    }
    return requestHandler(request);
  },
} satisfies ExportedHandler<MaintenanceEnv>;

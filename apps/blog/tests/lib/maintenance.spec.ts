import { isMaintenance, maintenanceResponse } from '../../app/lib/maintenance';

function kv(value: string | null) {
  return { MAINTENANCE_KV: { get: async () => value } };
}

describe('maintenance mode', () => {
  it('is on only when the KV flag is exactly "on"', async () => {
    expect(await isMaintenance(kv('on'))).toBe(true);
    expect(await isMaintenance(kv('off'))).toBe(false);
    expect(await isMaintenance(kv(null))).toBe(false);
    expect(await isMaintenance({})).toBe(false);
  });

  it('answers 503 with retry hint and no caching or indexing', async () => {
    const res = maintenanceResponse();
    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('600');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const html = await res.text();
    expect(html).toContain('MAINTENANCE MODE');
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain('lang="en"');
  });
});

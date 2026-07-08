import { isMaintenance, maintenanceResponse } from '../../app/lib/maintenance';

describe('maintenance mode', () => {
  it('is on only when the var is exactly "true"', () => {
    expect(isMaintenance({ MAINTENANCE: 'true' })).toBe(true);
    expect(isMaintenance({ MAINTENANCE: 'false' })).toBe(false);
    expect(isMaintenance({})).toBe(false);
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

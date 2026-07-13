import {
  byDate,
  byPeriod,
  facetsOf,
  matchesAny,
  readFilters,
} from '../../app/lib/filters';

const url = (search: string) => new URL(`https://x.dev/blog${search}`);

describe('readFilters', () => {
  it('reads repeated facets and defaults to newest', () => {
    expect(readFilters(url('?tag=meta&tag=ai'), 'tag')).toEqual({
      selected: ['meta', 'ai'],
      sort: 'newest',
    });
  });

  it('accepts only the sort orders it knows', () => {
    expect(readFilters(url('?sort=oldest'), 'tag').sort).toBe('oldest');
    /* Anything else is not an error page — it is just the default. */
    expect(readFilters(url('?sort=nonsense'), 'tag').sort).toBe('newest');
  });
});

describe('matchesAny', () => {
  it('keeps everything when nothing is selected', () => {
    expect(matchesAny(['meta'], [])).toBe(true);
  });

  it('matches on ANY selected facet, not all of them', () => {
    /* With AND, picking a second tag would almost always empty the list — which
       reads as a broken filter rather than as an empty intersection. */
    expect(matchesAny(['meta'], ['meta', 'ai'])).toBe(true);
    expect(matchesAny(['other'], ['meta', 'ai'])).toBe(false);
  });
});

describe('sorting', () => {
  const posts = [
    { date: '2026-01-01' },
    { date: '2026-07-12' },
    { date: '2025-06-01' },
  ];

  it('puts the newest first by default, and can be reversed', () => {
    expect(byDate(posts, 'newest').map((p) => p.date)).toEqual([
      '2026-07-12',
      '2026-01-01',
      '2025-06-01',
    ]);
    expect(byDate(posts, 'oldest')[0]?.date).toBe('2025-06-01');
  });

  it('does not mutate the list it is given', () => {
    const original = [...posts];
    byDate(posts, 'oldest');
    expect(posts).toEqual(original);
  });

  it('sorts projects by period', () => {
    const projects = [{ period: '2025' }, { period: '2026' }];
    expect(byPeriod(projects, 'newest')[0]?.period).toBe('2026');
  });
});

describe('facetsOf', () => {
  it('collects every distinct facet, sorted and deduplicated', () => {
    const posts = [{ tags: ['meta', 'ai'] }, { tags: ['ai'] }];
    expect(facetsOf(posts, (p) => p.tags)).toEqual(['ai', 'meta']);
  });
});

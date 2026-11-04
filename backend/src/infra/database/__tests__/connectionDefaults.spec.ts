import { describe, expect, it } from 'vitest';
import { withConnectionDefaults } from '../connectionDefaults.js';

const params = (url: string) => new URL(url).searchParams;

describe('withConnectionDefaults', () => {
  it('adds fail-fast timeouts and a small pool when none are set', () => {
    const result = withConnectionDefaults('postgresql://user:pass@db.example.com:5432/postgres');

    expect(params(result).get('connect_timeout')).toBe('8');
    expect(params(result).get('pool_timeout')).toBe('8');
    expect(params(result).get('connection_limit')).toBe('5');
  });

  it('never overrides values that are already in the URL', () => {
    const result = withConnectionDefaults(
      'postgresql://user:pass@db.example.com:5432/postgres?connect_timeout=30&connection_limit=1',
    );

    expect(params(result).get('connect_timeout')).toBe('30');
    expect(params(result).get('connection_limit')).toBe('1');
    expect(params(result).get('pool_timeout')).toBe('8');
  });

  it('turns on pgbouncer mode for the Supabase transaction pooler port (6543)', () => {
    const result = withConnectionDefaults('postgresql://user:pass@pooler.example.com:6543/postgres');
    expect(params(result).get('pgbouncer')).toBe('true');
  });

  it('does not add pgbouncer on the regular port, and keeps an explicit value', () => {
    expect(params(withConnectionDefaults('postgresql://u:p@h.example.com:5432/db')).has('pgbouncer')).toBe(false);
    expect(
      params(withConnectionDefaults('postgresql://u:p@h.example.com:6543/db?pgbouncer=false')).get('pgbouncer'),
    ).toBe('false');
  });

  it('keeps credentials and database name intact', () => {
    const result = new URL(withConnectionDefaults('postgresql://user:s3cret@db.example.com:5432/mydb'));

    expect(result.username).toBe('user');
    expect(result.password).toBe('s3cret');
    expect(result.pathname).toBe('/mydb');
  });

  it('returns the input untouched when it is not a parseable URL', () => {
    expect(withConnectionDefaults('not a url')).toBe('not a url');
  });
});

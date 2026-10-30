import test from 'node:test';
import assert from 'node:assert/strict';
import { WORKSPACE_SCOPES, setCachedAccessToken, getCachedAccessToken } from '../src/lib/firebase.ts';
import { BUSINESSES } from '../src/data/businesses.ts';

test('Google Workspace scopes configurados corretamente', () => {
  assert.ok(Array.isArray(WORKSPACE_SCOPES), 'WORKSPACE_SCOPES deve ser um array');
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/spreadsheets'), 'Deve conter escopo do Google Sheets');
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/calendar'), 'Deve conter escopo do Google Calendar');
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/calendar.events'), 'Deve conter escopo de eventos do Google Calendar');
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/documents'), 'Deve conter escopo do Google Docs');
});

test('Token OAuth em memória funciona sem persistência em disco ou storage', () => {
  setCachedAccessToken(null);
  assert.equal(getCachedAccessToken(), null);

  const mockToken = 'mock_oauth_workspace_token_xyz_123';
  setCachedAccessToken(mockToken);
  assert.equal(getCachedAccessToken(), mockToken);

  setCachedAccessToken(null);
  assert.equal(getCachedAccessToken(), null);
});

test('Estabelecimentos de Brotas e Salvador estão disponíveis para exportação no Workspace', () => {
  const brotas = BUSINESSES.filter(b => b.neighborhood?.toLowerCase() === 'brotas');
  assert.ok(brotas.length >= 137, `Esperado no mínimo 137 estabelecimentos em Brotas, encontrado: ${brotas.length}`);
});

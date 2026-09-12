import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, dictionaryData, normalizeText, parseJson } from '../api/dictionary.js';

function responseRecorder() {
  return { statusCode: 0, headers: {}, status(code) { this.statusCode = code; return this; }, setHeader(key, value) { this.headers[key] = value; return this; }, end(value) { this.body = JSON.parse(value); return this; } };
}

test('normalizes dictionary input and parses fenced provider JSON', () => {
  assert.equal(normalizeText('  hello\n  world  '), 'hello world');
  assert.deepEqual(parseJson('```json\n{"translation":"xin chào"}\n```'), { translation: 'xin chào' });
});

test('maps Free Dictionary data to the unified response', () => {
  const result = dictionaryData('learn', [{ phonetic: '/lɜːn/', meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: 'Gain knowledge.', example: 'We learn together.' }] }] }]);
  assert.equal(result.term, 'learn');
  assert.equal(result.pronunciation, '/lɜːn/');
  assert.equal(result.partOfSpeech, 'verb');
  assert.deepEqual(result.definitions, ['Gain knowledge.']);
  assert.deepEqual(result.examples, [{ sentence: 'We learn together.', translation: '' }]);
  assert.equal(result.savedWord, null);
});

test('rejects missing, overlong, and unsupported-language queries without calling a provider', async () => {
  const handler = createHandler({ fetch: async () => assert.fail('provider should not be called') });
  for (const query of [{ language: 'en' }, { text: 'a'.repeat(81), language: 'en' }, { text: 'hello', language: 'vi' }]) {
    const res = responseRecorder();
    await handler({ method: 'GET', query, headers: {}, socket: { remoteAddress: Math.random().toString() } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.code, 'invalid_request');
  }
});

test('returns a stable English response when the free provider succeeds', async () => {
  const fetch = async () => ({ ok: true, json: async () => [{ phonetic: '/test/', meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A procedure.', example: 'This is a test.' }] }] }] });
  const res = responseRecorder();
  await createHandler({ fetch })({ method: 'GET', query: { text: 'test', language: 'en' }, headers: {}, socket: { remoteAddress: 'test-success' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.language, 'en');
  assert.equal(res.body.source, 'Free Dictionary API');
  assert.equal(res.headers['Cache-Control'], 'private, max-age=300');
});

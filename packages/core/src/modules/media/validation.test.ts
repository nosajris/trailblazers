import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUpload, MAX_UPLOAD_BYTES } from './validation.js';

test('a supported, sized image passes', () => {
	assert.equal(validateUpload({ mimeType: 'image/jpeg', size: 1024 }), null);
	assert.equal(validateUpload({ mimeType: 'image/png', size: 1024 }), null);
	assert.equal(validateUpload({ mimeType: 'image/webp', size: 1024 }), null);
});

test('an unsupported type is rejected', () => {
	const result = validateUpload({ mimeType: 'application/pdf', size: 1024 });
	assert.ok(result);
	assert.match(result.message, /not a supported image type/);
});

test('an empty file is rejected', () => {
	const result = validateUpload({ mimeType: 'image/jpeg', size: 0 });
	assert.ok(result);
	assert.match(result.message, /empty/);
});

test('a file over the size cap is rejected', () => {
	const result = validateUpload({ mimeType: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1 });
	assert.ok(result);
	assert.match(result.message, /larger than/);
});

test('a file exactly at the size cap passes', () => {
	assert.equal(validateUpload({ mimeType: 'image/jpeg', size: MAX_UPLOAD_BYTES }), null);
});

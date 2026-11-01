const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/app');

let server;
let baseUrl;

describe('Task Management API', () => {
  before(async () => {
    server = app.listen(0);

    await new Promise((resolve) => {
      server.once('listening', resolve);
    });

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });

  // 1. Health check
  it('should return healthy status', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'healthy');
    assert.equal(body.service, 'task-management-api');
  });

  // 2. Unknown route
  it('should return 404 for an unknown route', async () => {
    const response = await fetch(`${baseUrl}/unknown-route`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.success, false);
    assert.match(body.message, /Route not found/);
  });

  // 3. Malformed JSON
  it('should reject malformed JSON', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"title":',
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, 'Invalid JSON request body.');
  });

  // 4. Oversized JSON
  it('should reject oversized JSON requests', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test task',
        description: 'A'.repeat(11000),
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 413);
    assert.equal(body.success, false);
    assert.equal(body.message, 'Request body is too large.');
  });

  // 5. Invalid task ID
  it('should reject invalid task IDs', async () => {
    const response = await fetch(`${baseUrl}/api/tasks/invalid`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, 'Invalid task ID');
  });

  // 6. Missing task title
  it('should reject task creation without a title', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Missing title' }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(
      body.message,
      'Task title is required and must not exceed 200 characters'
    );
  });

  // 7. Title exceeding 200 characters
  it('should reject task titles exceeding 200 characters', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'A'.repeat(201),
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.match(body.message, /200 characters/);
  });

  // 8. Non-string description
  it('should reject non-string task descriptions', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test task',
        description: 123,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(
      body.message,
      'Task description must be a string'
    );
  });

  // 9. Invalid task status
  it('should reject invalid task statuses', async () => {
    const response = await fetch(`${baseUrl}/api/tasks/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test task',
        description: 'Validation test',
        status: 'invalid_status',
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(
      body.message,
      'Valid title, description, and status are required'
    );
  });

  // 10. Array request body
  it('should reject array request bodies', async () => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { title: 'Invalid task' },
      ]),
    });

    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(
      body.message,
      'A valid JSON object is required'
    );
  });
});
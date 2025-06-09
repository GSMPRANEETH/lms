const request = require('supertest');
const app = require('../app');

describe('Basic LMS Route Tests', () => {
    test('GET / responds with 200 or 302', async () => {
        const res = await request(app).get('/');
        expect([200, 302]).toContain(res.statusCode);
    });

    test('GET /signin responds with 200', async () => {
        const res = await request(app).get('/signin');
        expect(res.statusCode).toBe(200);
    });

    test('GET /signup responds with 200', async () => {
        const res = await request(app).get('/signup');
        expect(res.statusCode).toBe(200);
    });

    test('GET /dashboard redirects if not signed in', async () => {
        const res = await request(app).get('/dashboard');
        expect([302, 401, 403]).toContain(res.statusCode);
    });

    test('GET /nonexistent returns 404', async () => {
        const res = await request(app).get('/thispagedoesnotexist');
        expect(res.statusCode).toBe(404);
    });
});

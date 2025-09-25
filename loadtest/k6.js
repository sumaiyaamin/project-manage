import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests can fail
  },
};

const BASE_URL = 'http://localhost:3000';
let authToken;

export function setup() {
  // Login and get token
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'admin@example.com',
    password: 'admin123',
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has access token': (r) => r.json('access_token') !== undefined,
  });

  return { authToken: loginRes.json('access_token') };
}

export default function (data) {
  const params = {
    headers: {
      Authorization: `Bearer ${data.authToken}`,
      'Content-Type': 'application/json',
    },
  };

  group('Projects API', function () {
    // List projects
    const projectsRes = http.get(`${BASE_URL}/projects`, params);
    check(projectsRes, {
      'get projects successful': (r) => r.status === 200,
    });

    // Create project
    const createProjectRes = http.post(
      `${BASE_URL}/projects`,
      JSON.stringify({
        name: `Test Project ${Date.now()}`,
        description: 'Load test project',
        startDate: new Date().toISOString(),
      }),
      params,
    );

    check(createProjectRes, {
      'create project successful': (r) => r.status === 201,
    });

    if (createProjectRes.status === 201) {
      const projectId = createProjectRes.json('id');

      // Get project details
      const projectDetailsRes = http.get(
        `${BASE_URL}/projects/${projectId}`,
        params,
      );
      check(projectDetailsRes, {
        'get project details successful': (r) => r.status === 200,
      });

      // Create task
      const createTaskRes = http.post(
        `${BASE_URL}/tasks`,
        JSON.stringify({
          title: `Test Task ${Date.now()}`,
          description: 'Load test task',
          projectId: projectId,
        }),
        params,
      );

      check(createTaskRes, {
        'create task successful': (r) => r.status === 201,
      });
    }
  });

  sleep(1);
}

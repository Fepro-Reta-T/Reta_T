import { http, HttpResponse } from 'msw';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const handlers = [
  http.get(`${apiUrl}/auth/me`, () => {
    return HttpResponse.json({
      id: 'mock-user-1234',
      email: 'organizador@mock.com',
      full_name: 'Organizador de Prueba',
      role: 'organizer',
      is_active: true,
    });
  }),
];

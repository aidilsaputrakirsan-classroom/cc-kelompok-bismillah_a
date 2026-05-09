import '@testing-library/jest-dom'

// Mock window.location agar jsdom tidak error saat api.js redirect ke /login
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
})
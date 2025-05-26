import '@testing-library/jest-dom';

// Mock do localStorage
const localStorageMock = {
  length: 0,
  key: jest.fn((index: number) => null),
  getItem: jest.fn((key: string) => null),
  setItem: jest.fn((key: string, value: string) => undefined),
  removeItem: jest.fn((key: string) => undefined),
  clear: jest.fn(() => undefined),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 
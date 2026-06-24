// Default test user for development
export const DEFAULT_TEST_USER = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://ui-avatars.com/api/?name=Test+User&background=6366f1&color=fff',
}

export const isTestMode = process.env.NODE_ENV === 'development' && process.env.USE_TEST_USER === 'true'

/**
 * Mock Authentication Utility
 *
 * This is a temporary solution for development.
 * In production, this should be replaced with real authentication service.
 */

const MOCK_USER_KEY = 'user_id';
const DEFAULT_USER_ID = 1; // Make sure this user exists in your database

/**
 * Get current mock user ID
 */
export function getMockUserId(): number {
  const stored = localStorage.getItem(MOCK_USER_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }

  // Set default user ID
  setMockUserId(DEFAULT_USER_ID);
  return DEFAULT_USER_ID;
}

/**
 * Set mock user ID
 * Use this to test with different users
 */
export function setMockUserId(userId: number): void {
  localStorage.setItem(MOCK_USER_KEY, String(userId));
}

/**
 * Clear mock user (logout)
 */
export function clearMockUserId(): void {
  localStorage.removeItem(MOCK_USER_KEY);
}

/**
 * Check if user has voted for a specific poll
 */
export function hasVotedForPoll(pollId: number): boolean {
  const key = `voted_poll_${pollId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Mark poll as voted
 */
export function markPollAsVoted(pollId: number): void {
  const key = `voted_poll_${pollId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Clear voted status for a poll (for testing)
 */
export function clearVotedStatus(pollId: number): void {
  const key = `voted_poll_${pollId}`;
  localStorage.removeItem(key);
}

/**
 * Clear all voted statuses (for testing)
 */
export function clearAllVotedStatuses(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('voted_poll_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get mock user info
 * In production, this would fetch from API
 */
export function getMockUserInfo() {
  const userId = getMockUserId();
  return {
    id: userId,
    username: `user_${userId}`,
    isMock: true,
  };
}

// Development helpers - available in console
// @ts-ignore
if (import.meta.env.DEV as boolean) {
  (window as any).mockAuth = {
    getUserId: getMockUserId,
    setUserId: setMockUserId,
    clearUser: clearMockUserId,
    clearVoted: clearVotedStatus,
    clearAllVoted: clearAllVotedStatuses,
    getUserInfo: getMockUserInfo,
  };

  console.log('🔧 Mock Auth available in console: window.mockAuth');
  console.log('   - mockAuth.getUserId() - get current user ID');
  console.log('   - mockAuth.setUserId(id) - change user ID');
  console.log('   - mockAuth.clearVoted(pollId) - reset voted status');
  console.log('   - mockAuth.clearAllVoted() - reset all voted statuses');
}

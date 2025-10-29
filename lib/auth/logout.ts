/**
 * Logout utility - clears all stored credentials and user data
 */

export function logout() {
  if (typeof window === 'undefined') return;

  // Clear all CloudOptima related localStorage items
  const keysToRemove = [
    'cloudoptima-onboarding',
    'cloudoptima-user-role',
    'cloudoptima-aws-profile',
    'cloudoptima-azure-profile',
    'cloudoptima-gcp-profile',
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('✅ Logged out successfully - cleared all credentials');
}

/**
 * Check if user is logged in (has onboarding data)
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  
  const onboardingData = localStorage.getItem('cloudoptima-onboarding');
  return !!onboardingData;
}

/**
 * Get connected cloud providers
 */
export function getConnectedProviders(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const onboardingData = localStorage.getItem('cloudoptima-onboarding');
    if (!onboardingData) return [];
    
    const data = JSON.parse(onboardingData);
    return data.connectedProviders || [];
  } catch (error) {
    console.error('Failed to get connected providers:', error);
    return [];
  }
}

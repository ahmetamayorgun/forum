// Cookie utility functions to handle Cloudflare and other cookie issues

export const clearCloudflareCookies = () => {
  try {
    // Clear any Cloudflare related cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Remove Cloudflare cookies
      if (name.includes('__cf') || name.includes('cf_')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
      }
    });
  } catch (error) {
    console.log('Error clearing Cloudflare cookies:', error);
  }
};

export const setSecureCookie = (name: string, value: string, days: number = 7) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const cookieOptions = [
      `expires=${expires.toUTCString()}`,
      'path=/',
      'SameSite=Lax'
    ];
    
    // Only add secure flag in production
    if (window.location.protocol === 'https:') {
      cookieOptions.push('Secure');
    }
    
    document.cookie = `${name}=${value}; ${cookieOptions.join('; ')}`;
  } catch (error) {
    console.log('Error setting cookie:', error);
  }
};

export const getCookie = (name: string): string | null => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  } catch (error) {
    console.log('Error getting cookie:', error);
    return null;
  }
};

export const deleteCookie = (name: string) => {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  } catch (error) {
    console.log('Error deleting cookie:', error);
  }
};

// Initialize cookie handling
export const initializeCookieHandling = () => {
  // Clear problematic cookies on app start
  clearCloudflareCookies();
  
  // Set a flag to prevent Cloudflare cookie issues
  setSecureCookie('cf_clearance_bypass', 'true', 1);
  
  console.log('Cookie handling initialized');
};

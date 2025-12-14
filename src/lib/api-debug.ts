// Debug helper for API calls
export const logApiCall = async (url: string, options: RequestInit) => {
  console.log('🚀 API Call:', {
    url,
    method: options.method,
    headers: {
      ...options.headers,
      Authorization: '[HIDDEN]'
    }
  });
};
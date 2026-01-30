

const apiConfig = {
  app: {
    BASE_URL: import.meta.env.VITE_PUBLIC_URL || 'http://localhost:3000',
  },
  oauth: {
    CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID,
    CLIENT_SECRET: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
    REDIRECT_URI: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    RESPONSE_TYPE: import.meta.env.VITE_OAUTH_RESPONSE_TYPE || 'code',
    SCOPE: import.meta.env.VITE_OAUTH_SCOPE || 'read write',
    STATE: import.meta.env.VITE_OAUTH_STATE,
  },
}

export default apiConfig

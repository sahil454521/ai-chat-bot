// src/utils/routes.ts
export const APP_ROUTES = [
  'chat', 
  'about', 
  'settings', 
  'privacy', 
  'terms', 
  'contact'
];

export const isAppRoute = (path: string): boolean => {
  // Clean the path from leading/trailing slashes
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return APP_ROUTES.includes(cleanPath);
};
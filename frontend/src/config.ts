
const ENV = process.env.REACT_APP_ENVIRONMENT || 'development';

export const IS_PRODUCTION = ENV === 'production';


export const API_BASE_URL = IS_PRODUCTION
    ? "https://examiner-backend-2-622096286608.us-east1.run.app"
    : "http://localhost:3000";


console.log(API_BASE_URL)
export function apiUrl(path: string): string {
    const cleanedPath = String(path).replace(/^\/+/, "");
    console.log(API_BASE_URL)
    return `${API_BASE_URL}/${cleanedPath}`;
}

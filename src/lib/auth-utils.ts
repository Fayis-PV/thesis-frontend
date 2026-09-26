export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");
const DEV_LOGIN_SESSION_KEY = "devLoginSession";

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

export const setDevLoginSession = () => {
  localStorage.setItem(DEV_LOGIN_SESSION_KEY, "true");
};

export const hasDevLoginSession = () =>
  localStorage.getItem(DEV_LOGIN_SESSION_KEY) === "true";

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem(DEV_LOGIN_SESSION_KEY);
};

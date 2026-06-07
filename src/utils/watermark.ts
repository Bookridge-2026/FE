export const getStoredUserCode = () => {
  return localStorage.getItem("userCode") ?? "";
};

export const setStoredUserCode = (userCode: string) => {
  if (!userCode) return;
  localStorage.setItem("userCode", userCode);
};
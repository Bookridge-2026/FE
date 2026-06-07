export const getStoredUserCode = () => {
  return localStorage.getItem("userCode") ?? "";
};
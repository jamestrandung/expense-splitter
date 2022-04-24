export const saveLocalItem = (localStorageKey, value) => {
  localStorage.setItem(localStorageKey, JSON.stringify(value));
};

export const getLocalItem = (localStorageKey) => JSON.parse(localStorage.getItem(localStorageKey));

export const removeLocalItem = (localStorageKey) => localStorage.removeItem(localStorageKey);

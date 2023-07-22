export const getWikiAPIKey = (id) => `/api/wiki?id=${id}`;
export const getSectionID = (id) => `${id}-section`;
export const getSectionSelector = (id) => `section#${getSectionID(id)}`;
export const sanitizeElementID = (str) => str.toLowerCase().replaceAll(' ', '-').replace(/[^a-z-]/g, '');

/**
 * add code to cache
 */
const  cacheExpirationDays = 1;
export const addToLocalStorage = (id, code) => {
    localStorage.setItem(getWikiAPIKey(id), JSON.stringify({id, code, expiration: getDateNumber(7)}));
}

/**
 * today + daysInFuture, as int
 * like: yymmdd
 */
export const getDateNumber = (daysInFuture = 0) => {
    const today = new Date();
    return ((today.getUTCFullYear() % 100) * 10000) + (today.getUTCMonth() * 100) + (today.getUTCDate() + daysInFuture);
}
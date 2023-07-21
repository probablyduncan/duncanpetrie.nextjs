export const getWikiAPIKey = (id) => `/api/wiki?id=${id}`;
export const getSectionID = (id) => `${id}-section`;

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


/**
 * add/update mdx code in entries state
 * 
 * @param id entry id
 * @param code code to be added/updated in data
 * @param updateFunc usually updateEntries()
 */
export const addCodeToEntryData = (id, code, updateFunc) => { 
    const newData = {...entries};
    newData[id].code = code;
    updateFunc(newData); 
}


/**
 * add or remove card id from state using state update function
 * 
 * @param id entry id
 * @param currentCards
 * @param remove if true, remove instead of add
 */
export const pushPopOpenCards = (id, currentCards, updateFunc, remove) => { 

    if (remove) currentCards.pop(id);
    else currentCards.push(id);

    updateFunc(currentCards);
}
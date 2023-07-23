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

export const goToRandom = (current, data) => {
    const options = Object.keys(data).filter(w => w.id != current);
    window.location.href = options[Math.floor(options.length * Math.random())];
}

export const processWorldLinkHref = ({text = '', href = '', thisID}) => {
    
    const a = {text: text.toLowerCase(), href: href};

    // if no href is supplied, infer from link text
    // this defaults to link text, uses link href if exists, and processes # in href with link text accordingly
    
    return href == '#' ? 
        `${thisID}#${text?.toLowerCase().replaceAll(' ', '-')}` // if the link is just '#', then use text as #heading link on this page
    :(
        a.href.startsWith('#') || a.href.endsWith('#')) ? 
            a.href.replace('#', `#${a.text?.toLowerCase().replaceAll(' ', '-')}#`).replace(/^#|#$/, '') 
        : 
            (a.href || a.text?.toLowerCase().replace(' ', '')
    );
}
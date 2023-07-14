
/**
 * takes a comma-delineated list of groups
 * 
 * - & denotes it will appear in master list
 * - \# denotes the group is an id of another card (i.e. parent)
 * - [title] denotes alternate title for this specific group
 * 
 */
export function processWorldCardGroups(groupString) {
    
    return groupString?.split(',').map(t => {

        const group = t.replaceAll('&','').replaceAll('#','').replace(/\[.*\]/g, '');

        return {
            group: group,
            title: t.includes('[') ? t.substring(t.indexOf('[') + 1, t.indexOf(']')) : null, 
            groupInMasterList: t.includes('&'), 
            groupIsParentID: t.includes('#'),
        }
    })
}
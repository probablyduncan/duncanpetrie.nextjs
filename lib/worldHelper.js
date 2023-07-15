import groupBy from "./groupBy";



export function assembleCardGroups(cardData, selected, filter, filterText) {
    const groupsFlatMap = getGroupsFlatMap(cardData);
    
    // get all cards from the filter
    const filterGroups = filter ? getFilterGroups(cardData, groupsFlatMap, filter, filterText) : [];

    // get all cards related to selected
    const relatedGroups = selected ? getRelatedGroups(cardData, groupsFlatMap, selected) : [];

    // get master list
    const featuredGroups = Object.entries(groupBy(groupsFlatMap.filter(g => g.featuredGroup), 'group'));

    // concat all groups: 
    const allGroups = filterGroups.concat(relatedGroups).concat(featuredGroups);

    return allGroups;
}


export const getGroupsFlatMap = (cardData) => cardData.filter(w => w.groups).flatMap(w => processWorldCardGroups(w));


/**
 * takes a comma-delineated list of groups
 * 
 * - & denotes it will appear in master list
 * - \# denotes the group is an id of another card (i.e. parent)
 * - [title] denotes alternate title for this specific group
 * 
 * returns a list of group objects:
 * - id: card filename
 * - group: string group name
 * - title: default title, or override title if exists
 * - featuredGroup: if this group has '&' and should be in by default
 * - groupIsParentID: if this group has '#' and references another card
 * - coords: map coordinates
 * - priority: for sorting, just index of group in group string
 */
export const processWorldCardGroups = (w) => (
    w.groups?.split(',').map((g, i) => ({
        id: w.id,
        group: g.replaceAll('&','').replaceAll('#','').replace(/\[.*\]/g, ''),
        title: g.includes('[') ? g.substring(g.indexOf('[') + 1, g.indexOf(']')) : w.title, 
        featuredGroup: g.includes('&'), 
        groupIsParentID: g.includes('#'),
        coords: w.coords,
        priority: i,
    }))
);


/**
 * get the default group object for a card, w
 */
export const getDefaultWorldCardGroup = (w, group, featuredGroup, groupIsParentID) => ({
    id: w.id,
    group: group ?? w.groups?.replaceAll('&','').replaceAll('#','').replace(/\[.*\]/g, '').split(',')[0],
    title: w.title,
    featuredGroup: featuredGroup ?? w.groups?.split(',')[0].includes('&'),
    groupIsParentID: groupIsParentID ?? w.groups?.split(',')[0].includes('#'),
    coords: w.coords,
})


/**
 * get all featured cards, sorted into groups
 */
export const getFeaturedGroups = (groupsFlatMap) => Object.entries(groupBy(groupsFlatMap.filter(g => g.featuredGroup), 'group'));


/**
 * get all cards that match filter, grouped by filter
 */
export function getFilterGroups(cardData, groupsFlatMap, filterString = '', filterLabel = 'from filter: {f}') {
    
    return filterString.split(',').map(f => f.trim())   // get rid of spaces, etc
        .map(f => [
            filterLabel.replaceAll('{f}', f), 
            cardData
                .filter(w => w.id == f)                             // check if a card exists with filter as id
                .map(w => getDefaultWorldCardGroup(w, w.id))        // get group for that card
                .concat(groupsFlatMap.filter(g => g.group == f))    // concat with groups whose group matches the filter
        ]
    ).filter(g => g[1].length > 0);     // only return groups with matches
}


/**
 * gets all cards related to the selected card, 
 * including parents, children, and siblings, 
 * all in one 'related' group
 */
export function getRelatedGroups(cardData, groupsFlatMap, selected) {

    // get all cards that are parents of selected
    const relevantParents = cardData.filter(w => 
        groupsFlatMap
            .filter(g => g.group != selected && g.id == selected && g.groupIsParentID)
            .map(g => g.group)
            .includes(w.id)
    ).map(w => getDefaultWorldCardGroup(w));
    
    // get all cards are children of selected:
    const relevantChildren = groupsFlatMap.filter(g => g.groupIsParentID && g.group == selected && g.id != selected);

    // get all cards that are siblings of selected
    const relevantSiblings = groupsFlatMap.filter(g => g.id != selected && relevantParents.map(p => p.id).includes(g.group));

    // concat parents, children, and siblings
    return [['related', relevantParents.concat(relevantChildren).concat(relevantSiblings).map(g => ({...g, group: 'related' }))]];
}




export function wikiSearch(cardData, searchString) {

    cardData.flatMap(w => processWorldCardGroups(w)).filter(g => g.title.includes(searchString) || g.group.includes(searchString))

}
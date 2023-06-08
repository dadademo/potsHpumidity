import fetch from '@/utils/fetch'
/**
 * 
 * @param {startTimestamp,endTimestamp,pageIndex,pageSize} query 
 * @returns 
 */
export function tempList(query) {
    return fetch({
        url: '/api/getTemp',
        method: 'get',
        params: query
    })
}
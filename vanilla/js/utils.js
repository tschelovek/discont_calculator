export function getCleanNumber(string = '') {
    return Number(string.replace(/\s+/g, ''))
}

export function findMinMax(arr, dimension) {
    const arrValues = arr.map(el => {
        return el[dimension]
    })

    return {min: Math.min(...arrValues), max: Math.max(...arrValues)}
}

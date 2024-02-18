export function returnNullOrInteger(param) {
    let parsed = parseInt(param, 10);
    return isNaN(parsed) ? null : parsed;
}
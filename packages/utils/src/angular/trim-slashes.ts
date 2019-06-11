
export function trimSlashes(value: string) {
    return !value ? value : value.replace(/^\/|\/$/g, '');
}
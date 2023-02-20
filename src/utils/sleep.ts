export function sleep(timeout = 1000): Promise<void> {
    return new Promise(r => setTimeout(r, timeout));
}

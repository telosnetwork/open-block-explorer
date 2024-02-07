export function sleep(timeout = 1000): Promise<void> {
    return new Promise(r => setTimeout(r, timeout));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => ReturnType<T>>(
    callback: T,
    timeout: number,
): ((...args: Parameters<T>) => void) => {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, timeout);
    };
};

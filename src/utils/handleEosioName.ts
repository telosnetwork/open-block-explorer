export function randomEosioName(length = 12): string {
    let result = '';
    const validCharacters = '12345abcdefghijklmnopqrstuvxyz';

    for (let i = 0; i < length; i++) {
        result += validCharacters.charAt(
            Math.floor(Math.random() * validCharacters.length),
        );
    }

    return result;
}

export function isValidEmail (email) {
    return /\w+.*@\w+\.\w{2,}/.test(email);
}

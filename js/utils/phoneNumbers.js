export function checkIsValidPhoneNumber(phoneNumber) {
    return /\+\d{9,}/.test(phoneNumber);
}

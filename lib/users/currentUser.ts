let _currentUser: HDUser = {
    uid: "",
    isThirdParty: true
}

export function getCurrentUser() {
    return _currentUser
}

export interface HDUser {
    uid: string
    jwt?: string
    isThirdParty: boolean
    refreshToken?: string
}

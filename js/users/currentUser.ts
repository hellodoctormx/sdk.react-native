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
    deviceID?: string
    isThirdParty: boolean
    refreshToken?: String
}

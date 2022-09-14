import {User} from '../types';

let _currentUser: User = {
    uid: '',
    isThirdParty: true,
};

export function getCurrentUser() {
    return _currentUser;
}

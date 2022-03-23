import {signInThirdPartyUser} from "./auth";

export class HDThirdParties {
    static _thirdPartyID;

    static async configure(apiKey) {
        const thirdPartyID = null; // TODO get thirdPartyID from server

        HDThirdParties._thirdPartyID = thirdPartyID;
    }

    static async checkIsRegistered(thirdPartyUserID) {

    }

    static async signIn(thirdPartyUserID) {
        if (HDThirdParties._thirdPartyID === null) {
            throw new Error('HelloDoctor is not configured. Please run HelloDoctor.configure with your API key before trying to sign in.');
        }

        await signInThirdPartyUser(HDThirdParties._thirdPartyID, thirdPartyUserID);
    }
}

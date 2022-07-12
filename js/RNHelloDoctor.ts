import {NativeModule, NativeModules, Platform} from "react-native"
import Http from "./api/http"
import consultationsAPI from "./api/consultations"
import schedulingAPI from "./api/scheduling"
import usersAPI from "./api/users"
import videoAPI from "./api/video"
import * as connectionManager from "./telecom/connectionManager"
import * as connectionService from "./telecom/connectionService"
import * as eventHandlers from "./telecom/eventHandlers"
import * as auth from "./users/auth"
import {getCurrentUser} from "./users/currentUser"
import HDConfig, {HDConfigOptions} from "./HDConfig"

const {RNHelloDoctorModule} = NativeModules

interface RNHelloDoctorModuleInterface extends NativeModule {
    configure: (apiKey?: string, serviceHost?: string) => Promise<void>
    getAPNSToken: () => Promise<string>
    signIn: (userID: string, serverAuthToken: string) => void
    signInWithJWT: (userID: string, jwt: string) => void
}

declare module "react-native" {
    interface NativeModulesStatic {
        RNHelloDoctorModule: RNHelloDoctorModuleInterface
    }
}

export default class RNHelloDoctor {
    static appName: string

    static async configure(config: HDConfigOptions) {
        RNHelloDoctor.appName = config.appName

        Object.assign(HDConfig, config)

        Http.API_KEY = config.apiKey!

        switch (Platform.OS) {
            case "android":
                await RNHelloDoctorModule.configure(config.apiKey, config.serviceHost)
                break
            case "ios":
                await RNHelloDoctorModule.getAPNSToken().then(HDConfig.ios.onRegisterPushKitToken)
                break
        }

        console.debug("[RNHelloDoctor.configure:DONE]")
        return
    }

    static async signIn(userID: string, serverAuthToken: string) {
        await auth.signIn(userID, serverAuthToken)

        if (Platform.OS === "ios") {
            connectionService.bootstrap()
        }
    }

    static async signInWithJWT(userID: string, jwt: string) {
        await auth.signInWithJWT(userID, jwt)

        if (Platform.OS === "ios") {
            connectionService.bootstrap()
        }
    }

    static teardown() {
        connectionService.teardown()
    }

    // USER FUNCTIONS
    static getCurrentUser() {
        return getCurrentUser()
    }

    static createUser(accountPayload: Record<string, any>) {
        return usersAPI.createUser(accountPayload)
    }

    static deleteUser(userID: string) {
        return usersAPI.deleteUser(userID)
    }

    // SCHEDULING & CONSULTATION FUNCTIONS
    static getAvailability(requestMode: string, specialty: string, fromTime: string, toTime: string) {
        return schedulingAPI.getAvailability(requestMode, specialty, fromTime, toTime)
    }

    static requestConsultation(requestMode: string, specialty: string, startTime: string, reason: string) {
        return schedulingAPI.requestConsultation(requestMode, specialty, startTime, reason)
    }

    static getConsultations(limit: number) {
        return consultationsAPI.getUserConsultations(limit)
    }

    // VIDEO CALL FUNCTIONS
    static handleIncomingVideoCallNotification(videoCallPayload: eventHandlers.PushKitCallNotification) {
        const {videoRoomSID, callerDisplayName, callerPhotoURL} = videoCallPayload

        return eventHandlers.handleIncomingVideoCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL)
    }

    static handleIncomingVideoCallNotificationRejected() {
        const incomingCall = connectionManager.getIncomingCall()

        if (!incomingCall) {
            return
        }

        connectionManager.rejectVideoCall(incomingCall.videoRoomSID).catch(console.warn)
    }

    // deprecated: use handleVideoCallEndedNotification
    static handleIncomingVideoCallEndedRemotely(videoRoomSID: string) {
        return eventHandlers.handleIncomingVideoCallEndedRemotely(videoRoomSID)
    }

    static handleVideoCallEndedNotification(videoRoomSID: string) {
        return eventHandlers.handleVideoCallEndedNotification(videoRoomSID)
    }

    static startVideoCall(videoRoomSID: string) {
        connectionManager.handleIncomingVideoCallStarted(videoRoomSID)
    }

    static endVideoCall(videoRoomSID: string) {
        return connectionManager.endVideoCall(videoRoomSID)
    }

    static getVideoCallAccessToken(videoRoomSID: string) {
        return videoAPI
            .requestVideoCallAccess(videoRoomSID)
            .then(response => response.accessToken)
    }
}

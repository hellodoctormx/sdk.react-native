import {NativeModule} from "react-native";

interface RNHelloDoctorModuleInterface extends NativeModule {
    configure: (apiKey?: string, serviceHost?: string) => Promise<void>
    getAPNSToken: () => Promise<string>
    signIn: (userID: string, serverAuthToken: string) => void
    signInWithJWT: (userID: string, jwt: string) => void
    cancelIncomingCallNotification: () => Promise<void>
    rejectIncomingCallNotification: () => Promise<void>
}

declare module "react-native" {
    interface NativeModulesStatic {
        RNHelloDoctorModule: RNHelloDoctorModuleInterface
    }
}

export enum ConsultationType {
    VIDEO = "video",
    CHAT = "chat",
}

export type Consultation = {
    id: string
    type: ConsultationType
    status: string
    requestMode: string
    specialty: string
    reason: string
    scheduledStart: Date
    practitioner: PractitionerProfile
}

export type SchedulingAvailability = {
    start: Date,
    end: Date
}

export type UserProfile = {
    id: string
    displayName: string
    email: string
    phoneNumber: string
    profilePhotoURL: string
    birthDate: Date
}

export type PractitionerProfile = UserProfile & {
    groupType: string
    specialties: Array<PractitionerSpecialty>
}

export type PractitionerSpecialty = {
    id: string
    display: string
}

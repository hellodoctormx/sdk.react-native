import moment from "moment";
import firestore from "@react-native-firebase/firestore";
import {AndroidCategory, AndroidImportance, AndroidLaunchActivityFlag, AndroidVisibility} from "@notifee/react-native";
import {consultationTypeLabels} from "../../config/strings/labels";
import {hdColors} from "../../config/colors";
import {hdFonts} from "../../config/fonts";

export async function getIncomingCallNotification(consultationID, videoRoomSID) {
    console.info("[getIncomingCallNotification]", consultationID);

    const consultationSnapshot = await firestore().doc(`consultations/${consultationID}`).get();
    const consultation = consultationSnapshot.data();

    const practitionerProfileSnapshot = await firestore().doc(`profiles/${consultation.practitioner.id}`).get();
    const practitionerProfile = practitionerProfileSnapshot.data();

    const consultationTypeLabel = consultationTypeLabels[consultation.type];

    return {
        title: `${practitionerProfile.displayName} te esta llamando`,
        body: `${consultationTypeLabel} comienza a ${moment(consultation.scheduledStart.toDate()).format("HH:mm [el] D [de] MMM")}`,
        data: {
            type: "incomingVideoCall",
            consultationID,
            videoRoomSID
        },
        android: {
            channelId: "calls",
            smallIcon: "ic_launcher",
            largeIcon: practitionerProfile.profilePhotoURL || "ic_launcher",
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
            category: AndroidCategory.CALL,
            vibrationPattern: [500, 500],
            ongoing: true,
            color: hdColors.secondaryDark,
            pressAction: {
                id: "default",
                launchActivity: "default",
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
            },
            actions: [
                {
                    title: `<p style="color: ${hdColors.good}; font-family: ${hdFonts.bold}; font-size: 24px">Contestar</p>`,
                    pressAction: {
                        id: "answer",
                        launchActivity: "default",
                        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP]
                    }
                },
                {
                    title: `<p style="color: ${hdColors.negative}; font-family: ${hdFonts.bold}; font-size: 24px">Colgar</p>`,
                    pressAction: {
                        id: "reject"
                    }
                }
            ]
        }
    };
}

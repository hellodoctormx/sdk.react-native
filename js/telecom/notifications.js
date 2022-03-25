import {AndroidImportance, AndroidVisibility, AndroidCategory, AndroidLaunchActivityFlag} from "@notifee/react-native";

export function getIncomingCallNotification(consultationID, videoRoomSID) {
    return {
        title: `Tu médico te está llamando.`,
        body: `Por favor presione "Contestar" para comenzar su consulta.`,
        data: {
            type: "incomingVideoCall",
            consultationID,
            videoRoomSID
        },
        android: {
            channelId: "calls",
            smallIcon: "ic_launcher",
            largeIcon: "ic_launcher",
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
            category: AndroidCategory.CALL,
            vibrationPattern: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500],
            ongoing: true,
            color: "#0062B2",
            fullScreenAction: {
                id: "defaultFullScreen",
                mainComponent: "HDIncomingVideoCall"
            },
            pressAction: {
                id: "default",
                launchActivity: "default",
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
            },
            actions: [
                {
                    title: `<p style="color: #10810a; font-weight: bold; font-size: 24px">Contestar</p>`,
                    pressAction: {
                        id: "answer",
                        launchActivity: "default",
                        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP]
                    }
                },
                {
                    title: `<p style="color: #C52723; font-weight: bold; font-size: 24px">Colgar</p>`,
                    pressAction: {
                        id: "reject"
                    }
                }
            ]
        }
    };
}

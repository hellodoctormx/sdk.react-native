import {AndroidImportance, AndroidVisibility, AndroidCategory, AndroidLaunchActivityFlag} from "@notifee/react-native";

export function getIncomingCallNotification(consultationID, videoRoomSID) {
    return {
        title: `Tu médico te está llamando.`,
        body: `Por favor presione aquí para comenzar tu consulta.`,
        data: {
            type: "incomingVideoCall",
            consultationID,
            videoRoomSID
        },
        ios: {
            categoryId: "incomingVideoCalls"
        },
        android: {
            channelId: "calls",
            smallIcon: "ic_launcher",
            largeIcon: "ic_launcher",
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
            category: AndroidCategory.CALL,
            ongoing: true,
            color: "#0062B2",
            fullScreenAction: {
                id: "defaultFullScreen",
                mainComponent: "HDIncomingVideoCall",
                asForegroundService: true,
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

export function getOngoingCallNotification(consultationID, videoRoomSID) {
    return {
        title: '&#128222; Tu llamada está activa',
        subtitle: 'Consulta',
        android: {
            channelId: "calls",
            showChronometer: true,
            asForegroundService: true,
            actions: [
                {
                    title: `<p style="color: #C52723; font-weight: bold; font-size: 24px">Colgar</p>`,
                    pressAction: {
                        id: "disconnect"
                    }
                }
            ]
        }
    }
}

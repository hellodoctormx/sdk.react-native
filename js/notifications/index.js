import notifee, {EventType} from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import {getNotificationCategories} from "./categories";
import {getNotificationChannels} from "./channels";
import {getIncomingCall, handleIncomingConsultationVideoCallNotification} from "../services/calls";
import {acceptIncomingVideoCall, rejectIncomingVideoCall} from "./handlers";
import {Platform} from "react-native";

let isSubscribed = false;
let onForegroundEventSubscription = null;
let dynamicLinksListener = null;

function registerNotificationCategories() {
    if (Platform.OS !== "ios") {
        return;
    }

    const categories = getNotificationCategories();

    notifee.setNotificationCategories(categories)
        .catch(error => console.error("error setting categories", error));
}

function registerNotificationChannels() {
    if (Platform.OS !== "android") {
        return;
    }

    const channels = getNotificationChannels();

    const doCreateChannel = channel => notifee.createChannel(channel)
        .catch(error => console.error("error setting channels", error));

    channels.forEach(doCreateChannel);
}

function registerForegroundEventHandlers() {
    onForegroundEventSubscription = notifee.onForegroundEvent((event) => {
        const {type, detail} = event;

        let consultationID, videoRoomSID;

        switch (type){
            case EventType.DISMISSED:
                switch (detail.notification.data?.type) {
                    case "incomingVideoCall":
                        rejectIncomingVideoCall().catch(console.warn);
                        break;
                }
                break;
            case EventType.PRESS:
                switch (detail.notification.data?.type) {
                    case "incomingVideoCall":
                        consultationID = detail.notification.data.consultationID;
                        videoRoomSID = detail.notification.data.videoRoomSID;

                        // do navigate("VideoCallStack",  {screen: "IncomingVideoCall", params: {consultationID, videoRoomSID}});
                        break;
                }

                break;
            case EventType.ACTION_PRESS:
                const {pressAction, notification} = detail;
                const {data} = notification;

                switch (pressAction.id) {
                    case "answer":
                        console.debug("[bootstrapNotifications] trying to answer from FOREGROUND");
                        acceptIncomingVideoCall(data.consultationID, data.videoRoomSID).catch(error => console.warn(`error accepting incoming call: ${error}`));
                        break;
                }
        }
    });
}

export function registerBackgroundEventHandlers() {
    console.info("registering background event handler");

    messaging().setBackgroundMessageHandler(async message =>  {
        onMessageReceived(message).catch(error => console.error(error));
    });

    notifee.onBackgroundEvent(async event => {
        const {type, detail} = event;
        const {notification} = detail;

        const {data} = notification;

        let consultationID, videoRoomSID;

        switch (type){
            case EventType.DISMISSED:
                switch (detail.notification.data?.type) {
                    case "incomingVideoCall":
                        rejectIncomingVideoCall().catch(console.warn);
                        break;
                }
                break;
            case EventType.PRESS:
                // Remove the notification
                await notifee.cancelNotification(notification.id);

                switch (detail.notification.data?.type) {
                    case "incomingVideoCall":
                        consultationID = detail.notification.data.consultationID;
                        videoRoomSID = detail.notification.data.videoRoomSID;

                        // setInitialNavigation("VideoCallStack",  {screen: "IncomingVideoCall", params: {consultationID, videoRoomSID}});
                        // do resetToHome();
                        break;
                }

                break;
            case EventType.ACTION_PRESS:
                // Remove the notification
                await notifee.cancelNotification(notification.id);

                const {pressAction} = detail;

                switch (pressAction.id) {
                    case "answer":
                        console.debug("[onBackgroundEvent:ACTION_PRESS:answer]");
                        acceptIncomingVideoCall(data.consultationID, data.videoRoomSID).catch(error => console.warn(`error accepting incoming call: ${error}`));
                        break;
                    case "reject":
                        rejectIncomingVideoCall().catch(console.warn);
                        break;
                }
        }
    });
}

export async function bootstrapNotifications() {
    console.info("[bootstrapNotifications]");

    messaging().onNotificationOpenedApp(message => onMessageReceived(message).catch(error => console.error(error)));

    const initialNotification = await notifee.getInitialNotification();

    if (!initialNotification) {
        return false;
    }

    console.debug("[bootstrapNotifications] initial notification caused app to open", initialNotification);

    const {pressAction, notification} = initialNotification;
    const {data} = notification;

    if (data.type === "incomingVideoCall") {
        const incomingCall = getIncomingCall();

        if (!incomingCall) {
            return false;
        }

        const {consultationID, videoRoomSID} = incomingCall;

        if (pressAction?.id === "default") {
            // do push("AuthenticatedStack", {
            //     screen: "VideoCallStack",
            //     params: {screen: "IncomingVideoCall", params: {consultationID}}
            // });
        } else {
            acceptIncomingVideoCall(consultationID, videoRoomSID)
                .catch(error => console.warn(`error accepting incoming call: ${error}`));
        }

        return true;
    }
}

export async function onMessageReceived(message) {
    const {data} = message;

    switch(data?.type) {
        case "incomingVideoCall":
            await handleIncomingConsultationVideoCallNotification(data).catch(console.warn);
            return;
    }
}

export function subscribe() {
    if (isSubscribed) {
        return console.info("already subscribed")
    }

    isSubscribed = true;

    console.info("subscribing to notifications");
    registerNotificationCategories();
    registerNotificationChannels();
    registerForegroundEventHandlers();

    messaging().onMessage(onMessageReceived);
}

export function unsubscribe() {
    console.info(`[notifications/index:unsubscribe]`);
    if (onForegroundEventSubscription !== null) {
        onForegroundEventSubscription();
        onForegroundEventSubscription = null;
    }

    if (dynamicLinksListener !== null) {
        dynamicLinksListener();
    }

    isSubscribed = false;

    messaging().unregisterDeviceForRemoteMessages().catch(error => console.warn(`error unregistering FCM: ${error}`));
}

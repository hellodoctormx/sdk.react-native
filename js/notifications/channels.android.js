import {AndroidCategory, AndroidImportance, AndroidVisibility} from "@notifee/react-native";

export const defaultChannel = {
    id: "default",
    name: "Notificaciones",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH
};

export const callChannel = {
    id: "calls",
    name: "Videollamadas",
    lights: true,
    ongoing: true,
    vibration: true,
    vibrationPattern: [500, 500],
    visibility: AndroidVisibility.PUBLIC,
    importance: AndroidImportance.HIGH,
    category: AndroidCategory.CALL
};

export const chatChannel = {
    id: "chats",
    name: "Mensajes",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH
};

export const consultationChannel = {
    id: "consultations",
    name: "Consultas",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH
};

export const getNotificationChannels = () => [defaultChannel, callChannel, chatChannel, consultationChannel];

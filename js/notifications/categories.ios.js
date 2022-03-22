import {getString} from "../config/strings";

const consultationRequestsCategory = {
    id: "consultationRequests",
    actions: [
        {
            id: "details",
            title: "Detalles",
        },
    ],
};

const consultationRemindersCategory = {
    id: "consultationReminders",
    actions: [
        {
            id: "details",
            title: "Detalles",
        },
    ],
};

const newChatMessageCategory = {
    id: "newChatMessages",
    actions: [
        {
            id: "reply",
            title: "Respuesta",
            input: {
                placeholderText: getString("Send your reply..."),
                buttonText: "Send"
            }
        }
    ],
};

const paymentAuthorizationsCategory = {
    id: "paymentAuthorizations",
    actions: [
        {
            id: "authorize",
            title: "Autorizar",
        },
        {
            id: "details",
            title: "Detalles",
        },
    ],
}

const requestAddDeviceCategory = {
    id: "requestAddDevice",
    actions: [
        {
            id: "confirm",
            title: "Confirmar",
        },
        {
            id: "deny",
            title: "Negar",
        },
    ],
};

export const getNotificationCategories = () => [
    consultationRequestsCategory,
    consultationRemindersCategory,
    newChatMessageCategory,
    paymentAuthorizationsCategory,
    requestAddDeviceCategory
];

import _ from "lodash";
import React from "react";
import {
    AppState,
    Linking,
    NativeModules,
    PermissionsAndroid,
    Platform,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native' // FIXME probably don't actually want to have this as a dep.
import {HDCollapsibleView} from "./HDCollapsibleView";
import {alpha, hdColors} from "../utils/colors";
import * as connectionService from "../telecom/connectionService";
import RNCallKeep from "../callkeep";
import {getCurrentUser} from "../users/currentUser";
import HDTouchableButton from "./HDTouchableButton";

const HDCallKeepModule = NativeModules.RNCallKeep;

export async function checkHasTriedCallKeepConfig() {
    const currentUser = getCurrentUser();

    if (currentUser === null) {
        return false;
    }

    return await AsyncStorage.getItem(`has-tried-call-keep-config-${currentUser.uid}`) === "true";
}

export async function setHasTriedCallKeepConfig() {
    const currentUser = getCurrentUser();

    if (currentUser === null) {
        console.warn("[setHasTriedCallKeepConfig] can't set value: no user logged in")
        return;
    }

    await AsyncStorage.setItem(`has-tried-call-keep-config-${currentUser.id}`, "true");
}


const videoCallPermissions = [
    {type: "camera", permission: PermissionsAndroid.PERMISSIONS.CAMERA, display: "Cámara"},
    {type: "microphone", permission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, display: "Micrófono"},
    {type: "phoneNumbers", permission: "android.permission.READ_PHONE_NUMBERS", display: "Números de teléfono"},
    {type: "phoneState", permission: PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE, display: "Estado del teléfono"}
];

function HDVideoPermissionsConfiguration(props) {
    const [canShowConfiguration, setCanShowConfiguration] = React.useState(false);
    const [hasPhoneAccountConfigured, setHasPhoneAccountConfigured] = React.useState(false);
    const [hasDefaultPhoneAccount, setHasDefaultPhoneAccount] = React.useState(false);
    const [needsConfirmDefault, setNeedsConfirmDefault] = React.useState(false);
    const [isConfigurationComplete, setIsConfigurationComplete] = React.useState(false);
    const [configurationStatus, setConfigurationStatus] = React.useState("pending");
    const [isSuppressed, setIsSuppressed] = React.useState(false);
    const [missingPermissions, setMissingPermissions] = React.useState(null);

    const didOpenPhoneAccountRef = React.useRef(false);
    const configureRetriesRef = React.useRef(0);
    const configureRetries = configureRetriesRef.current;

    const hasVideoCallPermissions = missingPermissions != null && _.isEmpty(missingPermissions);

    const navigation = useNavigation();

    const isConfigured = hasVideoCallPermissions && hasPhoneAccountConfigured && hasDefaultPhoneAccount && !needsConfirmDefault;

    React.useEffect(() => {
        const doCheckCanShowConfig = () => {
            checkIsDialogSuppressed().then(setIsSuppressed);
        }

        const focusListener = navigation.addListener("focus", doCheckCanShowConfig);

        return () => {
            navigation.removeListener("focus", focusListener);
        }
    }, []);

    React.useEffect(() => {
        if (configurationStatus === "pending") {
            checkHasVideoCallPermissions().catch(console.warn);
            return;
        }

        checkHasPhoneAccountConfigured().catch(console.warn);

        navigation.addListener("focus", checkHasPhoneAccountConfigured);

        return () => {
            navigation.removeListener("focus", checkHasPhoneAccountConfigured);
        }
    }, [canShowConfiguration, configurationStatus]);

    React.useEffect(() => {
        if (hasPhoneAccountConfigured) {
            checkHasDefaultPhoneAccount().catch(console.warn);
            setConfigurationStatus("in-progress");
        }
    }, [hasPhoneAccountConfigured]);

    React.useEffect(() => {
        if ((isConfigurationComplete || isConfigured) && props.onCompleteConfiguration) {
            setTimeout(props.onCompleteConfiguration, 1500);
        }
    }, [isConfigurationComplete, isConfigured]);

    React.useEffect(() => {
        if (configurationStatus === "pending") return;

        const isConfigurationComplete = hasPhoneAccountConfigured && hasDefaultPhoneAccount && !needsConfirmDefault;

        setIsConfigurationComplete(isConfigurationComplete);
    }, [needsConfirmDefault])

    React.useEffect(() => {
        if (hasVideoCallPermissions) {
            setConfigurationStatus("in-progress");
        }
    }, [hasVideoCallPermissions]);

    const currentUser = getCurrentUser();

    const callKeepInfoSuppressionKey = `suppress-call-keep-info-${currentUser.uid}`;

    const checkIsDialogSuppressed = async () => {
        const callKeepSuppression = await AsyncStorage.getItem(callKeepInfoSuppressionKey);

        const hasSuppression = !_.isEmpty(callKeepSuppression);
        const isSuppressionExpired = hasSuppression && new Date(callKeepSuppression) < new Date();

        return hasSuppression && !isSuppressionExpired;
    }

    const doSuppressDialog = () => {
        const impossibleExpires = new Date();
        impossibleExpires.setFullYear(2200, 1, 1);

        AsyncStorage.setItem(`suppress-call-keep-info-${currentUser.uid}`, impossibleExpires.toISOString());
        setIsSuppressed(true);
    }

    const doRestoreDialog = () => {
        AsyncStorage.removeItem(`suppress-call-keep-info-${currentUser.uid}`);
        setIsSuppressed(false);
    }

    const doTemporarilySuppressDialog = () => {
        const temporaryExpires = new Date();
        temporaryExpires.setDate(new Date().getDate() + 1);

        setHasTriedCallKeepConfig().catch(console.warn);

        AsyncStorage.setItem(`suppress-call-keep-info-${currentUser.uid}`, temporaryExpires.toISOString());
        setIsSuppressed(true);

        if (props.onHide) {
            props.onHide();
        }
    }

    const checkHasPhoneAccountConfigured = async () => {
        const hasVideoCallPermissions = await checkHasVideoCallPermissions();

        if (!hasVideoCallPermissions) {
            setHasPhoneAccountConfigured(false);
            return;
        }

        const hasPhoneAccount = await RNCallKeep.checkPhoneAccountEnabled();
        setHasPhoneAccountConfigured(hasPhoneAccount);

        return hasPhoneAccount;
    }

    const checkHasDefaultPhoneAccount = async () => {
        const hasVideoCallPermissions = await checkHasVideoCallPermissions();

        if (!hasVideoCallPermissions) {
            return;
        }

        const hasPhoneAccount = await RNCallKeep.hasPhoneAccount();

        if (!hasPhoneAccount) {
            return;
        }

        await connectionService.bootstrap();

        const hasDefaultPhoneAccount = await HDCallKeepModule.checkDefaultPhoneAccount().catch(console.warn);
        setHasDefaultPhoneAccount(hasDefaultPhoneAccount);

        if (hasDefaultPhoneAccount && didOpenPhoneAccountRef.current) {
            setNeedsConfirmDefault(true);
        }

        return hasDefaultPhoneAccount;
    }

    const checkHasVideoCallPermissions = async () => {
        for (let permission of videoCallPermissions) {
            permission.granted = await PermissionsAndroid.check(permission.permission);
        }

        const missingPermissions = videoCallPermissions.filter(p => !p.granted);
        setMissingPermissions(missingPermissions);

        return missingPermissions.length === 0;
    }

    const requestVideoCallPermissions = async () => {
        for (let permission of videoCallPermissions) {
            permission.granted = await PermissionsAndroid.request(permission.permission) === "granted";
        }

        const missingPermissions = videoCallPermissions.filter(p => !p.granted);
        setMissingPermissions(missingPermissions);

        if (missingPermissions.length > 0) {
            Linking.openSettings().catch(console.warn);

            const appStateChangeSubscription = AppState.addEventListener("change", (appState) => {
                if (appState === "active") {
                    checkHasVideoCallPermissions().catch(console.warn);
                    appStateChangeSubscription.remove();
                }
            });
        }

        setHasTriedCallKeepConfig().catch(console.warn);
    }

    const doOpenPhoneAccountSettings = () => {
        configureRetriesRef.current = configureRetriesRef.current + 1;

        didOpenPhoneAccountRef.current = true;

        HDCallKeepModule.openPhoneAccounts();

        registerActiveAppStateHandler(() => {
            checkHasPhoneAccountConfigured().catch(console.warn);
            checkHasDefaultPhoneAccount().catch(console.warn);
        });
    }

    const tryConfigurePhoneAccount = async () => {
        configureRetriesRef.current = configureRetriesRef.current + 1;

        const hasPhoneAccountConfigured = await checkHasPhoneAccountConfigured(true);

        if (hasPhoneAccountConfigured) {
            doOpenPhoneAccountSettings();

            registerActiveAppStateHandler(() => checkHasDefaultPhoneAccount().catch(console.warn));
        } else {
            await connectionService.bootstrap();

            doOpenPhoneAccountSettings();

            registerActiveAppStateHandler(() => checkHasPhoneAccountConfigured().catch(console.warn));
        }
    }

    const registerActiveAppStateHandler = (handler) => {
        const appStateChangeSubscription = AppState.addEventListener("change", async (appState) => {
            if (appState === "active") {
                handler();
                appStateChangeSubscription.remove();
            }
        });
    }

    const doConfirmConfiguration = () => {
        setNeedsConfirmDefault(false);
        setIsConfigurationComplete(true);

        setTimeout(doSuppressDialog, 3000);
    }

    const SuppressedHeaderComponent = isConfigured ? View : TouchableOpacity;

    return (
        <React.Fragment>
            <HDCollapsibleView isCollapsed={!isSuppressed && !isConfigured}>
                <View>
                    <SuppressedHeaderComponent onPress={doRestoreDialog} style={{flexDirection: "row", alignItems: "center"}}>
                        <View style={{
                            width: isConfigured ? 22 : 48,
                            height: isConfigured ? 22 : 48,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                            backgroundColor: isConfigured ? hdColors.good : hdColors.negative
                        }}>
                            <Icon name={"phone"} size={isConfigured ? 10 : 24} color={"white"}/>
                        </View>
                        {!isConfigured && (
                            <Text style={{flex: 1, fontWeight: "bold", fontSize: 19, color: hdColors.negative, marginLeft: 12}}>
                                Configura tu dispositivo para recibir llamadas de HelloDoctor
                            </Text>
                        )}
                        {isConfigured && (
                            <Text style={{flex: 1, fontWeight: "bold", fontSize: 15, color: hdColors.textSecondary, marginLeft: 12}}>
                                Estás configurado para recibir llamadas.
                            </Text>
                        )}
                    </SuppressedHeaderComponent>
                </View>
            </HDCollapsibleView>
            <HDCollapsibleView isCollapsed={isSuppressed || isConfigured}>
                <View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <View style={{width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: hdColors.secondaryDark}}>
                            <Icon name={"phone"} size={24} color={"white"}/>
                        </View>
                        <Text style={{flex: 1, fontWeight: "bold", fontSize: 19, color: hdColors.textMain, marginLeft: 12}}>
                            Configura tu dispositivo para recibir llamadas de HelloDoctor
                        </Text>
                    </View>
                    {/*<Text style={{fontFamily: hdFonts.regular, fontSize: 16, color: hdColors.textSecondary}}>*/}
                    {/*    Sigue los siguientes pasos:*/}
                    {/*</Text>*/}
                    <View style={{flexDirection: "row"}}>
                        <ConfigurationStep icon={"shield-alt"} label={"1. Permisos"} isReady={hasVideoCallPermissions} onPress={requestVideoCallPermissions}/>
                        <ConfigurationStep icon={"phone"} label={"2. Configurar"} isReady={hasPhoneAccountConfigured} isActive={hasVideoCallPermissions} onPress={tryConfigurePhoneAccount}/>
                        <ConfigurationStep icon={"check"} label={"3. Confirmar"} isReady={hasDefaultPhoneAccount && !needsConfirmDefault} isActive={hasPhoneAccountConfigured} onPress={doOpenPhoneAccountSettings}/>
                    </View>
                    <HDCollapsibleView isCollapsed={configurationStatus === "pending"} maxHeight={2000}>
                        <HDCollapsibleView isCollapsed={hasVideoCallPermissions}>
                            <View style={{margin: 6, padding: 12, borderRadius: 6, backgroundColor: alpha(hdColors.secondaryDark, 0.1)}}>
                                <Text style={{fontWeight: "bold", fontSize: 19, color: hdColors.secondaryDark}}>
                                    Permisos del teléfono
                                </Text>
                                <Text style={{fontSize: 17, color: hdColors.secondaryDark}}>
                                    Para comenzar, necesitamos obtener unos permisos para configurar las videollamadas de HelloDoctor:
                                </Text>
                                <HDCollapsibleView isCollapsed={_.isEmpty(missingPermissions)} style={{margin: 12, marginTop: 6}}>
                                    {missingPermissions?.map(missing => (
                                        <Text key={missing.type} style={{fontWeight: "bold", fontSize: 16, color: hdColors.secondaryDark}}>
                                            &bull; {missing.display}
                                        </Text>
                                    ))}
                                </HDCollapsibleView>
                                <HDTouchableButton color={hdColors.secondaryDark} label={"1. Solicitar permisos"} onPress={requestVideoCallPermissions} style={{padding: 6}}/>
                                <Text style={{fontWeight: "bold", fontSize: 15, color: hdColors.secondaryDark}}>
                                    No te preocupes, HelloDoctor no interferirá con el uso normal de tu teléfono.
                                </Text>
                            </View>
                        </HDCollapsibleView>
                        <HDCollapsibleView isCollapsed={!hasVideoCallPermissions || hasPhoneAccountConfigured}>
                            <View style={{margin: 6, padding: 12, borderRadius: 6, backgroundColor: alpha(hdColors.secondaryLight, 0.1)}}>
                                <Text style={{fontWeight: "bold", fontSize: 19, color: hdColors.secondaryDark}}>
                                    Configurar HelloDoctor como cuenta telefónica
                                </Text>
                                <Text style={{fontSize: 17, color: hdColors.secondaryDark}}>
                                    Para recibir las videollamadas, active HelloDoctor como una cuenta de llamada de tu dispositivo.
                                </Text>
                                <HDTouchableButton color={hdColors.secondaryDark} label={"2. Configurar"} onPress={tryConfigurePhoneAccount} style={{padding: 6}}/>
                            </View>
                        </HDCollapsibleView>
                        <HDCollapsibleView isCollapsed={!hasPhoneAccountConfigured || hasDefaultPhoneAccount}>
                            <View style={{margin: 6, padding: 12, borderRadius: 6, backgroundColor: alpha(hdColors.secondaryLight, 0.1)}}>
                                <Text style={{fontWeight: "bold", fontSize: 19, color: hdColors.secondaryDark}}>
                                    Configurar cuenta de llamadas predeterminada
                                </Text>
                                <Text style={{fontSize: 17, color: hdColors.secondaryDark}}>
                                    Debe configurar su SIM como su cuenta de teléfono predeterminada para evitar interferir con sus preferencias normales de llamadas salientes.
                                </Text>
                                <HDTouchableButton color={hdColors.secondaryDark} label={"2. Configurar"} onPress={doOpenPhoneAccountSettings} style={{padding: 6}}/>
                            </View>
                        </HDCollapsibleView>
                        <HDCollapsibleView isCollapsed={!hasPhoneAccountConfigured || !hasDefaultPhoneAccount || !needsConfirmDefault}>
                            <View style={{margin: 6, padding: 12, borderRadius: 6, backgroundColor: alpha(hdColors.secondaryLight, 0.1)}}>
                                <Text style={{fontWeight: "bold", fontSize: 19, color: hdColors.secondaryDark}}>
                                    Confirma el uso de tu tarjeta SIM para realizar llamadas
                                </Text>
                                <Text style={{fontSize: 17, color: hdColors.secondaryDark}}>
                                    Por favor confirma que hayas seleccionado tu tarjeta SIM como predeterminada para realizar llamadas y NO la opción de HelloDoctor.
                                </Text>
                                <HDTouchableButton color={hdColors.secondaryDark} label={"3. Revisar configuración"} onPress={doOpenPhoneAccountSettings} style={{padding: 6}}/>
                                <HDTouchableButton color={hdColors.goodDark} label={"Sí, mi SIM es la predeterminada."} onPress={doConfirmConfiguration} style={{padding: 6}}/>
                            </View>
                        </HDCollapsibleView>
                        <HDCollapsibleView isCollapsed={!isConfigurationComplete}>
                            <TouchableOpacity onPress={doSuppressDialog} style={{padding: 6, margin: 24, backgroundColor: alpha(hdColors.good, 0.9), borderRadius: 24}}>
                                <Text style={{color: "white"}}>¡Listo!</Text>
                            </TouchableOpacity>
                        </HDCollapsibleView>
                    </HDCollapsibleView>
                    <HDCollapsibleView isCollapsed={configurationStatus !== "pending"}>
                        <HDTouchableButton color={hdColors.goodDark} label={"¡Seguro, vamos!"} onPress={() => setConfigurationStatus("in-progress")} style={{padding: 6, margin: 18}}/>
                    </HDCollapsibleView>
                    <HDCollapsibleView isCollapsed={configurationStatus !== "pending" && configureRetries < 3}>
                        <View style={{margin: 6, marginTop: 24, marginBottom: 12, padding: 12, borderRadius: 6, backgroundColor: alpha(hdColors.negativeLight, 0.1)}}>
                            <Text style={{fontWeight: "bold", fontSize: 19, color: hdColors.textMain}}>
                                Configurar más tarde
                            </Text>
                            <Text style={{fontSize: 17, color: hdColors.textMain}}>
                                Cuando inicie una videollamada de tu doctor, sólo recibirás una notificación del app para que te conectes.
                            </Text>
                            <HDTouchableButton color={alpha(hdColors.negative, 0.9)} label={"Cerrar"} onPress={doTemporarilySuppressDialog} style={{padding: 6}}/>
                        </View>
                    </HDCollapsibleView>
                </View>
            </HDCollapsibleView>
        </React.Fragment>
    )
}

const ConfigurationStep = (props) => {
    const {isReady, isActive} = props;

    const opacity = isReady || isActive ? 1 : 0.5;
    const color = isReady ? hdColors.goodDark : isActive ? hdColors.secondaryDark : hdColors.textSecondary;

    return (
        <TouchableOpacity onPress={props.onPress} style={{opacity, flex: 1, alignItems: "center", margin: 6, paddingTop: 18, paddingBottom: 18}}>
            <Icon name={props.icon} size={28} color={color}/>
            <Text style={{fontWeight: "bold", fontSize: 15, color}}>{props.label}</Text>
        </TouchableOpacity>
    )
}


function withPermissionsGate(WrappedComponent) {
    return function WithPermissionsGate(props) {
        const shouldRender = Platform.OS === "android" && getCurrentUser() !== null;

        return shouldRender ? <WrappedComponent {...props}/> : null;
    }
}

export default withPermissionsGate(HDVideoPermissionsConfiguration);

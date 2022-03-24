import React from "react";
import {Animated, AppState, Dimensions, Linking, Text, TouchableOpacity, View} from "react-native";
import {checkVideoCallPermissions} from "../telecom/permissions";
import Icon from "react-native-vector-icons/Ionicons";
import HDLogo from "./HDLogo";

export default function withVideoCallPermissions(WrappedComponent) {
    return function VideoCallPermissionsGate(props) {
        const [hasVideoCallPermissions, setHasVideoCallPermissions] = React.useState(null);

        const opacityRef = React.useRef(new Animated.Value(0));

        const doShowGate = () => Animated.timing(opacityRef.current, {toValue: 1, duration: 800, useNativeDriver: true}).start();

        const checkPermissions = async () => {
            const hasVideoCallPermissions = await checkVideoCallPermissions(true);
            setHasVideoCallPermissions(hasVideoCallPermissions);
        }

        React.useEffect(() => {
            checkPermissions().catch(error => console.warn(`[VideoCallPermissionsGate:checkPermissions] ${error}`));
        }, []);

        React.useEffect(() => {
            if (hasVideoCallPermissions === false) {
                doShowGate();
            }
        }, [hasVideoCallPermissions]);

        const goToSettings = async () => {
            Linking.openSettings().catch(console.warn);

            const checkListener = AppState.addEventListener("change", appState => {
                if (appState === "active") {
                    checkPermissions();
                    checkListener.remove();
                }
            });
        }

        const {height: screenHeight} = Dimensions.get("screen");

        return (
            <React.Fragment>
                {hasVideoCallPermissions && <WrappedComponent {...props}/>}
                {hasVideoCallPermissions === null && <View style={{height: screenHeight, backgroundColor: "black", padding: 12}}/>}
                {!hasVideoCallPermissions && (
                    <Animated.View isHidden={hasVideoCallPermissions} style={{flex: 1, backgroundColor: "#0062B2", padding: 12, opacity: opacityRef.current}}>
                        <HDLogo size={42} white={true} containerStyle={{alignItems: "center"}}/>
                        <View style={{flex: 1, marginTop: 96}}>
                            <View style={{alignItems: "center", marginBottom: 48}}>
                                <Icon name={"videocam-off-outline"} size={48} color={"white"} style={{alignItems: "center"}}/>
                            </View>
                            <Text style={{fontSize: 26, color: "white"}}>
                                Permisos faltantes
                            </Text>
                            <Text style={{fontSize: 20, color: "white"}}>
                                Necesitamos permisos para acceder a su <Text>cámara y micrófono</Text> para iniciar la llamada. Haga clic a continuación para actualizar su configuración.
                            </Text>
                            <TouchableOpacity onPress={goToSettings} color={"#00294b"} style={{justifyContent: "center"}}>
                                <Text style={{fontSize: 18, color: "white", textAlign: "center"}}>
                                    Ajustes
                                </Text>
                                <Icon name={"chevron-right"} size={20} color={"white"} style={{position: "absolute", right: 0, paddingRight: 12}}/>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </React.Fragment>
        )
    }
}

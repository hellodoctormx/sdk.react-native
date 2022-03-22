import React from "react";
import {Animated, AppState, Dimensions, Linking} from "react-native";
import {checkVideoCallPermissions} from "../permissions";

export default function withVideoCallPermissions(WrappedComponent) {
    return function VideoCallPermissionsGate(props) {
        console.debug("[VideoCallPermissionsGate:RENDER]", {props});

        const [hasVideoCallPermissions, setHasVideoCallPermissions] = React.useState(null);

        const opacityRef = React.useRef(new Animated.Value(0));

        const doShowGate = () => Animated.timing(opacityRef.current, {toValue: 1, duration: 800, useNativeDriver: true}).start();

        const checkPermissions = async () => {
            console.debug("[VideoCallPermissionsGate:checkPermissions:START]");
            const hasVideoCallPermissions = await checkVideoCallPermissions(true);
            console.debug("[VideoCallPermissionsGate:checkPermissions]", {hasVideoCallPermissions});
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
                {/*<HideableView isHidden={hasVideoCallPermissions !== null} style={{height: screenHeight, backgroundColor: "black", padding: 12}}/>*/}
                {/*<HideableView isHidden={hasVideoCallPermissions} style={{flex: 1, backgroundColor: hdColors.secondaryDark, padding: 12, opacity: opacityRef.current}}>*/}
                {/*    <LogoImage size={42} white={true} containerStyle={{alignItems: "center"}}/>*/}
                {/*    <View style={{flex: 1, marginTop: 96}}>*/}
                {/*        <View style={{alignItems: "center", marginBottom: 48}}>*/}
                {/*            <Icon name={"video-slash"} size={48} color={"white"} style={{alignItems: "center"}}/>*/}
                {/*        </View>*/}
                {/*        <Text style={{fontFamily: hdFonts.bold, fontSize: 26, color: "white"}}>*/}
                {/*            Permisos faltantes*/}
                {/*        </Text>*/}
                {/*        <Text style={{fontFamily: hdFonts.regular, fontSize: 20, color: "white"}}>*/}
                {/*            Necesitamos permisos para acceder a su <Text style={{fontFamily: hdFonts.bold}}>cámara y micrófono</Text> para iniciar la llamada. Haga clic a continuación para actualizar su configuración.*/}
                {/*        </Text>*/}
                {/*        <HDTouchableOpacity onPress={goToSettings} color={hdColors.secondaryDarkest} style={{justifyContent: "center"}}>*/}
                {/*            <Text style={{fontFamily: hdFonts.bold, fontSize: 18, color: "white", textAlign: "center"}}>*/}
                {/*                Ajustes*/}
                {/*            </Text>*/}
                {/*            <MDIcon name={"chevron-right"} size={20} color={"white"} style={{position: "absolute", right: 0, paddingRight: 12}}/>*/}
                {/*        </HDTouchableOpacity>*/}
                {/*    </View>*/}
                {/*</HideableView>*/}
            </React.Fragment>
        )
    }
}

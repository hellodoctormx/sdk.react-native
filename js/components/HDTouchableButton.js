import React from "react";
import {ActivityIndicator, Text, TouchableOpacity, View} from "react-native";
import {hdColors} from "../utils/colors";
import _ from "lodash";
import Icon from "react-native-vector-icons/FontAwesome5";

export default function HDTouchableButton(props) {
    if (props.isHidden) return null;

    const hasLeftIcon = !_.isEmpty(props.icon);
    const hasRightIcon = !_.isEmpty(props.iconRight);

    const textAlign = hasLeftIcon ? "left" : hasRightIcon ? "right" : "center";
    const paddingRight = hasLeftIcon ? 24 : 18;
    const paddingLeft = hasRightIcon ? 24 : 18;
    const justifyContent = hasLeftIcon ? "center" : hasRightIcon ? "flex-end" : "center";
    const fontSize = props.textStyle?.fontSize || 18;
    const iconSize = props.iconSize || fontSize;

    const InnerText = () => <Text style={{fontSize, textAlign, fontWeight: "bold", color: "white", ...props.textStyle}}>{props.label}</Text>;
    const StringIcon = props => <Icon name={props.icon} size={iconSize} color={"white"}/>;

    const InnerTextMemo = React.memo(InnerText);
    const StringIconMemo = React.memo(StringIcon);

    return (
        <TouchableOpacity
            testID={props.testID}
            onPress={props.onPress}
            disabled={props.disabled || props.loading}
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent,
                padding: 9,
                paddingLeft,
                paddingRight,
                marginTop: 6,
                marginBottom: 6,
                borderRadius: 6,
                backgroundColor: props.color,
                opacity: props.disabled ? 0.3 : 1,
                shadowColor: props.shadowColor || hdColors.secondaryDarkest,
                shadowOpacity: 0.1,
                shadowRadius: 2,
                shadowOffset: {height: 2, width: 2},
                ...props.style
            }}>
            {props.icon && (
                <View style={{marginRight: 12}}>
                    {_.isString(props.icon) && <StringIconMemo icon={props.icon}/>}
                    {_.isObject(props.icon) && props.icon}
                </View>
            )}
            {props.label && <InnerTextMemo/>}
            {props.iconRight && (
                <View style={{marginLeft: 12}}>
                    {_.isString(props.iconRight) && <StringIconMemo icon={props.iconRight}/>}
                    {_.isObject(props.iconRight) && props.iconRight}
                </View>
            )}
            {props.children}
            {props.isLoading && (
                <React.Fragment>
                    <View style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        backgroundColor: "white",
                        opacity: 0.8
                    }}/>
                    <View style={{position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "flex-start"}}>
                        <ActivityIndicator animating={props.loading} size={"small"} color={hdColors.secondaryDark}/>
                    </View>
                </React.Fragment>
            )}
        </TouchableOpacity>
    )
}

import * as React from "react";
import {Animated} from "react-native";

export function HDCollapsibleView(props) {
    // Just a little historical note for why isCollapsed & "expanded". Basically, the nomenclature within this function
    // reads better in the context of "expanding" but the component name makes more sense in the context of "collapsing".
    // Anyway, whatever.

    const viewRef = React.useRef({});

    const expandedMaxAxis = React.useRef(new Animated.Value(0)).current;
    const expandedOpacity = React.useRef(new Animated.Value(0)).current;

    const maxAxis = props.horizontal ? props.maxWidth || 128 : props.maxHeight || 768;

    const delay = props.delay || 0;
    const expandDuration = props.maxHeight < 400 ? 500 : 900;

    const doExpand = () => Animated.parallel([
        Animated.timing(expandedMaxAxis, {toValue: maxAxis, duration: expandDuration, delay, useNativeDriver: false}),
        Animated.timing(expandedOpacity, {toValue: 1, duration: 500, delay, useNativeDriver: false})
    ]).start(props.onExpand);

    const doCollapse = () => Animated.parallel([
        Animated.timing(expandedMaxAxis, {toValue: 0, duration: 500, useNativeDriver: false}),
        Animated.timing(expandedOpacity, {toValue: 0, duration: 200, useNativeDriver: false})
    ]).start(props.onCollapse);

    React.useEffect(() => {
        if (props.isCollapsed) {
            doCollapse();
        } else {
            doExpand();
        }
    }, [props.isCollapsed]);

    React.useEffect(() => {
        if (props.forwardRef) {
            props.forwardRef(viewRef.current);
        }
    }, []);

    const axisStyle = {
        maxHeight: props.horizontal ? null : expandedMaxAxis,
        maxWidth: props.horizontal ? expandedMaxAxis : null
    }

    return (
        <Animated.View ref={ref => viewRef.current = ref} style={{opacity: expandedOpacity, overflow: "hidden", ...axisStyle, ...props.style}}>
            {props.children}
        </Animated.View>
    )
}

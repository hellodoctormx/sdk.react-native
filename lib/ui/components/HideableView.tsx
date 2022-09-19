import React, {PropsWithChildren, ReactElement, RefObject, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';

type HideableViewProps = PropsWithChildren & {
    forwardRef?: (ref: RefObject<typeof Animated.View>) => void;
    isHidden: boolean;
    style?: Object;
}

export default function HideableView(props: HideableViewProps): ReactElement {
    const [isHidden, setIsHidden] = useState(props.isHidden);

    const animatedOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (props.isHidden) {hideView();}
        else {showView();}
    }, [props.isHidden]);

    const showView = () => {
        Animated.timing(animatedOpacity, {toValue: 1, duration: 300, useNativeDriver: false}).start(() => {
            setIsHidden(false);
        });
    };

    const hideView = () => Animated
        .timing(animatedOpacity, {toValue: 0, duration: 300, useNativeDriver: false})
        .start(() => setIsHidden(true));

    return (
        <Animated.View ref={props.forwardRef} {...props} style={{display: isHidden ? 'none' : 'flex', opacity: animatedOpacity, ...props.style}}>
            {props.children}
        </Animated.View>
    );
}

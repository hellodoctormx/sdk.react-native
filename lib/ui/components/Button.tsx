import type {ReactElement} from 'react';
import React from 'react';
import {ActivityIndicator, StyleProp, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle} from 'react-native';
import {HelloDoctorFonts} from '../theme';
import HideableView from './HideableView';

export type ButtonProps = TouchableOpacityProps & {
    label: string
    color?: string
    indicatorColor?: string
    loading?: boolean
    style?: StyleProp<ViewStyle>
    textStyle?: Record<string, any>
}

export default function Button(props: ButtonProps): ReactElement {
    const fontSize = props.textStyle?.fontSize || 16;

    const additionalStyle = typeof props.style === 'object' ? props.style : {};

    return (
        <TouchableOpacity
            onPress={props.onPress}
            disabled={props.disabled || props.loading}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 9,
                marginTop: 6,
                marginBottom: 6,
                borderRadius: 6,
                backgroundColor: props.color,
                opacity: props.loading || !props.disabled ? 1 : 0.3,
                minWidth: 64,
                ...additionalStyle,
            }}>
            <Text style={{fontSize, textAlign: 'center', fontFamily: HelloDoctorFonts.TextBold, color: 'white', ...props.textStyle}}>{props.label}</Text>
            {props.children}
            <HideableView isHidden={!props.loading} style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'white', opacity: 0.25}}/>
            <HideableView isHidden={!props.loading} style={{position: 'absolute', left: 24, right: 24, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-start'}}>
                <ActivityIndicator animating={props.loading} size={'small'} color={props.indicatorColor || 'white'}/>
            </HideableView>
        </TouchableOpacity>
    );
}

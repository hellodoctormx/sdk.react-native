import React from 'react';
import {Image, View} from 'react-native';

export default function HDLogo(props) {
    const defaultSize = 150;
    const size = props.size || defaultSize;
    const aspectRatio = 0.9;

    const source = props.white
        ? require('../../assets/logowhite.png')
        : require('../../assets/logo.png');

    return (
        <View
            style={{
                justifyContent: 'center',
                padding: 6,
                borderRadius: size,
                ...props.containerStyle,
            }}>
            <Image
                source={source}
                style={{
                    height: size,
                    width: size * aspectRatio,
                    ...props.style,
                }}
            />
        </View>
    );
}

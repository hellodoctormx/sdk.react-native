import * as React from 'react';
import {Animated, Dimensions} from 'react-native';
import withVideoCallPermissions from './withVideoCallPermissions';
import {LocalVideoView} from './native';

function PreviewLocalVideoView(): JSX.Element {
    const [isEnabled, setIsEnabled] = React.useState(false);

    const doEnablePreview = () => setIsEnabled(true);

    const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

    return (
        <Animated.View onLayout={doEnablePreview} style={{width: screenWidth, height: screenHeight}}>
            <LocalVideoView enabled={isEnabled} style={{width: '100%', height: '100%'}}/>
        </Animated.View>
    );
}

export default withVideoCallPermissions(PreviewLocalVideoView);

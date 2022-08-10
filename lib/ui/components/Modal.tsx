import * as React from 'react';
import {PropsWithChildren, ReactElement} from 'react';
import {Dimensions, Modal as ReactNativeModal, TouchableOpacity, View} from 'react-native';

type ModalProps = PropsWithChildren<any> & {
    visible: boolean
    onClose: () => void
    backgroundColor?: string
    backgroundOpacity?: number
}

export default function Modal(props: ModalProps): ReactElement {
    const [visible, setVisible] = React.useState(props.visible);

    React.useEffect(() => {
        if (props.visible !== visible) {
            setVisible(props.visible);
        }
    }, [props.visible]);

    const backgroundColor = props.backgroundColor || '#222';
    const opacity = props.backgroundOpacity || 0.75;

    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

    return (
        <ReactNativeModal visible={visible} transparent={true} onRequestClose={props.onClose} animationType={'fade'} supportedOrientations={['portrait', 'landscape']} style={{justifyContent: 'flex-end'}}>
            <TouchableOpacity style={{position: 'absolute'}} onPress={props.onClose}>
                <View style={{height: screenHeight, width: screenWidth, backgroundColor, opacity}}/>
            </TouchableOpacity>
            {props.children}
        </ReactNativeModal>
    );
}

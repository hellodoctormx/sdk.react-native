import { PractitionerSpecialty } from '../../../types';
import React, {ReactElement} from 'react';
import {Animated, ImageURISource} from 'react-native';

type SpecialtyIconProps = Omit<IconAssetImageProps, 'source'> & {
    specialty: PractitionerSpecialty
}

export function SpecialtyIcon(props: SpecialtyIconProps): ReactElement {
    const {specialty} = props;

    switch (specialty.id) {
    case 'Cardiología':
        return <SpecialtiesCardiologyIcon {...props}/>;
    case 'Dermatología':
        return <SpecialtiesDermatologyIcon {...props}/>;
    case 'Ginecología y Obstetricia':
        return <SpecialtiesGynecologyIcon {...props}/>;
    case 'Médico General':
        return <SpecialtiesGeneralMedicineIcon {...props}/>;
    case 'Medicina Veterinaria':
        return <SpecialtiesVeterinaryMedicineIcon {...props}/>;
    case 'Pediatría':
        return <SpecialtiesPediatricsIcon {...props}/>;
    case 'Psicología':
    case 'Psiquiatría':
        return <SpecialtiesPsychologyIcon {...props}/>;
    case 'Fisioterapia':
        return <SpecialtiesPhysicalTherapyIcon {...props}/>;
    case 'Nutrición':
        return <SpecialtiesNutritionIcon {...props}/>;
    default:
        return <SpecialtiesGeneralMedicineIcon {...props}/>;
    }
}

export const SpecialtiesCardiologyIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-cardiology.png')} {...props} />;

export const SpecialtiesDermatologyIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-dermatology.png')} {...props} />;

export const SpecialtiesGeneralMedicineIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-general-medicine.png')} {...props} />;

export const SpecialtiesGynecologyIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-gynecology.png')} {...props} />;

export const SpecialtiesNutritionIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-nutrition.png')} {...props} />;

export const SpecialtiesPediatricsIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-pediatrics.png')} {...props} />;

export const SpecialtiesPhysicalTherapyIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-physical-therapy.png')} {...props} />;

export const SpecialtiesPsychologyIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-psychology.png')} {...props} />;

export const SpecialtiesVeterinaryMedicineIcon = (props: SpecialtyIconProps) => <IconAssetImage source={require('../../../assets/icons/specialties-veterinary-medicine.png')} {...props} />;

type IconAssetImageProps = {
    source: ImageURISource
    size: number
    style?: Object
}

export function IconAssetImage(props: IconAssetImageProps): ReactElement {
    return (
        <Animated.Image
            source={props.source}
            resizeMode={'contain'}
            style={{height: props.size, width: props.size, ...props.style}}
        />
    );
}

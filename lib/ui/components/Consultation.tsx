import React, {ReactElement} from 'react';
import moment from 'moment';
import {Image, Text, View} from 'react-native';
import {Consultation} from '../../types';
import {HelloDoctorColors, HelloDoctorFonts} from '../theme';
import {ConsultationNotice, getConsultationNotices} from '../consultation.utils';

type ConsultationCardProps = {
    consultation: Consultation
}

export function ConsultationCard(props: ConsultationCardProps): ReactElement {
    const {consultation} = props;

    const consultationNotices = getConsultationNotices(consultation);

    return (
        <View style={{height: 196}}>
            <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                shadowColor: HelloDoctorColors.Blue700,
                shadowOpacity: 0.3,
                shadowRadius: 4,
                shadowOffset: {height: 0, width: 0},
                margin: 6,
                marginLeft: 6,
                marginRight: 6,
                borderWidth: 1,
            }}>
                {/*{consultationNotices.map((notice) => <ConsultationNoticeLabel key={notice.id} notice={notice}/>)}*/}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 6,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    backgroundColor: HelloDoctorColors.Blue700,
                }}>
                    <View style={{position: 'absolute', left: 18}}>
                        {/*<ConsultationIcon consultation={{type: consultation.type}} color={'white'} size={18}/>*/}
                    </View>
                    <Text style={{flex: 1, fontFamily: HelloDoctorFonts.TextBold, fontSize: 15, color: 'white', textAlign: 'center'}}>
                        Asesoría por video
                    </Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', padding: 9, paddingTop: 18}}>
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                            {consultation.practitioner?.profilePhotoURL && (
                                <Image
                                    source={{uri: consultation.practitioner.profilePhotoURL}}
                                    style={{height: 48, width: 48, borderRadius: 48}}
                                />
                            )}
                            <View style={{flex: 1, marginLeft: 6}}>
                                <Text numberOfLines={1} style={{fontFamily: HelloDoctorFonts.TextTitle, fontSize: 17, color: HelloDoctorColors.Blue700}}>{consultation.practitioner?.displayName}</Text>
                                <Text numberOfLines={1} style={{fontFamily: HelloDoctorFonts.TextRegular, fontSize: 15, color: HelloDoctorColors.Blue700}}>{consultation.specialty}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{paddingLeft: 6, justifyContent: 'center'}}>
                        {consultationNotices.map((notice) => <ConsultationNoticePill key={notice.id} notice={notice}/>)}
                        <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 6}}>
                            <View style={{width: 24}}>
                                {/*<Icon name={'calendar-alt'} size={15} color={hdColors.textMain}/>*/}
                            </View>
                            <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 14, color: HelloDoctorColors.Gray900}}>
                                {moment(consultation.scheduledStart).format('D MMM YYYY')}
                            </Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 6}}>
                            <View style={{width: 24}}>
                                {/*<Icon name={'clock'} size={15} color={hdColors.textMain}/>*/}
                            </View>
                            <Text style={{fontFamily: HelloDoctorFonts.TextTitle, fontSize: 14, color: HelloDoctorColors.Gray900}}>
                                {moment(consultation.scheduledStart).format('HH:mm')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

type ConsultationNoticePillProps = {
    notice: ConsultationNotice
}

function ConsultationNoticePill(props: ConsultationNoticePillProps): JSX.Element {
    const {notice} = props;

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 3,
            padding: 3,
            paddingLeft: 6,
            paddingRight: 12,
            borderRadius: 18,
            backgroundColor: notice.color,
        }}>
            {/*<Icon name={notice.icon} size={14} color={'white'}/>*/}
            <Text style={{fontFamily: HelloDoctorFonts.TextBold, fontSize: 14, color: 'white', marginLeft: 6, textAlign: 'center'}}>
                {notice.status}
            </Text>
        </View>
    );
}

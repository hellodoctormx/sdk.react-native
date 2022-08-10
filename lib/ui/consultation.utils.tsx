import _ from 'lodash';
import moment from 'moment';
import {Consultation} from '../types';
import {HelloDoctorColors} from './theme';

export type ConsultationNotice = {
    id: string
    importance: ConsultationNoticeImportance
    asserts: (consultation: Consultation) => boolean
    title?: string
    description: string
    color: string
    status?: string
    icon?: string
    Action?: () => JSX.Element
}

enum ConsultationNoticeImportance {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    CRITICAL = 3
}

export function getConsultationNotices(consultation: Consultation): ConsultationNotice[] {
    const assertedNotices = allConsultationNotices.filter((notice) => notice.asserts(consultation));

    if (assertedNotices.length === 0) {
        return [];
    }

    // @ts-ignore
    const maxImportance = _.maxBy(assertedNotices, (notice) => notice.importance).importance;

    return assertedNotices.filter((notice) => notice.importance === maxImportance);
}

const allConsultationNotices: ConsultationNotice[] = [
    {
        id: 'start_chat_consultation',
        importance: ConsultationNoticeImportance.LOW,
        status: 'Listo',
        description: 'El experto te atenderá en cuanto este disponible',
        color: HelloDoctorColors.Blue300,
        icon: 'clock',
        asserts: (consultation: Consultation) => {
            return consultation.type === 'chat';
        },
    },
    {
        id: 'pending_consultation',
        importance: ConsultationNoticeImportance.LOW,
        title: 'Pendiente',
        status: 'Pendiente',
        description: 'Tu solicitud esta pendiente',
        color: HelloDoctorColors.Blue300,
        icon: 'clock',
        asserts: (consultation: Consultation) => {
            return consultation.status === 'pending';
        },
    },
    {
        id: 'missed_consultation',
        importance: ConsultationNoticeImportance.HIGH,
        status: 'Perdida',
        description: 'Se perdió la consulta',
        color: HelloDoctorColors.Red500,
        icon: 'times-circle',
        asserts: (consultation: Consultation) => {
            if (consultation.type === 'chat') {
                return false;
            }

            const consultationStart = moment(consultation.scheduledStart);

            const missedThresholdScheduledStart = moment(consultationStart).add(60, 'minutes');

            return _.includes(['accepted', 'pending'], consultation.status)
                && consultationStart.isBefore(moment())
                && missedThresholdScheduledStart.isBefore(moment());
        },
    },
    {
        id: 'scheduled_consultation',
        importance: ConsultationNoticeImportance.LOW,
        status: 'Programada',
        description: 'Tu cita está programada',
        color: HelloDoctorColors.Blue500,
        icon: 'clock',
        asserts: (consultation: Consultation) => {
            console.debug('checking scheduled_consultation');
            if (consultation.type === 'chat') {
                return false;
            }

            const missedThresholdScheduledStart = moment(consultation.scheduledStart).add(60, 'minutes');

            return consultation.status === 'accepted' && moment().isBefore(missedThresholdScheduledStart);
        },
    },
    {
        id: 'upcoming_consultation',
        importance: ConsultationNoticeImportance.MEDIUM,
        status: 'En breve',
        description: 'En breve te contactará tu doctor',
        color: HelloDoctorColors.Green700,
        icon: 'clock',
        asserts: (consultation: Consultation) => {
            if (consultation.type === 'chat') {
                return false;
            }

            return consultation.status === 'accepted'
                && moment().add(30, 'minutes').isAfter(consultation.scheduledStart)
                && moment().subtract(10, 'minutes').isBefore(consultation.scheduledStart);
        },
    },
    {
        id: 'in_progress_consultation',
        importance: ConsultationNoticeImportance.MEDIUM,
        status: 'En curso',
        description: 'Tu asesorīa está en curso',
        color: HelloDoctorColors.Green500,
        icon: 'clock',
        // Action: ResumeConsultationAction,
        asserts: (consultation: Consultation) => {
            return consultation.status === 'in-progress'
                || consultation.status === 'pending-completion'
                || consultation.status === 'connecting'; // TODO remove this once we fix deploy new video service
        },
    },
    {
        id: 'completed_consultation',
        importance: ConsultationNoticeImportance.MEDIUM,
        status: 'Completada',
        description: 'Tu asesoría fue exitosa',
        color: HelloDoctorColors.Green700,
        icon: 'check-circle',
        asserts: (consultation: Consultation) => {
            return consultation.status === 'completed';
        },
    },
    {
        id: 'cancelled_consultation',
        importance: ConsultationNoticeImportance.HIGH,
        status: 'Cancelada',
        description: 'Se canceló la cita',
        color: HelloDoctorColors.Orange500,
        icon: 'ban',
        asserts: (consultation: Consultation) => {
            return consultation.status === 'cancelled';
        },
    },
];

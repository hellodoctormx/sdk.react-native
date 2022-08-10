import type {ReactElement, PropsWithChildren} from 'react';
import * as React from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import { ConsultationType, SchedulingAvailability } from '../../types';

type ISchedulingContext = {
    availability: Array<SchedulingAvailability>
    setAvailability: (availability: Array<SchedulingAvailability>) => void
    checkIsRequestReady: () => void
    isRequestReady: boolean
    setIsRequestReady: (isRequestReady: boolean) => void
    consultationType: ConsultationType
    setConsultationType: (consultationType: ConsultationType) => void
    scheduledStart: Date
    setScheduledStart: (scheduledStart: Date) => void
    consultationReason: string
    setConsultationReason: (consultationReason: string) => void
    consultationSpecialty: string
    setConsultationSpecialty: (consultationSpecialty: string) => void
}

const SchedulingContext = createContext<ISchedulingContext>({
    availability: undefined,
    setAvailability: undefined,
    checkIsRequestReady: undefined,
    isRequestReady: undefined,
    setIsRequestReady: undefined,
    consultationType: undefined,
    setConsultationType: undefined,
    scheduledStart: undefined,
    setScheduledStart: undefined,
    consultationReason: undefined,
    setConsultationReason: undefined,
    consultationSpecialty: undefined,
    setConsultationSpecialty: undefined,
});

export function useSchedulingContext(): ISchedulingContext {
    return useContext(SchedulingContext);
}

export function SchedulingContextProvider(props: PropsWithChildren<any>): ReactElement {
    const [availability, setAvailability] = useState<Array<SchedulingAvailability>>([]);
    const [consultationType, setConsultationType] = useState<ConsultationType>();
    const [scheduledStart, setScheduledStart] = useState<Date>();
    const [consultationReason, setConsultationReason] = useState<string>('Temporary reason for testing.');
    const [consultationSpecialty, setConsultationSpecialty] = useState<string>();

    const [isRequestReady, setIsRequestReady] = useState(false);

    useEffect(() => {
        checkIsRequestReady();
    }, [
        consultationSpecialty,
        consultationType,
        scheduledStart,
        consultationReason,
    ]);

    function checkIsRequestReady() {
        const updatedIsRequestReady = consultationSpecialty !== undefined
            && Object.values(ConsultationType).includes(consultationType)
            && (scheduledStart !== undefined || consultationType === 'chat')
            && consultationReason?.length > 0;

        setIsRequestReady(updatedIsRequestReady);

        console.debug('[checkIsRequestReady]', {
            consultationSpecialty,
            consultationType,
            scheduledStart,
            consultationReason,
        });
    }

    return (
        <SchedulingContext.Provider value={{
            isRequestReady, setIsRequestReady, checkIsRequestReady,
            availability, setAvailability,
            consultationType, setConsultationType,
            scheduledStart, setScheduledStart,
            consultationReason, setConsultationReason,
            consultationSpecialty, setConsultationSpecialty,
        }}>
            {props.children}
        </SchedulingContext.Provider>
    );
}

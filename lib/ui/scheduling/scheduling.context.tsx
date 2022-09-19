import type {ReactElement, PropsWithChildren} from 'react';
import * as React from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import { ConsultationType, SchedulingAvailability } from '../../types';

type ISchedulingContext = {
    availability: Array<SchedulingAvailability> | undefined
    setAvailability: (availability: Array<SchedulingAvailability>) => void
    checkIsRequestReady: () => void
    isRequestReady: boolean
    setIsRequestReady: (isRequestReady: boolean) => void
    consultationType: ConsultationType | undefined
    setConsultationType: (consultationType: ConsultationType | undefined) => void
    scheduledStart: Date | undefined
    setScheduledStart: (scheduledStart: Date | undefined) => void
    consultationReason: string | undefined
    setConsultationReason: (consultationReason: string | undefined) => void
    consultationSpecialty: string | undefined
    setConsultationSpecialty: (consultationSpecialty: string | undefined) => void
}

const SchedulingContext = createContext<ISchedulingContext>({
    availability: undefined,
    checkIsRequestReady(): void {},
    consultationReason: undefined,
    consultationSpecialty: undefined,
    consultationType: undefined,
    isRequestReady: false,
    scheduledStart: undefined,
    setAvailability(): void {},
    setConsultationReason(): void {},
    setConsultationSpecialty(): void {},
    setConsultationType(): void {},
    setIsRequestReady(): void {},
    setScheduledStart(): void {},
});

export function useSchedulingContext(): ISchedulingContext {
    return useContext(SchedulingContext);
}

export function SchedulingContextProvider(props: PropsWithChildren<any>): ReactElement {
    const [availability, setAvailability] = useState<Array<SchedulingAvailability>>([]);
    const [consultationType, setConsultationType] = useState<ConsultationType>();
    const [scheduledStart, setScheduledStart] = useState<Date>();
    const [consultationReason, setConsultationReason] = useState<string | undefined>('Temporary reason for testing.');
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
            && Object.values(ConsultationType).includes(consultationType!)
            && (scheduledStart !== undefined || consultationType === 'chat')
            && consultationReason !== undefined && consultationReason.length > 0;

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

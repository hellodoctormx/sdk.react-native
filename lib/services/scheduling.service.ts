import {HelloDoctorHTTPClient} from "../api/http";
import {SchedulingAvailability} from "../types";

type GetAvailabilityResponse = {
    availableTimes: Array<ResponseAvailability>
}

type ResponseAvailability = { interval: {start: string, end: string} }

const httpClient = new HelloDoctorHTTPClient();

export function getAvailability(requestMode: string, specialty: string, startTime: Date, endTime: Date): Promise<Array<SchedulingAvailability>> {
    const path = `/scheduling/availability?requestMode=${requestMode}&specialty=${specialty}&start=${startTime.toISOString()}&end=${endTime.toISOString()}`;

    return httpClient.get(path).then((getAvailabilityResponse: GetAvailabilityResponse) => {
        function serializeSchedulingAvailability(availability: ResponseAvailability): SchedulingAvailability {
            return {
                ...availability,
                start: new Date(availability.interval.start),
                end: new Date(availability.interval.end),
            };
        }

        return getAvailabilityResponse.availableTimes.map(serializeSchedulingAvailability);
    });
}

export function requestConsultation(requestMode: string, specialty: string, startTime: Date, reason: string): Promise<void> {
    return httpClient.post("/scheduling/_request", {requestMode, specialty, startTime, reason})
}

export function getUserConsultations(limit: number) {
    return httpClient.get(`/consultations?limit=${limit}`);
}

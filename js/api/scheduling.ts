import Http from "./http";

class SchedulingAPI extends Http {
    getAvailability(requestMode: string, specialty: string, fromTime: string, toTime: string) {
        return this.get(`/scheduling/availability?requestMode=${requestMode}&specialty=${specialty}&fromTime=${fromTime}&toTime=${toTime}`);
    }

    requestConsultation(requestMode: string, specialty: string, startTime: string, reason: string) {
        return this.post(`/scheduling/_request`, {
            requestMode,
            specialty,
            startTime,
            reason
        });
    }
}

export default new SchedulingAPI();

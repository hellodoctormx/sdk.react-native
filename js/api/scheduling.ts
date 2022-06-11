import Http from "./http";

class SchedulingAPI extends Http {
    getAvailability(requestMode, specialty, fromTime, toTime) {
        return this.get(`/scheduling/availability?requestMode=${requestMode}&specialty=${specialty}&fromTime=${fromTime}&toTime=${toTime}`);
    }

    requestConsultation(requestMode, specialty, startTime, reason) {
        return this.post(`/scheduling/_request`, {
            requestMode,
            specialty,
            startTime,
            reason
        });
    }
}

export default new SchedulingAPI();

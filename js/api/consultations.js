import Http from "./http";

class ConsultationsAPI {
    http = null;

    constructor() {
        this.http = new Http();
    }

    getUserConsultations(limit) {
        return this.http.get(`/consultations?limit=${limit}`);
    }
}

export default new ConsultationsAPI();

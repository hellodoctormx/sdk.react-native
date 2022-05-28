import Http from "./http";

const publicApiHost = "https://public-api-pusuheofiq-uc.a.run.app";
// const publicApiHost = "http://192.168.100.26:3010";

class ConsultationsAPI {
    http = null;

    constructor() {
        this.http = new Http(publicApiHost);
    }

    getUserConsultations(limit) {
        return this.http.get(`/consultations?limit=${limit}`);
    }
}

export default new ConsultationsAPI();

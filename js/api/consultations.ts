import Http from "./http";

class ConsultationsAPI extends Http {
    getUserConsultations(limit) {
        return this.get(`/consultations?limit=${limit}`);
    }
}

export default new ConsultationsAPI();

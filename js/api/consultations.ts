import Http from "./http";

class ConsultationsAPI extends Http {
    getUserConsultations(limit: number) {
        return this.get(`/consultations?limit=${limit}`);
    }
}

export default new ConsultationsAPI();

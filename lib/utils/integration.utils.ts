import HDConfig from '../config';
import {HelloDoctorHTTPClient} from '../api/http';

const httpClient = new HelloDoctorHTTPClient();

export function pingIntegrationStep(featureID: string) {
    if (HDConfig.mode === 'integration') {
        httpClient.post('/ping', {featureID: featureID}).catch((error) => {
            console.warn(`[integrationStep:${featureID}]`, error);
        });
    }
}

export function integrationStep(featureID: string) {
    return function decorator(t: any, n: any, descriptor: any) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            descriptor.value = function(...args: any) {
                try {
                    const result = original.apply(this, args);

                    if (HDConfig.mode === 'integration') {
                        httpClient.post('/ping', {featureID: featureID}).catch((error) => {
                            console.warn(`[integrationStep:${featureID}]`, error);
                        });
                    }

                    return result;
                } catch (e) {
                    throw e;
                }
            };
        }
        return descriptor;
    };
}

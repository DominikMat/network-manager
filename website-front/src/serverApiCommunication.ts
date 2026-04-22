import { TopologyServiceClient } from './TopologyServiceClientPb';
import { ToggleRequest, SubscribeRequest, NetworkEvent } from './topology_pb';

const API_BASE_URL = "http://localhost:8080"

export enum Protocol {
    REST = 'REST',
    GRPC = 'gRPC'
}

export interface ApiResponse {
    data: any;
    error: boolean;
    errorMsg: string;
}


const client = new TopologyServiceClient('http://localhost:8081', null, null); // connect to port from docker 

export class servergRpcApi {

    static async toggleNode(id: number, active: boolean): Promise<{success: boolean, errorMsg?: string}> {
        const request = new ToggleRequest();
        request.setDeviceId(id);
        request.setActive(active);

        return new Promise((resolve) => {
            client.toggleDevice(request, {}, (err, response) => {
                if (err) {
                    resolve({ success: false, errorMsg: err.message });
                } else {
                    resolve({ success: response.getSuccess() });
                }
            });
        });
    }

    static subscribeToNode(id: number, onMessage: (data: any) => void, onError: (err: any) => void) {
        const request = new SubscribeRequest();
        request.setDeviceId(id);

        const stream = client.subscribeToDevice(request, {});

        stream.on('data', (response: NetworkEvent) => {
            // Mapujemy format gRPC na format, który rozumie Twój React
            const data = {
                type: response.getType(),
                deviceIds: response.getDeviceIdsList()
            };
            onMessage(data);
        });

        stream.on('error', (err) => {
            onError(err);
        });

        return stream;
    }
}

export class serverRestApi {

    // Pomocnicza metoda do zapytań
    static async httpApiRequest(endpoint: string, method: string = 'GET', body: string | null = null): Promise<ApiResponse> {

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                ...(body && { body })
            });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();
            return { data, error: false, errorMsg: "" };

        } catch (err: any) {
            console.error(`API Error (${endpoint}):`, err);
            return { data: null, error: true, errorMsg: err?.message ?? 'Unknown error' };
        }
    }

    static getSubscriptionEventSource(id: number): EventSource {
        return new EventSource(`http://localhost:8080/devices/${id}/reachable-devices`);
    }

    static async toggleNode(id: number, active: boolean): Promise<ApiResponse> {
        return await this.httpApiRequest(`/devices/${id}`, 'PATCH', JSON.stringify({ active }));
    }
}

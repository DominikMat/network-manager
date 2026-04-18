
const API_BASE_URL = "http://localhost:8080"

export interface ApiResponse {
    data: any;
    error: boolean;
    errorMsg: string;
}

export class serverApi {

    // Pomocnicza metoda do zapytań
    static async apiRequest(endpoint: string, method: string = 'GET', body: string | null = null): Promise<ApiResponse> {

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

    static async subscribeToNode(id: number): Promise<ApiResponse> {
        return await this.apiRequest(`/devices/${id}/reachable-devices`, 'GET');
    }

    static async toggleNode(id: number, active: boolean): Promise<ApiResponse> {
        return await this.apiRequest(`/devices/${id}`, 'PATCH', JSON.stringify({ active }));
    }
}

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ApiConfig {
    // Backend API base URL - adjust based on your environment
    private readonly baseUrl: string = 'http://localhost:3000/api';
    
    /**
     * Get API base URL
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }
    
    /**
     * Get auth endpoints
     */
    getAuthEndpoint(endpoint: string): string {
        return `${this.baseUrl}/auth${endpoint}`;
    }
    
    /**
     * Get health check endpoint
     */
    getHealthEndpoint(): string {
        return 'http://localhost:3000/health';
    }
}



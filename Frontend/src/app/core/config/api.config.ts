import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiConfig {
    // Backend API base URL from environment
    private readonly baseUrl: string = `${environment.apiUrl}/api`;
    
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
        return `${environment.apiUrl}/health`;
    }
}



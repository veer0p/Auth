export interface User {
    id?: string;
    uuid?: string;
    username?: string;
    name?: string;
    email: string;
    firstname?: string;
    lastname?: string;
    avatar?: string;
    status?: string;
    role?: string;
    verified?: boolean;
    country_code?: string;
    phone_number?: string;
    last_login?: string;
    created_at?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
        accessToken: string;
        refreshToken?: string;
        otp?: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

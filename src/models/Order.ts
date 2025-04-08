export interface Order {
    id: string;
    student_id: string;
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
    status: string;
    response_count: number;
    created_at: string;
    updated_at: string;
    is_responsed: boolean;
}

export interface Responses {
    id: string;
    tutor_id: number;
    name: string;
    created_at: string;
}

export interface OrderDetails {
    id: string;
    student_id: string;
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
    status: string;
    response_count: number;
    responses: Responses[];
    created_at: string;
    updated_at: string;
    is_responsed: boolean;
}

export interface OrderCreate {
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
}

export interface OrderUpdate {
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
}

export interface OrderEdit {
    is_responded: boolean;
}
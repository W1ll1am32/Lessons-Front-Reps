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
    order_id: string;
    tutor_id: string;
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

export interface OrderPagination {
    Orders: Order[];
    Pages: number;
}

export interface Tutor {
    id: string;
    telegram_id: number;
    name: string;
}

export interface Review {
    id: string;
    tutor_id: string;
    student_id: string;
    rating: number;
    comment: string;
    created_at: string;
}

export interface TutorProfile {
    Tutor: Tutor;
    Bio: string;
    Response_count: number;
    Reviews: Review[];
    IsActive: boolean;
    Rating: number;
    ResponseCount: number;
    Tags: string[];
    CreatedAt: string;
}
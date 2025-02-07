export interface Order {
    id: string;
    student_id: string;
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface OrderCreate {
    title: string;
    description: string;
    tags: string[];
    min_price: number;
    max_price: number;
}


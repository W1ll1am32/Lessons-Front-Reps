import {Order} from "@/models/Order.ts";

const api_link: string = 'https://lessonsmy.tech/api';

export const getOrders = async (userdata: string): Promise<Order[]> => {
    try {
        const ResponseOrders = await fetch(`${api_link}/orders/all`, {
            method: "GET",
            headers: {"token": userdata},
        });

        console.log("Response status:", ResponseOrders.status);
        console.log("Response headers:", ResponseOrders.headers);

        if (!ResponseOrders.ok) {
            const errorText = await ResponseOrders.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }
        const data = await ResponseOrders.json();
        console.log("Сохраняем заказы в состояние:", data);
        console.warn(data)
        return data || [];
    } catch (error) {
        console.error(error);
        return []
    }
}
/*
export const getOrdersMock = async (userdata: string): Promise<Order[]> => {
    try {
        const data = [{
            id: "1", 
            student_id: "2", 
            title: "3", 
            description: "4", 
            tags: [], 
            min_price: 0, 
            max_price: 1, 
            status: "5", 
            created_at: "6",
            updated_at: "7"}];
        console.log("Сохраняем заказы в состояние:", data);
        console.warn(data)
        return data || [];
    } catch (error) {
        console.error(error);
        return []
    }
}
*/
export const getOrderById = async (id: string, userdata: string): Promise<Order | null> => {
    try {
        const ResponseOrder = await fetch(`${api_link}/orders/${id}`, {
            method: "GET",
            headers: {"token": userdata },
        });

        console.log("Response status:", ResponseOrder.status);
        console.log("Response headers:", ResponseOrder.headers);

        if (!ResponseOrder.ok) {
            throw new Error('Не удалось получить заказ');
        }
        return ResponseOrder.json();
    } catch (err) {
        return null;
    }
}
/*
export const getOrderByIdMock = async (userdata: string): Promise<Order[]> => {
    try {
        const data = {
            id: "1", 
            student_id: "2", 
            title: "3", 
            description: "4", 
            tags: [], 
            min_price: 0, 
            max_price: 1, 
            status: "5", 
            created_at: "6",
            updated_at: "7"};
        console.log("Сохраняем заказы в состояние:", data);
        console.warn(data)
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}
*/
/*
export const createOrder = async (orderdata: OrderCreate, userdata: string): Promise<string | null> => {
    try {
        const responseOrder = await fetch(`${api_link}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderdata),
            headers: {"content-type": 'application/json', "token": userdata},
        })

        if (!responseOrder.ok) {
            throw new Error("Ошибка при создании заказа");
        }

        const result = await responseOrder.json();
        return result.orderID;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export const deleteOrder = async (id: string, userdata: string): Promise<void> => {
    try {
        const responseOrder = await fetch(`${api_link}/orders/${id}`, {
            method: "DELETE",
            headers: {"token": userdata },
        })

        if (!responseOrder.ok) {
            const error = await responseOrder.json();
            throw new Error("Ошибка при удалении заказа:" + error.error);
        }
    } catch (error) {
        // throw new Error("Ошибка при удалении заказа:")
        console.error(error);
    }
}

export const updateOrder = async (id: string, userdata: string, orderdata: OrderCreate): Promise<void> => {
    try {
        const responseOrder = await fetch(`${api_link}/orders/${id}`, {
            method: "PUT",
            body: JSON.stringify(orderdata),
            headers: {"token": userdata },
        })

        if (!responseOrder.ok) {
            const error = await responseOrder.json();
            throw new Error("Ошибка при обновлении заказа" + error.error);
        }
    } catch (error) {
        // throw new Error("Ошибка при удалении заказа:")
        console.error(error);
    }
}
*/
export const responseOrder = async (id: string, userdata: string): Promise<string | null> => {
    try {
        const responseOrder = await fetch(`${api_link}/responses/id/${id}`, {
            method: 'POST',
            body: JSON.stringify({"order_id": id}),
            headers: {"token": userdata},
        })

        if (!responseOrder.ok) {
            throw new Error("Ошибка при отклике");
        }

        const result = await responseOrder.json();
        return result.text;
    } catch (err) {
        console.error(err);
        return null;
    }
}

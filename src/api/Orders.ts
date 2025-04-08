import {Order, OrderDetails} from "@/models/Order.ts";

const api_link: string = 'https://lessonsmy.tech/api';

export const sendData = async (userdata: string): Promise<string | null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }
        const ResponseData = await fetch(`${api_link}/users`, {
            method: "POST",
            headers: {"Authorization": AuthToken },
        });

        console.log("Response status:", ResponseData.status);
        console.log("Response headers:", ResponseData.headers);

        if (!ResponseData.ok) {
            const errorText = await ResponseData.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }
        const result = await ResponseData.json();
        return result.text;
    } catch (error) {
        console.error(error);
        return null
    }
}

export const getOrders = async (userdata: string): Promise<Order[]> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return [] // navigate auth page
        }
        const ResponseOrders = await fetch(`${api_link}/orders/all`, {
            method: "GET",
            headers: {"Authorization": AuthToken },
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
export const getOrderById = async (id: string, userdata: string): Promise<OrderDetails | null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }
        const ResponseOrder = await fetch(`${api_link}/orders/mini/id/${id}`, {
            method: "GET",
            headers: {"Authorization": AuthToken },
        });

        console.log("Response status:", ResponseOrder.status);
        console.log("Response headers:", ResponseOrder.headers);
        console.log("Response body:", ResponseOrder.body);

        if (!ResponseOrder.ok) {
            throw new Error('Не удалось получить заказ');
        }

        const data = await ResponseOrder.json();

        console.log("Response data:", data);

        return data || [];
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
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }

        console.error(`${api_link}/responses/id/${id}`)
        const responseOrder = await fetch(`${api_link}/responses/id/${id}`, {
            method: 'POST',
            body: JSON.stringify({
                "greetings": "Здравствйте! Давно занимаюсь этой темой и могу помочь"
            }),
            headers: {"Authorization": AuthToken, "Content-Type": "application/json"},
        })

        if (!responseOrder.ok) {
            console.error(responseOrder.status);
            throw new Error("Ошибка при отклике");
        }
        const result = await responseOrder.json();
        console.log("Response order result:", result);
        console.log("Response order text:", result.response_id);

        const editOrder = {
            is_responded: true,
        }

        const responseEditOrder = await fetch(`${api_link}/orders/id/${id}`, {
            method: "PUT",
            body: JSON.stringify(editOrder),
            headers: {"content-type": 'application/json', "Authorization": AuthToken },
        })

        console.log("Response status:", responseEditOrder.status);
        console.log("Response headers:", responseEditOrder.headers);

        if (!responseEditOrder.ok) {
            console.error(responseOrder.status);
            throw new Error("Ошибка при отклике");
        }

        return result.response_id;
    } catch (err) {
        console.error(err);
        return null;
    }
}

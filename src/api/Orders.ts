import {OrderPagination, OrderDetails, Responses} from "@/models/Order.ts";

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

export const getOrders = async (userdata: string, limit: number, page: number): Promise<OrderPagination | null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }
        const ResponseOrders = await fetch(`${api_link}/orders/pagination?size=${limit}&page=${page}`, {
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

        const ordersData: OrderPagination = {
            orders: data.Orders,
            pages: data.Pages,
        }

        return ordersData;
    } catch (error) {
        console.error(error);
        return null
    }
}

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

export const responseOrder = async (id: string, userdata: string, responseText: string): Promise<string | null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }

        console.log(`${api_link}/responses/id/${id}`)
        const responseOrder = await fetch(`${api_link}/responses/id/${id}`, {
            method: 'POST',
            body: JSON.stringify({
                "message": responseText
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

        if (responseEditOrder.status != 401) {
            console.error(responseEditOrder.status);
            throw new Error("Ошибка при отклике");
        }

        return result.response_id;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export const getResponses = async (userdata: string): Promise<Responses[] | []> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return [] // navigate auth page
        }
        const ResponseOrders = await fetch(`${api_link}/responses/list`, {
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

export const setStatus = async (userdata: string, status: boolean): Promise<null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }
        const ResponseOrders = await fetch(`${api_link}/users/tutor/active`, {
            method: "POST",
            body: JSON.stringify({
                "is_active": status
            }),
            headers: {"Authorization": AuthToken,
                "Content-Type": 'application/json',
            },
        });
        console.log("Status:", status);
        console.log("Response status:", ResponseOrders.status);
        console.log("Response headers:", ResponseOrders.headers);

        if (!ResponseOrders.ok) {
            const errorText = await ResponseOrders.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const setName = async (userdata: string | undefined, name: string): Promise<null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }
        const ResponseOrders = await fetch(`${api_link}/users/tutor/name`, {
            method: "POST",
            body: JSON.stringify({
                "name": name
            }),
            headers: {"Authorization": AuthToken,
                "Content-Type": 'application/json',
            },
        });

        console.log("Response status:", ResponseOrders.status);
        console.log("Response headers:", ResponseOrders.headers);

        if (!ResponseOrders.ok) {
            const errorText = await ResponseOrders.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const setBio = async (userdata: string, bio: string): Promise<null> => {
    try {
        const AuthToken = localStorage.getItem("token");
        if (!AuthToken || !userdata) {
            return null // navigate auth page
        }
        const ResponseOrders = await fetch(`${api_link}/users/tutor/bio`, {
            method: "POST",
            body: JSON.stringify({
                "bio": bio
            }),
            headers: {"Authorization": AuthToken,
                "Content-Type": 'application/json',
            },
        });

        console.log("Response status:", ResponseOrders.status);
        console.log("Response headers:", ResponseOrders.headers);

        if (!ResponseOrders.ok) {
            const errorText = await ResponseOrders.text();
            throw new Error(errorText || 'Не удалось загрузить заказы');
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
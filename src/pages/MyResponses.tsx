import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import {Badge, Cell, Headline, Placeholder, Tabbar} from '@telegram-apps/telegram-ui';
import styles from './MyOrdersPage.module.css';
import {useNavigate} from "react-router-dom";
import {OrderDetails} from "@/models/Order.ts";
import {getOrderById, getResponses} from "@/api/Orders.ts";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import UserIcon from "@/icons/user.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";


export const ResponsesPage: FC = () => {
    const navigate = useNavigate();
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [Error, SetError] = useState<string | null>(null);
    const [LoadOrder, SetNeworders] = useState<OrderDetails[]>([]);
     const [currentTabId, setCurrentTab] = useState<string>("responses");

    const initDataRaw = useSignal<string | undefined>(initData.raw);

    const tabs = [
        {
            id: "orders",
            text: "Заказы",
            Icon: OrdersIcon,
        },
        {
            id: "profile",
            text: "Профиль",
            Icon: UserIcon,
        },
        {
            id: "responses",
            text: "Отклики",
            Icon: ResponsesIcon,
        },
    ];


    useEffect(() => {
        const LoadOrders = async () => {
            try {
                if (!initDataRaw) {
                    SetError("Нет токена");
                    return
                }
                const data = await getResponses(initDataRaw);
                const responded: OrderDetails[] = [];
                for (const order of data) {
                    const detailed = await getOrderById(order.order_id, initDataRaw);
                    if (detailed) {
                        responded.push(detailed);
                    }
                }
                console.log("Сохраняем отклики в состояние MyResponses:", responded);
                console.log("Сохраняем заказы в состояние MyOrders:", data);
                SetNeworders(responded);
            } catch (err) {
                console.log(err);
                SetError("Не получили заказы");
            } finally {
                SetIsLoading(false);
            }
        };

        LoadOrders();
    }, []); // [initDataRaw]

    const HandleLinkFunc = (id: string) => {
        navigate(`/order/${id}`);
    }

    return (
        <Page back={false}>
            <div className={styles.Title}>
                <Headline weight="1"> Откликнутые заказы </Headline>
            </div>
            { IsLoading? (
                <div>Загружаем заказы...</div>
            ): Error? (
                <div>Ошибка(</div>
            ): LoadOrder.length == 0 ? (
                <div className={styles.noOrders}>
                    <Placeholder header="Нет ни одного заказа">
                        <img
                            alt="Telegram sticker"
                            className="blt0jZBzpxuR4oDhJc8s"
                            src="https://xelene.me/telegram.gif"
                        />
                    </Placeholder>
                </div>
            ) : (
                <div className={styles.orderList}>
                    {LoadOrder.map((order, index) => (
                        <Cell
                            key={index}
                            after={<Badge type="number">3</Badge>}
                            // before={<Avatar size={48} />}
                            description={order.description}
                            // subhead={order.}
                            // subtitle={order.min_price}
                            titleBadge={<Badge type="dot" />}
                            onClick={() => HandleLinkFunc(order.id)}
                        >
                            {order.title}
                        </Cell>
                    ))}
                </div>
            )}

            <Tabbar>
                {tabs.map(({ id, text, Icon }) => (
                    <Tabbar.Item
                        key={id}
                        text={text}
                        selected={id === currentTabId}
                        onClick={() => {
                            setCurrentTab(id);
                            if (id === "orders") {
                                navigate("/orders");
                            } else if (id === "profile") {
                                navigate("/profile");
                            }
                        }}
                    >
                        <Icon />
                    </Tabbar.Item>
                ))}
            </Tabbar>
        </Page>
    );
};

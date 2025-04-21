import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import {Badge, Cell, Headline, Placeholder, Tabbar, Pagination} from '@telegram-apps/telegram-ui';
import styles from './MyOrdersPage.module.css';
import {useNavigate} from "react-router-dom";
import {Order} from "@/models/Order.ts";
import {getOrders} from "@/api/Orders.ts";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import UserIcon from "@/icons/user.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";


export const MyOrdersPage: FC = () => {
    const navigate = useNavigate();
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [Error, SetError] = useState<string | null>(null);
    const [LoadOrder, SetNeworders] = useState<Order[]>([]);
    const [currentTabId, setCurrentTab] = useState<string>("orders");
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);

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
                const data = await getOrders(initDataRaw, 4, page);
                console.log("Сохраняем заказы в состояние MyOrders:", data);
                if (data == null) {
                    SetNeworders([])
                    setMaxPage(0)
                } else {
                    SetNeworders(data.Orders);
                    setMaxPage(data.Pages)
                }
            } catch (err) {
                console.log(err);
                SetError("Не получили заказы");
            } finally {
                SetIsLoading(false);
            }
        };

        LoadOrders();
    }, [page]); // [initDataRaw]

    const HandleLinkFunc = (id: string) => {
        navigate(`/order/${id}`);
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <Page back={false}>
            <div className={styles.Title}>
                <Headline weight="1"> Доступные заказы </Headline>
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
                <>
                    <div className={styles.orderList}>
                        {LoadOrder.map((order, index) => (
                            <Cell
                                key={index}
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
                    <div>
                        <Pagination className={styles.paginationContainer}
                                    count={maxPage}
                                    page={page}
                                    onChange={(_, newPage) => handlePageChange(newPage)} />
                    </div>
                </>
            )}

            <Tabbar>
                {tabs.map(({ id, text, Icon }) => (
                    <Tabbar.Item
                        key={id}
                        text={text}
                        selected={id === currentTabId}
                        onClick={() => {
                            setCurrentTab(id);
                            if (id === "profile") {
                                navigate("/profile");
                            } else if (id === "responses") {
                                navigate("/responses");
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

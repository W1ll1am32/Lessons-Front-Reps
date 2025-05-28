import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import {Badge, Cell, Headline, Placeholder, Spinner, Tabbar} from '@telegram-apps/telegram-ui';
import styles from './MyResponses.module.css';
import {useNavigate} from "react-router-dom";
import {Responses} from "@/models/Order.ts";
import {getResponses} from "@/api/Orders.ts";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import UserIcon from "@/icons/user.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";


export const ResponsesPage: FC = () => {
    const navigate = useNavigate();
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [Error, SetError] = useState<string | null>(null);
    const [LoadResponse, SetResponses] = useState<Responses[]>([]);
    const [currentTabId, setCurrentTab] = useState<string>("responses");
    const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

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
        const LoadResponses = async () => {
            try {
                if (!initDataRaw) {
                    SetError("Нет токена");
                    return
                }
                const data = await getResponses(initDataRaw);
                console.log("Сохраняем заказы в состояние MyOrders:", data);
                const sortedData = data.sort((a: Responses, b: Responses) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                SetResponses(sortedData);
            } catch (err) {
                console.log(err);
                SetError("Не получили заказы");
            } finally {
                SetIsLoading(false);
            }
        };

        LoadResponses();
    }, []); // [initDataRaw]

    const HandleLinkFunc = (id: string) => {
        navigate(`/order/${id}`);
    }

    const ToggleExpand = (id: string) => {
        setExpandedResponseId(expandedResponseId === id ? null : id);
    };

    return (
        <Page back={false}>
            <div className={styles.Title}>
                <Headline weight="1">Мои отклики</Headline>
            </div>
            { IsLoading? (
                <Spinner className={styles.spinner} size="l"/>
            ): Error? (
                <div>Ошибка(</div>
            ): LoadResponse.length == 0 ? (
                <div className={styles.noOrders}>
                    <Placeholder header="Нет ни одного отклика">
                        <img
                            alt="Telegram sticker"
                            className="blt0jZBzpxuR4oDhJc8s"
                            src="https://cdn.pixabay.com/animation/2022/07/29/03/42/03-42-05-37_512.gif"
                        />
                    </Placeholder>
                </div>
            ) : (
                <div className={styles.responseList}>
                    {LoadResponse.map((response) => (
                        <div key={response.id} className={styles.responseBlock}>
                            <Cell
                                onClick={() => ToggleExpand(response.id)}
                                titleBadge={<div>{response.is_final && (<Badge type="dot" />) }</div>}
                                after={
                                    <span>{expandedResponseId === response.id ? '▲' : '▼'}</span>
                                }
                            >
                                Отклик {new Date(response.created_at).toLocaleString("ru-RU", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }) || 'Неизвестно'}
                            </Cell>
                            <div
                                className={`${styles.responseDetails} ${
                                    expandedResponseId === response.id ? styles.expanded : styles.collapsed
                                }`}
                            >
                                <div className={styles.responseDetailsInner}>
                                    <div className={styles.detailItem}>
                                        <span
                                            className={styles.orderId}
                                            onClick={() => HandleLinkFunc(response.order_id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === 'Space') {
                                                    HandleLinkFunc(response.order_id);
                                                }
                                            }}
                                            aria-label={`Перейти к заказу ${response.order_id}`}
                                        >
                      Перейти к заказу
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
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

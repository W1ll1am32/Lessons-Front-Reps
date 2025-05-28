import {FC, useEffect, useState} from 'react';
import { Page } from '@/components/Page';
import {Banner, Headline, Placeholder, Tabbar, Pagination, Select, Spinner} from '@telegram-apps/telegram-ui';
import {MultiselectOption} from "@telegram-apps/telegram-ui/dist/components/Form/Multiselect/types";
import styles from './MyOrdersPage.module.css';
import {useNavigate} from "react-router-dom";
import {Order} from "@/models/Order.ts";
import {getOrders} from "@/api/Orders.ts";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import UserIcon from "@/icons/user.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";
import text_tags from "./Tags.txt";


export const MyOrdersPage: FC = () => {
    const navigate = useNavigate();
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [Error, SetError] = useState<string | null>(null);
    const [LoadOrder, SetNeworders] = useState<Order[]>([]);
    const [currentTabId, setCurrentTab] = useState<string>("orders");
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [availableTags, setOptions] = useState<MultiselectOption[]>([]);

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
        const fetchTags = async () => {
            try {
                const response = await fetch(text_tags, {
                    headers: {
                        Accept: "text/plain; charset=utf-8",
                    },
                });
                if (!response.ok) {
                    // @ts-ignore
                    throw new Error("Failed to fetch tags.txt");
                }
                const text = await response.text();
                const tagsArray = text
                    .replace(/\r\n/g, "\n")
                    .split("\n\n")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                const fetchedOptions: MultiselectOption[] = tagsArray.map(tag => ({
                    value: tag.toLowerCase().replace(/\s+/g, '_'), // Convert to lowercase and replace spaces with underscores
                    label: tag,
                }));
                console.log('Fetchnul:', fetchedOptions);
                setOptions(fetchedOptions);
            } catch (error) {
                console.error('Error fetching tags:', error);
                // Fallback to default options if fetch fails
                setOptions([
                    { value: 'cpp', label: 'C++' },
                    { value: 'python', label: 'Python' },
                ]);
            }
        };

        fetchTags();
    }, []);

    useEffect(() => {
        const LoadOrders = async () => {
            try {
                if (!initDataRaw) {
                    SetError("Нет токена");
                    return
                }
                const data = await getOrders(initDataRaw, 3, page, selectedTag);
                console.log("Load Orders:", data);
                /*
                const mock : Order = {
                    id: 'string',
                    student_id: 'string',
                    title: 'ssssssssssssssssssssssssssssssssssssssssssssssssstring',
                    description: 'string',
                    tags: ['sssssssssssssssssssssssssssssssssssssssssstring', 'string1', 'string2'],
                    min_price: 0,
                    max_price: 1000,
                    status: 'string',
                    response_count: 0,
                    created_at: 'string',
                    updated_at: 'string',
                    is_responsed: false,
                }
                */
                if (data == null || data.Orders == null) {
                    SetNeworders([]);
                    setMaxPage(1);
                } else {
                    SetNeworders(data.Orders.map((order: Order) => ({
                        ...order,
                        title: order.title.length > 40 ? order.title.slice(0, 40) + '...' : order.title,
                        description:
                            order.description.length > 40
                                ? order.description.slice(0, 40) + '...'
                                : order.description})));
                    setMaxPage(data.Pages);
                }
            } catch (err) {
                console.log(err);
                SetError("Не получили заказы");
            } finally {
                SetIsLoading(false);
            }
        };

        LoadOrders();
    }, [page, selectedTag]); // [initDataRaw]

    const HandleLinkFunc = (id: string) => {
        navigate(`/order/${id}`);
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleTagChange = (value: string) => {
        setSelectedTag(value || null);
        setPage(1);
    };

    return (
        <Page back={false}>
            <div className={styles.Title}>
                <Headline weight="1"> Доступные заказы </Headline>
            </div>
            <div className={styles.tagSelector}>
                <Select
                    className={styles.selectArea}
                    value={selectedTag || ''}
                    onChange={(e) => handleTagChange(e.target.value)}
                >
                    <option value="">Все теги</option>
                    {availableTags.map((tag) => (
                        <option key={tag.value} value={tag.value}>
                            {tag.label}
                        </option>
                    ))}
                </Select>
            </div>
            { IsLoading? (
                <Spinner className={styles.spinner} size="l"/>
            ): LoadOrder.length == 0 ? (
                <div className={styles.noOrders}>
                    <Placeholder header="Нет ни одного заказа">
                        <img
                            alt="Telegram sticker"
                            className="blt0jZBzpxuR4oDhJc8s"
                            src="https://cdn.pixabay.com/animation/2022/07/29/03/42/03-42-05-37_512.gif"
                        />
                    </Placeholder>
                </div>
            ) : (
                <>
                    <div className={styles.orderList}>
                        {LoadOrder.map((order, index) => (
                            <Banner
                                key={index}
                                // after={<Badge type="number">{order.response_count}</Badge>}
                                // before={<Avatar size={48} />}
                                header={order.title}
                                subheader={'Цена мин: ' + order.min_price + ' макс: ' + order.max_price}
                                description={order.description}
                                className={styles.orderItem}
                                // subhead={order.}
                                // subtitle={order.min_price}
                                // titleBadge={order.status == "New" ? <Badge type="dot"/>: <Badge type="dot"/>}
                                onClick={() => HandleLinkFunc(order.id)}
                            >
                                <div className={styles.bannerContent}>
                                    {order.tags && order.tags.length > 0 && (
                                        <div className={styles.tagsContainer}>
                                            {order.tags.map((tag, tagIndex) => (
                                                <span key={tagIndex} className={styles.tag}>
                {tag
                    .replace(/_/g, ' ') // Replace underscores with spaces
                    .split(' ') // Split into words
                    .map((word, index) =>
                        index === 0
                            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            : word.toLowerCase()
                    ) // Capitalize first letter of first word, lowercase others
                    .join(' ')}
            </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Banner>
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

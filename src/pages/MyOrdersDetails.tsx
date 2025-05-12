import {FC, useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import {Button, Headline, Input, Spinner} from '@telegram-apps/telegram-ui';
import {OrderDetails} from "@/models/Order.ts";
import {getOrderById, responseOrder} from "@/api/Orders.ts";
import {useNavigate} from "react-router-dom";
import {initData, mainButton, useSignal} from "@telegram-apps/sdk-react";

import styles from "./MyOrdersDetails.module.css"
import {ValidateInitData} from "@/api/auth.tsx";


export const OrderDetailsPage: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showResponseForm, setShowResponseForm] = useState(false);
    const [responseText, setResponseText] = useState('Здравствуйте! Давно занимаюсь этой темой и могу помочь');
    const initDataRaw = useSignal<string | undefined>(initData.raw);
// Сработало 4.01 в 01:41 без передачи здесь initDataRaw - при этом на бэк он пришел правильный. почему?

    useEffect(() => {
        const authenticate = async () => {
            if (!initDataRaw) {
                alert('Ошибка авторизации.');
                return;
            }
            try {
                // navigate('/orders');
                // Класть init data куда-то?
                const request_status = await ValidateInitData(initDataRaw);
                if (!request_status) {
                    console.error('Authorization failed');
                    alert('Не удалось выполнить авторизацию.');
                }
            } catch (error) {
                console.error('Authorization failed:', error);
                alert('Не удалось выполнить авторизацию.');
            }
        };

        authenticate();
    }, [initDataRaw, navigate]);

    useEffect(() => {
        const currentOrder = async () => {
            if (id) {
                try {
                    if (!initDataRaw) {
                        setError("Нет токена");
                        return
                    }
                    const OrderData = await getOrderById(id, initDataRaw);
                    console.log("data", OrderData);
                    setOrder(OrderData);
                } catch (err) {
                    setError('Не удалось получить заказ');
                } finally {
                    setIsLoading(false);
                }
            }
        }
        currentOrder();
    }, [id, initDataRaw]);
    
    useEffect(() => {
        if (!mainButton.isMounted()) {
            mainButton.mount();
        }
        if (!isLoading) {
            if (mainButton.setParams.isAvailable()) {
                mainButton.setParams({
                    text: 'Откликнуться',
                    // убрать в отдельную проверку!
                    // нужен ли ref?
                    isEnabled: true,//titleRef.current.trim() !== '' && descriptionRef.current.trim() !== '' && tagsRef.current.length > 0, // прикол
                    isVisible: !order?.is_responsed, // Show only when order is loaded and not responded
                });
            }
        } else {
            mainButton.setParams({
                isVisible: false,
                isEnabled: false,
            });
        }

        const offClick = mainButton.onClick(async () => {
            setShowResponseForm(true);
            mainButton.setParams({
                isVisible: false
            });
        });

        return () => {
                offClick();
                mainButton.setParams({
                    isVisible: false,
                    isEnabled: false,
                });
                console.log("удаляем...");
                mainButton.unmount();
            }
    }, [isLoading, order]);

    const handleSubmitResponse = async () => {
        if (!id || !initDataRaw || !responseText.trim()) return;

        try {
            mainButton.setParams({
                isLoaderVisible: true,
                isEnabled: false
            });

            const text = await responseOrder(id, initDataRaw, responseText);
            alert('Отклик на заказ: ' + text);
            setShowResponseForm(false);
            navigate(`/orders`);
        } catch (error) {
            alert('Ошибка отклика на заказ');
        } finally {
            mainButton.setParams({
                isLoaderVisible: false,
                isEnabled: true
            });
        }
    };

    return (
        <Page back={true}>
            <div className={styles.container}>
                { error ? (
                    <div className={styles.error}>
                        Извините, возникла ошибка при получении этого заказа: {error}
                    </div>
                ): isLoading ? (
                    <Spinner className={styles.spinner} size="l"/>
                    // {' '}
                    // <br />
                ): !order ? (
                    <Headline weight="1">Заказа не существует</Headline>
                ) : (
                    <>
                        <Headline weight="2" className={styles.centeredHeadline}>
                            Детали заказа
                        </Headline>
                        <div className={styles.orderDetails}>
                            <Headline weight="1">{order.title}</Headline>
                            <p>Минимальная цена: {order.min_price}</p>
                            <p>Максимальная цена: {order.max_price}</p>
                            <p>Имя: {order.name}</p>
                            <p>Описание: {order.description}</p>
                            <p>Создан: {new Date(order.created_at).toLocaleString("ru-RU", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }) || 'Неизвестно'}</p>
                        </div>

                        {showResponseForm && (
                            <div className={styles.responseForm}>
                                <Input
                                    header="Ваш отклик"
                                    placeholder="Введите текст отклика..."
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                />
                                <Button
                                    style={{ marginTop: '1rem' }}
                                    onClick={handleSubmitResponse}
                                    disabled={!responseText.trim()}
                                >
                                    Отправить отклик
                                </Button>
                                <Button
                                    mode="plain"
                                    style={{ marginTop: '0.5rem' }}
                                    onClick={() => {
                                        setShowResponseForm(false);
                                        mainButton.setParams({ isVisible: true });
                                    }}
                                >
                                    Отмена
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Page>
    )
};

import {FC, useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import {Headline, Spinner} from '@telegram-apps/telegram-ui';
import {OrderDetails} from "@/models/Order.ts";
import {getOrderById, responseOrder} from "@/api/Orders.ts";
import {useNavigate} from "react-router-dom";
import {initData, mainButton, useSignal} from "@telegram-apps/sdk-react";

import styles from "./MyOrdersDetails.module.css"


export const OrderDetailsPage: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const initDataRaw = useSignal<string | undefined>(initData.raw);
// Сработало 4.01 в 01:41 без передачи здесь initDataRaw - при этом на бэк он пришел правильный. почему?

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
        if (mainButton.setParams.isAvailable()) {
            mainButton.setParams({
                text: 'Response',
                // убрать в отдельную проверку!
                // нужен ли ref?
                isEnabled: true,//titleRef.current.trim() !== '' && descriptionRef.current.trim() !== '' && tagsRef.current.length > 0, // прикол
                isVisible: true
            });
        }

        const offClick = mainButton.onClick(async () => {

            mainButton.setParams({
                isLoaderVisible: true,
                isEnabled: false
            });

            try {
                if (id && initDataRaw) {
                    const text = await responseOrder(id, initDataRaw);
                    alert('Отклик на заказ: ' + text);
                    navigate(`/orders`);
                }
            } catch (error) {
                alert('Ошибка отклика на заказ');
            } finally {
                mainButton.setParams({ isLoaderVisible: false, isEnabled: true });
            }

            mainButton.setParams({
                isLoaderVisible: false,
                isEnabled: true
            });

            navigate(`/orders`);
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
    }, []);

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
                        <Headline weight="2">Детали заказа</Headline>
                        <div className={styles.orderDetails}>
                        <Headline weight="1">{order.title}</Headline>
                        <p>Ставка: {order.min_price} - {order.max_price}</p>
                        <p>Описание: {order.description}</p>
                        </div>
                    </>
                )}
            </div>
        </Page>
    )
};

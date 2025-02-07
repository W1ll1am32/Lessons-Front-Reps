import { useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { initData, useSignal } from '@telegram-apps/sdk-react';
// import { ValidateInitData } from '@/api/auth';

export const StartPage: FC = () => {
    const initDataRaw = useSignal<string | undefined>(initData.raw);
    const navigate = useNavigate();

    useEffect(() => {
        const authenticate = async () => {
            if (!initDataRaw) {
                alert('Ошибка авторизации.');
                return;
            }
            try {
                navigate('/orders');
                // Класть init data куда-то?
                // const request_status = await ValidateInitData(initDataRaw);
                // if (request_status) {
                //     navigate('/orders');
                // }
                // console.error('Authorization failed');
                // alert('Не удалось выполнить авторизацию.');
            } catch (error) {
                console.error('Authorization failed:', error);
                alert('Не удалось выполнить авторизацию.');
            }
        };

        authenticate();
    }, [initDataRaw, navigate]);

    return <p>Проверка авторизации...</p>;
};
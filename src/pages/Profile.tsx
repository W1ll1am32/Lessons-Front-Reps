import { FC, useState } from "react";
import { Page } from "@/components/Page";
import { Headline, Avatar, Button, Tabbar, Input } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import {initData, useSignal} from "@telegram-apps/sdk-react";
import { setName, setBio, setStatus } from "@/api/Orders.ts";
import styles from "./ProfilePage.module.css";
import UserIcon from "@/icons/user.tsx";
import EditIcon from "@/icons/edit.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";


export const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [currentTabId, setCurrentTab] = useState<string>("profile");
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [user, setUser] = useState({
        name: "Test",
        username: "test",
        avatar: "https://via.placeholder.com/100",
        description: "Test description.",
        isActive: true,
    });

    const [editedUser, setEditedUser] = useState(user);
    const initDataRaw = useSignal<string | undefined>(initData.raw);

    const handleSaveName = async () => {
        try {
            await setName(initDataRaw, editedUser.name);
            setUser({ ...user, name: editedUser.name });
            setIsEditingName(false);
        } catch (err) {
            console.error("Error updating name:", err);
        }
    };

    const handleSaveDescription = async () => {
        try {
            await setBio(user.username, editedUser.description);
            setUser({ ...user, description: editedUser.description });
            setIsEditingDescription(false);
        } catch (err) {
            console.error("Error updating bio:", err);
        }
    };

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleEditDescription = () => {
        setIsEditingDescription(true);
    };

    const handleToggleStatus = async () => {
        const newStatus = !user.isActive;
        try {
            await setStatus(user.username, newStatus);
            setUser({ ...user, isActive: newStatus });
            setEditedUser({ ...editedUser, isActive: newStatus });
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

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

    return (
        <Page back={true}>
            <div className={styles.profileContainer}>
                <Avatar src={user.avatar} />
                <p>@{user.username}</p>
                {isEditingName  ? (
                    <Input
                        header="Имя"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        placeholder="Введите имя"
                    />
                ) : (
                    <Headline weight="1">
                        {user.name}{" "}
                        <EditIcon onClick={handleEditName} style={{ cursor: "pointer" }} />
                    </Headline>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                    <p className={styles.statusText}>
                        Status: {user.isActive ? "Active" : "Inactive"}
                    </p>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={user.isActive}
                            onChange={handleToggleStatus}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
                {isEditingDescription ? (
                    <div className={styles.descriptionEditContainer}>
                        <textarea
                            className={styles.descriptionTextarea}
                            value={editedUser.description}
                            onChange={(e) => setEditedUser({ ...editedUser, description: e.target.value })}
                            placeholder="Введите описание"
                            rows={4}
                        />
                    </div>
                ) : (
                    <div className={styles.profileDescription}>{user.description}</div>
                )}
                {isEditingName ? (
                    <Button onClick={handleSaveName}>Сохранить имя</Button>
                ) : isEditingDescription ? (
                    <Button onClick={handleSaveDescription}>Сохранить описание</Button>
                ) : (
                    <Button onClick={handleEditDescription}>Изменить описание</Button>
                )}
            </div>
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

export default ProfilePage;

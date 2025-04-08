import { FC, useState } from "react";
import { Page } from "@/components/Page";
import { Headline, Avatar, Button, Tabbar, Input } from "@telegram-apps/telegram-ui";
import { Icon32ProfileColoredSquare  } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
import { Icon28Archive  } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";

export const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [currentTabId, setCurrentTab] = useState<string>("profile");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [user, setUser] = useState({
        name: "Test",
        username: "test",
        avatar: "https://via.placeholder.com/100",
        description: "Test description."
    });

    const [editedUser, setEditedUser] = useState(user);

    const handleSave = () => {
        setUser(editedUser);
        setIsEditing(false);
    };

    const tabs = [
        {
            id: "orders",
            text: "Заказы",
            Icon: Icon28Archive,
        },
        {
            id: "profile",
            text: "Профиль",
            Icon: Icon32ProfileColoredSquare,
        },
        {
            id: "responses",
            text: "Отклики",
            Icon: Icon32ProfileColoredSquare,
        },
    ];

    return (
        <Page back={true}>
            <div className={styles.profileContainer}>
                <Avatar src={user.avatar} />
                <p>@{user.username}</p>
                {isEditing ? (
                    <Input
                        header="Имя"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        placeholder="Введите имя"
                    />
                ) : (
                    <Headline weight="1">{user.name}</Headline>
                )}
                {isEditing ? (
                    <Input
                        header="Описание"
                        value={editedUser.description}
                        onChange={(e) => setEditedUser({ ...editedUser, description: e.target.value })}
                        placeholder="Введите описание"
                    />
                ) : (
                    <div className={styles.profileDescription}>{user.description}</div>
                )}
                <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
                    {isEditing ? "Save" : "Edit Profile"}
                </Button>
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

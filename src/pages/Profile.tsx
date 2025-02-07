import { FC, useState } from "react";
import { Page } from "@/components/Page";
import { Headline, Avatar, Button, Tabbar } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import styles from "./ProfilePage.module.css";

export const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [currentTabId, setCurrentTab] = useState<string>("profile");

    const user = {
        name: "Test",
        username: "test",
        avatar: "https://via.placeholder.com/100",
    };

    const tabs = [
        {
            id: "orders",
            text: "Orders",
        },
    ];

    return (
        <Page back={true}>
            <div className={styles.profileContainer}>
                <Avatar src={user.avatar} />
                <Headline weight="1">{user.name}</Headline>
                <p>@{user.username}</p>
                <Button onClick={() => alert("Edit Profile Clicked")}>Edit Profile</Button>
            </div>
            <Tabbar>
                {tabs.map(({ id, text }) => (
                    <Tabbar.Item
                        key={id}
                        text={text}
                        selected={id === currentTabId}
                        onClick={() => {
                            setCurrentTab(id);
                            navigate("/orders");
                        }}
                    />
                ))}
            </Tabbar>
        </Page>
    );
};

export default ProfilePage;

import { FC, useEffect, useState } from "react";
import { Page } from "@/components/Page";
import {
    Headline,
    Avatar,
    Button,
    Tabbar,
    Input,
    Modal,
    List,
    Cell,
    Checkbox,
} from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import { setName, setBio, setStatus, getProfile, setTags } from "@/api/Orders.ts";
import styles from "./ProfilePage.module.css";
import UserIcon from "@/icons/user.tsx";
import EditIcon from "@/icons/edit.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";
import text_tags from "./Tags.txt";

export const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [currentTabId, setCurrentTab] = useState<string>("profile");
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);
    const [tagSearch, setTagSearch] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [user, setUser] = useState({
        name: "Test",
        username: 0,
        avatar: "https://via.placeholder.com/100",
        description: "Test description.",
        isActive: true,
        tags: [] as string[],
        responseCount: 0,
    });

    const [editedUser, setEditedUser] = useState(user);
    const [selectedTags, setSelectedTags] = useState<string[]>(user.tags);
    const initDataRaw = useSignal<string | undefined>(initData.raw);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch(text_tags, {
                    headers: {
                        Accept: "text/plain; charset=utf-8",
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch tags.txt");
                }
                const text = await response.text();
                const tags = text
                    .replace(/\r\n/g, "\n")
                    .split("\n\n")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                setAvailableTags(tags);
            } catch (err) {
                console.error("Error fetching tags:", err);
            }
        };

        fetchTags();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfile(initDataRaw);
                if (profile) {
                    setUser({
                        name: profile.Tutor.name,
                        username: profile.Tutor.telegram_id,
                        avatar: "https://via.placeholder.com/100",
                        description: profile.Bio,
                        isActive: profile.IsActive,
                        tags: profile.Tags || [],
                        responseCount: profile.ResponseCount || 0,
                    });
                    setEditedUser({
                        name: profile.Tutor.name,
                        username: profile.Tutor.telegram_id,
                        avatar: "https://via.placeholder.com/100",
                        description: profile.Bio,
                        isActive: profile.IsActive,
                        tags: profile.Tags || [],
                        responseCount: profile.ResponseCount || 0,
                    });
                    setSelectedTags(profile.Tags || []);
                } else {
                    console.error("Failed to fetch profile or user not authenticated");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchProfile();
    }, [initDataRaw]);

    const handleSaveName = async () => {
        try {
            const status = await setName(initDataRaw, editedUser.name);
            if (status) {
                setUser({ ...user, name: editedUser.name });
                setIsEditingName(false);
            } else {
                throw new Error("Не удалось поменять имя");
            }
        } catch (err) {
            console.error("Error updating name:", err);
        }
    };

    const handleSaveDescription = async () => {
        try {
            const status = await setBio(initDataRaw, editedUser.description);
            if (status) {
                setUser({ ...user, description: editedUser.description });
                setIsEditingDescription(false);
            } else {
                throw new Error("Не удалось поменять описание");
            }
        } catch (err) {
            console.error("Error updating bio:", err);
        }
    };

    const handleSaveTags = async () => {
        try {
            console.error("Сохран Тэги:", selectedTags);
            const status = await setTags(initDataRaw, selectedTags);
            if (status) {
                setUser({ ...user, tags: selectedTags });
                setEditedUser({ ...editedUser, tags: selectedTags });
                setIsTagModalOpen(false);
            } else {
                throw new Error("Не удалось сохранить теги");
            }
        } catch (err) {
            console.error("Error updating tags:", err);
            alert("Ошибка при сохранении тэгов");
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
            const status = await setStatus(initDataRaw, newStatus);
            if (status) {
                setUser({ ...user, isActive: newStatus });
                setEditedUser({ ...editedUser, isActive: newStatus });
            } else {
                throw new Error("Не удалось поменять статус");
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleTagDelete = async (tag: string) => {
        const newTags = selectedTags.filter((t) => t !== tag);
        setSelectedTags(newTags);
        try {
            const status = await setTags(initDataRaw, newTags);
            if (status) {
                setUser({ ...user, tags: newTags });
                setEditedUser({ ...editedUser, tags: newTags });
            } else {
                throw new Error("Не удалось удалить тег");
            }
        } catch (err) {
            console.error("Error deleting tag:", err);
            alert("Ошибка при удалении тэга");
        }
    };

    const filteredTags = availableTags.filter((tag) =>
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const tabs = [
        { id: "orders", text: "Заказы", Icon: OrdersIcon },
        { id: "profile", text: "Профиль", Icon: UserIcon },
        { id: "responses", text: "Отклики", Icon: ResponsesIcon },
    ];

    return (
        <Page back={true}>
            <div className={styles.profileContainer}>
                <Avatar src={user.avatar} />
                <p>@{user.username}</p>
                {isEditingName ? (
                    <Input
                        header="Имя"
                        value={editedUser.name}
                        onChange={(e) =>
                            setEditedUser({ ...editedUser, name: e.target.value })
                        }
                        placeholder="Введите имя"
                    />
                ) : (
                    <Headline weight="1">
                        {user.name}{" "}
                        <EditIcon
                            onClick={handleEditName}
                            style={{ cursor: "pointer" }}
                        />
                    </Headline>
                )}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "8px",
                    }}
                >
                    <p className={styles.statusText}>
                        Статус профиля: {user.isActive ? "Активный" : "Неактивный"}
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
                <div className={styles.responsesContainer}>
                    <Headline weight="2" style={{ marginBottom: "8px" }}>
                        Отклики
                    </Headline>
                    <p>{user.responseCount} откликов</p>
                </div>
                <div className={styles.tagsContainer}>
                    <Headline weight="2" style={{ marginBottom: "8px" }}>
                        Тэги
                    </Headline>
                    {user.tags.length > 0 ? (
                        <div className={styles.tagList}>
                            {user.tags.map((tag) => (
                                <div key={tag} className={styles.tagChip}>
                                    <span>{tag}</span>
                                    <button
                                        className={styles.tagDelete}
                                        onClick={() => handleTagDelete(tag)}
                                        aria-label={`Удалить тэг ${tag}`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Нет тэгов</p>
                    )}
                    <Button onClick={() => setIsTagModalOpen(true)}>Изменить Тэги</Button>
                </div>
                {isEditingDescription ? (
                    <div className={styles.descriptionEditContainer}>
            <textarea
                className={styles.descriptionTextarea}
                value={editedUser.description}
                onChange={(e) =>
                    setEditedUser({ ...editedUser, description: e.target.value })
                }
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
            <Modal open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
                <div
                    style={{
                        padding: "16px",
                        borderBottom: "1px solid var(--tgui--neutral_300)",
                    }}
                >
                    <Headline weight="1">Выберите Тэги</Headline>
                </div>
                <div style={{ padding: "16px" }}>
                    <Input
                        header="Поиск"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Поиск тэга"
                    />
                    <List style={{ maxHeight: "300px", overflowY: "auto", marginTop: "16px" }}>
                        {filteredTags.map((tag) => (
                            <Cell
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                style={{ cursor: "pointer" }}
                                before={
                                    <Checkbox
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                    />
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleTagToggle(tag);
                                        e.preventDefault();
                                    }
                                }}
                            >
                                {tag}
                            </Cell>
                        ))}
                    </List>
                    <Button onClick={handleSaveTags} style={{ marginTop: "16px" }}>
                        Сохранить
                    </Button>
                </div>
            </Modal>
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
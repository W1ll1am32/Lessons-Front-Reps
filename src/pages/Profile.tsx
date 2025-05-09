import { FC, useEffect, useState, useRef } from "react";
import { Page } from "@/components/Page";
import {
    Headline,
    Button,
    Tabbar,
    Input,
    Modal,
    List,
    Cell,
    Checkbox, Spinner,
} from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router-dom";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import {setName, setBio, setStatus, getProfile, setTags, setReviewStatus} from "@/api/Orders.ts";
import styles from "./ProfilePage.module.css";
import UserIcon from "@/icons/user.tsx";
import EditIcon from "@/icons/edit.tsx";
import OrdersIcon from "@/icons/orders.tsx";
import ResponsesIcon from "@/icons/responses.tsx";
import text_tags from "./Tags.txt";
import {Review} from "@/models/Order.ts";

export const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [IsLoading, SetIsLoading] = useState<boolean>(true);
    const [currentTabId, setCurrentTab] = useState<string>("profile");
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);
    const [tagSearch, setTagSearch] = useState<string>("");
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [expandedReviews, setExpandedReviews] = useState<string[]>([]); // Track expanded reviews
    const [user, setUser] = useState({
        name: "Test",
        username: 0,
        avatar: "https://via.placeholder.com/100",
        description: "Test description.",
        isActive: true,
        tags: [] as string[],
        responseCount: 0,
        reviews: [] as Review[], // Add reviews field
    });

    const [editedUser, setEditedUser] = useState(user);
    const [selectedTags, setSelectedTags] = useState<string[]>(user.tags);
    const initDataRaw = useSignal<string | undefined>(initData.raw);
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

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
                        name: profile.Tutor.Name || "Ваше имя",
                        username: profile.Tutor.TelegramId,
                        avatar: "https://via.placeholder.com/100",
                        description: profile.Bio || "Здесь Ваше описание",
                        isActive: profile.IsActive,
                        tags: profile.Tags || [],
                        responseCount: profile.ResponseCount || 0,
                        reviews: profile.Reviews || [], // Add reviews
                    });
                    setEditedUser({
                        name: profile.Tutor.Name || "Ваше имя",
                        username: profile.Tutor.TelegramId,
                        avatar: "https://via.placeholder.com/100",
                        description: profile.Bio || "Здесь Ваше описание",
                        isActive: profile.IsActive,
                        tags: profile.Tags || [],
                        responseCount: profile.ResponseCount || 0,
                        reviews: profile.Reviews || [], // Add reviews
                    });
                    setSelectedTags(profile.Tags || []);
                } else {
                    console.error("Failed to fetch profile or user not authenticated");
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                SetIsLoading(false);
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
            const transformedTags = selectedTags.map(tag =>
                tag.toLowerCase().replace(/\s+/g, '_')
            );
            const status = await setTags(initDataRaw, transformedTags);
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

    const handleActivateReview = async (reviewId: string) => {
        try {
            const status = await setReviewStatus(initDataRaw, reviewId); // Activate review
            if (status) {
                const updatedReviews = user.reviews.map((review) =>
                    review.id === reviewId ? { ...review, is_active: true } : review
                );
                setUser({ ...user, reviews: updatedReviews });
                setEditedUser({ ...editedUser, reviews: updatedReviews });
            } else {
                throw new Error("Не удалось активировать отзыв");
            }
        } catch (err) {
            console.error("Error activating review:", err);
            alert("Ошибка при активации отзыва");
        }
    };

    const handleToggleReview = (reviewId: string) => {
        setExpandedReviews((prev) =>
            prev.includes(reviewId)
                ? prev.filter((id) => id !== reviewId)
                : [...prev, reviewId]
        );
    };

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleEditDescription = () => {
        setIsEditingDescription(true);
        // Optionally, focus the textarea when editing starts
        setTimeout(() => {
            if (descriptionTextareaRef.current) {
                descriptionTextareaRef.current.focus();
                descriptionTextareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 100); // Delay to ensure textarea is rendered
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
        <Page back={false}>
            { IsLoading? (
                <Spinner className={styles.spinner} size="l"/>
            ): (
                <>
                <div className={styles.profileContainer}>
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
                            Теги
                        </Headline>
                        {user.tags.length > 0 ? (
                            <div className={styles.tagList}>
                                {user.tags.map((tag) => (
                                    <div key={tag} className={styles.tagChip}>
                                        <span>{tag}</span>
                                        <button
                                            className={styles.tagDelete}
                                            onClick={() => handleTagDelete(tag)}
                                            aria-label={`Удалить тег ${tag}`}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Нет тегов</p>
                        )}
                        <Button onClick={() => setIsTagModalOpen(true)}>Изменить Теги</Button>
                    </div>
                    <div className={styles.reviewsContainer}>
                        <Headline weight="2" style={{ marginBottom: "8px" }}>
                            Отзывы
                        </Headline>
                        {user.reviews.length > 0 ? (
                            <List>
                                {user.reviews.map((review) => {
                                    const isExpanded = expandedReviews.includes(review.id);
                                    const previewComment =
                                        review.comment.length > 50
                                            ? review.comment.substring(0, 50) + "..."
                                            : review.comment;

                                    return (
                                        <Cell
                                            key={review.id}
                                            onClick={() => handleToggleReview(review.id)}
                                            style={{ cursor: "pointer" }}
                                            after={
                                                <span>{isExpanded ? '▲' : '▼'}</span>
                                            }
                                        >
                                            <div>
                                                <p>
                                                    <strong>Рейтинг:</strong> {review.rating}/5
                                                </p>
                                                <p>
                                                    <strong>Комментарий:</strong>{" "}
                                                    {isExpanded ? review.comment : previewComment}
                                                </p>
                                                {isExpanded && (
                                                    <>
                                                        <p>
                                                            <strong>Дата и время:</strong>{" "}
                                                            {new Date(review.created_at).toLocaleString("ru-RU", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                        <p>
                                                            <strong>Статус:</strong>{" "}
                                                            {review.is_active ? "Активен" : "Неактивен"}
                                                        </p>
                                                        {!review.is_active && (
                                                            <Button
                                                                size="s"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent triggering collapse
                                                                    handleActivateReview(review.id);
                                                                }}
                                                                style={{ marginTop: "8px" }}
                                                            >
                                                                Активировать
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </Cell>
                                    );
                                })}
                            </List>
                        ) : (
                            <p>Нет отзывов</p>
                        )}
                    </div>
                    {isEditingDescription ? (
                        <div className={styles.descriptionEditContainer}>
                <textarea
                    ref={descriptionTextareaRef} // Attach ref
                    className={styles.descriptionTextarea}
                    value={editedUser.description}
                    onChange={(e) =>
                        setEditedUser({ ...editedUser, description: e.target.value })
                    }
                    onFocus={() => {
                        // Scroll textarea into view when focused
                        if (descriptionTextareaRef.current) {
                            descriptionTextareaRef.current.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                        }
                    }}
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
                        <Headline weight="1">Выберите Теги</Headline>
                    </div>
                    <div style={{ padding: "16px" }}>
                        <Input
                            header="Поиск"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            placeholder="Поиск тега"
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
                </>
            )}
            <Tabbar className={styles.tabbar}>
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
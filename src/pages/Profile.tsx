import { FC, useEffect, useState, useRef } from 'react';
import { Page } from '@/components/Page';
import {
    Headline,
    Button,
    Tabbar,
    Input,
    Modal,
    List,
    Cell,
    Checkbox,
    Spinner,
} from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import { initData, useSignal, openTelegramLink } from '@telegram-apps/sdk-react';
import { setName, setBio, setStatus, getProfile, setTags, setReviewStatus } from '@/api/Orders.ts';
import styles from './ProfilePage.module.css';
import UserIcon from '@/icons/user.tsx';
import EditIcon from '@/icons/edit.tsx';
import OrdersIcon from '@/icons/orders.tsx';
import ResponsesIcon from '@/icons/responses.tsx';
import text_tags from './Tags.txt';
import { Review } from '@/models/Order.ts';

export const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentTabId, setCurrentTab] = useState<string>('profile');
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);
    const [tagSearch, setTagSearch] = useState<string>('');
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
    const [hasEditedTags, setHasEditedTags] = useState<boolean>(false);

    const [user, setUser] = useState({
        name: 'Test',
        username: 0,
        avatar: 'https://via.placeholder.com/100',
        description: 'Test description.',
        isActive: true,
        tags: [] as string[],
        responseCount: 0,
        reviews: [] as Review[],
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
        const formatTagForDisplay = (tag: string): string => {
            const withSpaces = tag.replace(/_/g, ' '); // Replace underscores with spaces
            return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase(); // Capitalize first letter, lowercase the rest
        };
        const fetchProfile = async () => {
            try {
                const profile = await getProfile(initDataRaw);
                if (profile) {
                    const formattedTags = profile.Tags
                        ? profile.Tags.map((tag: string) => formatTagForDisplay(tag))
                        : [];
                    setUser({
                        name: profile.Tutor.Name || 'Ваше имя',
                        username: profile.Tutor.TelegramId,
                        avatar: 'https://via.placeholder.com/100',
                        description: profile.Bio || 'Здесь Ваше описание',
                        isActive: profile.IsActive,
                        tags: formattedTags,
                        responseCount: profile.ResponseCount || 0,
                        reviews: profile.Reviews || [],
                    });
                    setEditedUser({
                        name: profile.Tutor.Name || 'Ваше имя',
                        username: profile.Tutor.TelegramId,
                        avatar: 'https://via.placeholder.com/100',
                        description: profile.Bio || 'Здесь Ваше описание',
                        isActive: profile.IsActive,
                        tags: formattedTags,
                        responseCount: profile.ResponseCount || 0,
                        reviews: profile.Reviews || [],
                    });
                    setSelectedTags(formattedTags);
                    if (formattedTags.length) {
                        setHasEditedTags(true);
                    }
                } else {
                    console.error('Failed to fetch profile or user not authenticated');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setIsLoading(false);
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
                throw new Error('Не удалось поменять имя');
            }
        } catch (err) {
            console.error('Error updating name:', err);
        }
    };

    const handleSaveDescription = async () => {
        try {
            const status = await setBio(initDataRaw, editedUser.description);
            if (status) {
                setUser({ ...user, description: editedUser.description });
                setIsEditingDescription(false);
            } else {
                throw new Error('Не удалось поменять описание');
            }
        } catch (err) {
            console.error('Error updating bio:', err);
        }
    };

    const handleSaveTags = async () => {
        if (hasEditedTags && selectedTags.length < 1) {
            alert('После редактирования должен остаться хотя бы 1 тег');
            return;
        }
        try {
            const transformedTags = selectedTags.map((tag) => tag.toLowerCase().replace(/\s+/g, '_'));
            const status = await setTags(initDataRaw, transformedTags);
            if (status) {
                setUser({ ...user, tags: selectedTags });
                setEditedUser({ ...editedUser, tags: selectedTags });
                setIsTagModalOpen(false);
                // Mark tags as edited after saving
                setHasEditedTags(true);
            } else {
                throw new Error('Не удалось сохранить теги');
            }
        } catch (err) {
            console.error('Error updating tags:', err);
            alert('Ошибка при сохранении тегов');
        }
    };

    const handleActivateReview = async (reviewId: string) => {
        try {
            const status = await setReviewStatus(initDataRaw, reviewId);
            if (status) {
                const updatedReviews = user.reviews.map((review) =>
                    review.id === reviewId ? { ...review, is_active: true } : review
                );
                setUser({ ...user, reviews: updatedReviews });
                setEditedUser({ ...editedUser, reviews: updatedReviews });
            } else {
                throw new Error('Не удалось активировать отзыв');
            }
        } catch (err) {
            console.error('Error activating review:', err);
            alert('Ошибка при активации отзыва');
        }
    };

    const handleToggleReview = (reviewId: string) => {
        setExpandedReviews((prev) =>
            prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
        );
    };

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleEditDescription = () => {
        setIsEditingDescription(true);
        setTimeout(() => {
            if (descriptionTextareaRef.current) {
                descriptionTextareaRef.current.focus();
                descriptionTextareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleToggleStatus = async () => {
        const newStatus = !user.isActive;
        try {
            const status = await setStatus(initDataRaw, newStatus);
            if (status) {
                setUser({ ...user, isActive: newStatus });
                setEditedUser({ ...editedUser, isActive: newStatus });
            } else {
                throw new Error('Не удалось поменять статус');
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) {
                // Allow removing the tag
                return prev.filter((t) => t !== tag);
            } else {
                // Prevent adding if already at 3 tags
                if (prev.length >= 3) {
                    alert('Вы можете выбрать не более 3 тегов');
                    return prev;
                }
                // Mark tags as edited when adding a new tag
                setHasEditedTags(true);
                return [...prev, tag];
            }
        });
    };

    const handleTagDelete = async (tag: string) => {
        const newTags = selectedTags.filter((t) => t !== tag);

        // Prevent deletion if it would result in less than 1 tag after first edit
        if (hasEditedTags && newTags.length < 1) {
            alert('После редактирования должен остаться хотя бы 1 тег');
            return;
        }

        setSelectedTags(newTags);
        const transformedTags = newTags.map((tag) => tag.toLowerCase().replace(/\s+/g, '_'));
        try {
            const status = await setTags(initDataRaw, transformedTags);
            if (status) {
                setUser({ ...user, tags: newTags });
                setEditedUser({ ...editedUser, tags: newTags });
                // Mark tags as edited after a successful deletion
                setHasEditedTags(true);
            } else {
                throw new Error('Не удалось удалить тег');
            }
        } catch (err) {
            console.error('Error deleting tag:', err);
            alert('Ошибка при удалении тега');
        }
    };

    const filteredTags = availableTags.filter((tag) =>
        tag.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return (
            <span className={styles.stars}>
        {'★'.repeat(fullStars)}
                {halfStar ? '½' : ''}
                {'☆'.repeat(emptyStars)}
      </span>
        );
    };

    const handleShareLink = (tutorUsername: string) => {
        console.log("Переданный tutorUsername:", tutorUsername);

        if (tutorUsername) {
            if (openTelegramLink.isAvailable()) {
                openTelegramLink(`https://t.me/${tutorUsername}`);
            }
        } else {
            console.warn("tutorUsername пуст!");
        }
    };

    const tabs = [
        { id: 'orders', text: 'Заказы', Icon: OrdersIcon },
        { id: 'profile', text: 'Профиль', Icon: UserIcon },
        { id: 'responses', text: 'Отклики', Icon: ResponsesIcon },
    ];

    return (
        <Page back={false}>
            {isLoading ? (
                <Spinner className={styles.spinner} size="l" />
            ) : (
                <>
                    <div className={styles.profileContainer}>
                        <Headline weight="2" className={styles.centeredHeadline}>Ваш профиль</Headline>
                        {isEditingName ? (
                            <Input
                                header="Имя"
                                value={editedUser.name}
                                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                placeholder="Введите имя"
                                className={styles.input}
                            />
                        ) : (
                            <div className={styles.tutorInfo}>
                                <p className={styles.statusText}>
                                    {user.name}{' '}
                                    <EditIcon onClick={handleEditName} style={{ cursor: 'pointer' }} />
                                </p>
                            </div>
                        )}
                        {isEditingName && (
                            <Button size="s" onClick={handleSaveName} className={styles.saveButton}>
                                Сохранить имя
                            </Button>
                        )}
                        <div className={styles.statusContainer}>
                            <p className={styles.statusText}>
                                Статус профиля: {user.isActive ? 'Активный' : 'Неактивный'}
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
                            <p>{user.responseCount} откликов</p>
                            {user.responseCount === 0 && (
                                <Button
                                    size="s"
                                    onClick={() => handleShareLink('lessonsmy_tutors_bot')}
                                    className={styles.chatButton}
                                >
                                    Оплатить отклики
                                </Button>
                            )}
                        </div>
                        <div className={styles.tagsContainer}>
                            <Headline weight="3">Теги</Headline>
                            {user.tags.length > 0 ? (
                                <div className={styles.tags}>
                                    {user.tags.map((tag) => (
                                        <div key={tag} className={styles.tag}>
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
                            <div className={styles.editTagsButtonContainer}>
                                <Button
                                    size="s" // Smaller button size
                                    onClick={() => setIsTagModalOpen(true)}
                                    className={styles.editTagsButton} // Custom class for left alignment
                                >
                                    Изменить теги
                                </Button>
                            </div>
                        </div>
                        <div className={styles.descriptionContainer}>
                            <Headline weight="3">Описание</Headline>
                            {isEditingDescription ? (
                                <textarea
                                    ref={descriptionTextareaRef}
                                    className={styles.descriptionTextarea}
                                    value={editedUser.description}
                                    onChange={(e) =>
                                        setEditedUser({ ...editedUser, description: e.target.value })
                                    }
                                    onFocus={() => {
                                        if (descriptionTextareaRef.current) {
                                            descriptionTextareaRef.current.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'center',
                                            });
                                        }
                                    }}
                                    placeholder="Введите описание"
                                    rows={4}
                                />
                            ) : (
                                <p className={styles.profileDescription}>{user.description}</p>
                            )}
                            {isEditingDescription ? (
                                <Button
                                    size="s"
                                    onClick={handleSaveDescription}
                                    className={styles.saveButton}
                                >
                                    Сохранить описание
                                </Button>
                            ) : (
                                <Button
                                    size="s"
                                    onClick={handleEditDescription}
                                    className={styles.editButton}
                                >
                                    Изменить описание
                                </Button>
                            )}
                        </div>
                        <div className={styles.reviewsContainer}>
                            <Headline weight="3">Отзывы</Headline>
                            {user.reviews.length > 0 ? (
                                user.reviews.map((review) => {
                                    const isExpanded = expandedReviews.includes(review.id);
                                    return (
                                        <div
                                            key={review.id}
                                            className={styles.review}
                                            onClick={() => handleToggleReview(review.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <p className={styles.reviewRating}>
                                                {renderStars(review.rating)}
                                            </p>
                                            <p className={styles.reviewComment}>
                                                {isExpanded
                                                    ? review.comment
                                                    : review.comment.length > 50
                                                        ? review.comment.substring(0, 50) + '...'
                                                        : review.comment}
                                            </p>
                                            <p className={styles.reviewDate}>
                                                {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                            </p>
                                            {isExpanded && (
                                                <>
                                                    <p className={styles.reviewStatus}>
                                                        Статус: {review.is_active ? 'Активен' : 'Неактивен'}
                                                    </p>
                                                    {!review.is_active && (
                                                        <Button
                                                            size="s"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleActivateReview(review.id);
                                                            }}
                                                            className={styles.activateButton}
                                                        >
                                                            Активировать
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                            <span className={styles.reviewToggle}>{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>Нет отзывов</p>
                            )}
                        </div>
                    </div>
                    <Modal open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
                        <div className={styles.modalHeader}>
                            <Headline weight="1">Выберите теги</Headline>
                        </div>
                        <div className={styles.modalContent}>
                            <Input
                                header="Поиск"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                placeholder="Поиск тега"
                                className={styles.input}
                            />
                            <List className={styles.tagList}>
                                {filteredTags.map((tag) => (
                                    <Cell
                                        key={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        className={styles.tagCell}
                                        before={
                                            <Checkbox
                                                checked={selectedTags.includes(tag)}
                                                onChange={() => handleTagToggle(tag)}
                                            />
                                        }
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleTagToggle(tag);
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        {tag}
                                    </Cell>
                                ))}
                            </List>
                            <Button onClick={handleSaveTags} className={styles.saveButton}>
                                Сохранить
                            </Button>
                        </div>
                    </Modal>
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
                            if (id === 'orders') {
                                navigate('/orders');
                            } else if (id === 'responses') {
                                navigate('/responses');
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
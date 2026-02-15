import { createContainer } from "@evyweb/ioctopus";
import { createAuthModule } from "./modules/auth.module";
import { createBoardModule } from "./modules/board.module";
import { createChatModule } from "./modules/chat.module";
import { createContactModule } from "./modules/contact.module";
import { createEmotionModule } from "./modules/emotion.module";
import { createFriendModule } from "./modules/friend.module";
import { createGalleryModule } from "./modules/gallery.module";
import { createMoodModule } from "./modules/mood.module";
import { createMoodboardModule } from "./modules/moodboard.module";
import { createNotificationModule } from "./modules/notification.module";
import { createPostModule } from "./modules/post.module";
import { createProfileModule } from "./modules/profile.module";
import { createPushTokenModule } from "./modules/push-token.module";
import { createRewardModule } from "./modules/reward.module";
import { createTableauModule } from "./modules/tableau.module";
import { createUploadModule } from "./modules/upload.module";
import { createUserPreferenceModule } from "./modules/user-preference.module";
import { type DI_RETURN_TYPES, DI_SYMBOLS } from "./types";

const ApplicationContainer = createContainer();

ApplicationContainer.load(Symbol("AuthModule"), createAuthModule());
ApplicationContainer.load(Symbol("BoardModule"), createBoardModule());
ApplicationContainer.load(Symbol("ChatModule"), createChatModule());
ApplicationContainer.load(Symbol("ContactModule"), createContactModule());
ApplicationContainer.load(Symbol("EmotionModule"), createEmotionModule());
ApplicationContainer.load(Symbol("FriendModule"), createFriendModule());
ApplicationContainer.load(Symbol("GalleryModule"), createGalleryModule());
ApplicationContainer.load(Symbol("MoodModule"), createMoodModule());
ApplicationContainer.load(Symbol("MoodboardModule"), createMoodboardModule());
ApplicationContainer.load(
  Symbol("NotificationModule"),
  createNotificationModule(),
);
ApplicationContainer.load(Symbol("PostModule"), createPostModule());
ApplicationContainer.load(Symbol("ProfileModule"), createProfileModule());
ApplicationContainer.load(Symbol("PushTokenModule"), createPushTokenModule());
ApplicationContainer.load(Symbol("RewardModule"), createRewardModule());
ApplicationContainer.load(Symbol("TableauModule"), createTableauModule());
ApplicationContainer.load(Symbol("UploadModule"), createUploadModule());
ApplicationContainer.load(
  Symbol("UserPreferenceModule"),
  createUserPreferenceModule(),
);

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return ApplicationContainer.get(DI_SYMBOLS[symbol]);
}

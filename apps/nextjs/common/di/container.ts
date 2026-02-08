import { createContainer } from "@evyweb/ioctopus";
import { createAuthModule } from "./modules/auth.module";
import { createChatModule } from "./modules/chat.module";
import { createFriendModule } from "./modules/friend.module";
import { createNotificationModule } from "./modules/notification.module";
import { createPostModule } from "./modules/post.module";
import { createProfileModule } from "./modules/profile.module";
import { createUploadModule } from "./modules/upload.module";
import { type DI_RETURN_TYPES, DI_SYMBOLS } from "./types";

const ApplicationContainer = createContainer();

ApplicationContainer.load(Symbol("AuthModule"), createAuthModule());
ApplicationContainer.load(Symbol("UploadModule"), createUploadModule());
ApplicationContainer.load(Symbol("ChatModule"), createChatModule());
ApplicationContainer.load(Symbol("FriendModule"), createFriendModule());
ApplicationContainer.load(
  Symbol("NotificationModule"),
  createNotificationModule(),
);
ApplicationContainer.load(Symbol("PostModule"), createPostModule());
ApplicationContainer.load(Symbol("ProfileModule"), createProfileModule());

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return ApplicationContainer.get(DI_SYMBOLS[symbol]);
}

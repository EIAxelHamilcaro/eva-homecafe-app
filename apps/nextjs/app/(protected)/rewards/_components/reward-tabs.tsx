"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@packages/ui/components/ui/tabs";
import { BadgeGrid } from "./badge-grid";
import { StickerGrid } from "./sticker-grid";

export function RewardTabs() {
  return (
    <Tabs defaultValue="stickers">
      <TabsList>
        <TabsTrigger value="stickers">Stickers</TabsTrigger>
        <TabsTrigger value="badges">Badges</TabsTrigger>
      </TabsList>
      <TabsContent value="stickers" className="mt-6">
        <StickerGrid />
      </TabsContent>
      <TabsContent value="badges" className="mt-6">
        <BadgeGrid />
      </TabsContent>
    </Tabs>
  );
}

import { getBasePath } from "@/lib/base-path";

export const BUILTIN_AVATARS: { id: string; label: string; emoji: string }[] = [
  { id: "star", label: "星星", emoji: "⭐" },
  { id: "sun", label: "太阳", emoji: "🌞" },
  { id: "moon", label: "月亮", emoji: "🌙" },
  { id: "bear", label: "小熊", emoji: "🐻" },
  { id: "cat", label: "小猫", emoji: "🐱" },
  { id: "dog", label: "小狗", emoji: "🐶" },
  { id: "rabbit", label: "兔子", emoji: "🐰" },
  { id: "panda", label: "熊猫", emoji: "🐼" },
  { id: "lion", label: "狮子", emoji: "🦁" },
  { id: "rocket", label: "火箭", emoji: "🚀" },
  { id: "flower", label: "花朵", emoji: "🌸" },
  { id: "ball", label: "足球", emoji: "⚽" },
];

const BUILTIN_BY_ID = new Map(BUILTIN_AVATARS.map((a) => [a.id, a]));

export type AvatarKind = "builtin" | "upload";

export type ChildAvatarFields = {
  avatarKind: AvatarKind;
  avatarValue: string;
};

export function normalizeBuiltinId(id: string): string {
  return BUILTIN_BY_ID.has(id) ? id : "star";
}

export type ResolvedAvatar =
  | { type: "emoji"; emoji: string }
  | { type: "image"; src: string };

export function resolveChildAvatar(
  childId: number,
  fields: ChildAvatarFields,
): ResolvedAvatar {
  if (fields.avatarKind === "upload") {
    const base = getBasePath();
    return {
      type: "image",
      src: `${base}/api/avatars/${childId}/`,
    };
  }
  const builtin = BUILTIN_BY_ID.get(normalizeBuiltinId(fields.avatarValue));
  return { type: "emoji", emoji: builtin?.emoji ?? "⭐" };
}

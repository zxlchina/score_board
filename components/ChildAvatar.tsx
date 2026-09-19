import { resolveChildAvatar, type ChildAvatarFields } from "@/lib/avatars";

export function ChildAvatar({
  childId,
  avatarKind,
  avatarValue,
  size = "md",
}: ChildAvatarFields & { childId: number; size?: "sm" | "md" | "lg" }) {
  const resolved = resolveChildAvatar(childId, {
    avatarKind,
    avatarValue,
  });
  const dim =
    size === "lg" ? "h-14 w-14 text-3xl" : size === "sm" ? "h-9 w-9 text-lg" : "h-11 w-11 text-2xl";

  if (resolved.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved.src}
        alt=""
        className={`${dim} shrink-0 rounded-full border-4 border-white object-cover shadow-[0_4px_0_rgba(61,41,20,0.08)]`}
      />
    );
  }

  return (
    <span
      className={`${dim} flex shrink-0 items-center justify-center rounded-full border-4 border-white bg-brand-50 shadow-[0_4px_0_rgba(61,41,20,0.08)]`}
      aria-hidden
    >
      {resolved.emoji}
    </span>
  );
}

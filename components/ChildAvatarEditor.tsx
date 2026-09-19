"use client";

import { useRef } from "react";
import { setBuiltinAvatarAction, uploadChildAvatarAction } from "@/lib/actions/avatar";
import { BUILTIN_AVATARS } from "@/lib/avatars";
import { ChildAvatar } from "@/components/ChildAvatar";
import type { AvatarKind } from "@/lib/avatars";

export function ChildAvatarEditor({
  childId,
  avatarKind,
  avatarValue,
}: {
  childId: number;
  avatarKind: AvatarKind;
  avatarValue: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3">
      <p className="label mb-2">头像</p>
      <div className="mb-3 flex items-center gap-3">
        <ChildAvatar
          childId={childId}
          avatarKind={avatarKind}
          avatarValue={avatarValue}
          size="lg"
        />
        <p className="text-xs text-stone-500">
          选内置图标，或上传 JPG/PNG/WebP（最大 2MB）
        </p>
      </div>

      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {BUILTIN_AVATARS.map((a) => (
          <form key={a.id} action={setBuiltinAvatarAction}>
            <input type="hidden" name="childId" value={childId} />
            <input type="hidden" name="builtinId" value={a.id} />
            <button
              type="submit"
              title={a.label}
              className={`flex h-10 w-full items-center justify-center rounded-lg border text-xl transition hover:border-brand-400 ${
                avatarKind === "builtin" && avatarValue === a.id
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                  : "border-stone-200 bg-white"
              }`}
            >
              {a.emoji}
            </button>
          </form>
        ))}
      </div>

      <form
        action={uploadChildAvatarAction}
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={() => {
          if (fileRef.current) fileRef.current.value = "";
        }}
      >
        <input type="hidden" name="childId" value={childId} />
        <input
          ref={fileRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="max-w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-brand-100 file:px-2 file:py-1 file:text-sm file:text-brand-800"
          required
        />
        <button type="submit" className="btn-secondary text-xs">
          上传图片
        </button>
      </form>
    </div>
  );
}

import { ChildAvatarEditor } from "@/components/ChildAvatarEditor";
import { createChildAction, updateChildAction } from "@/lib/actions/admin";
import { listAllChildrenWithScores } from "@/lib/services/scores";

export const dynamic = "force-dynamic";

export default function AdminChildrenPage() {
  const children = listAllChildrenWithScores();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="page-title mb-4">小朋友管理</h1>
        <form action={createChildAction} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label" htmlFor="name">
              新增姓名
            </label>
            <input id="name" name="name" className="input" required maxLength={32} />
          </div>
          <button type="submit" className="btn-primary">
            添加
          </button>
        </form>
      </section>

      <ul className="space-y-4">
        {children.map((c) => (
          <li key={c.id} className="card space-y-3">
            <ChildAvatarEditor
              childId={c.id}
              avatarKind={c.avatarKind}
              avatarValue={c.avatarValue}
            />
            <form action={updateChildAction} className="space-y-3">
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">姓名</label>
                  <input name="name" className="input" defaultValue={c.name} required />
                </div>
                <div>
                  <label className="label">排序（越小越靠前）</label>
                  <input
                    name="sortOrder"
                    type="number"
                    className="input"
                    defaultValue={c.sortOrder}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    defaultChecked={c.isActive}
                  />
                  启用
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    defaultChecked={!c.isActive}
                  />
                  停用
                </label>
                <span className="text-sm text-stone-500">
                  累计积分：{c.totalScore}
                </span>
                <button type="submit" className="btn-secondary ml-auto">
                  保存
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 生产挂载在 https://lichzhang.net/tools/score_board/；本地 dev 不设 NEXT_BASE_PATH 即为根路径 */
export function getBasePath(): string {
  const raw = process.env.NEXT_BASE_PATH ?? "";
  if (!raw || raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

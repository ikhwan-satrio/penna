import type { FileEntry } from "~/types/vault"

export function normalizeWikiTarget(raw: string): string {
  const [targetPart = ""] = raw.split("|")

  return targetPart
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
}

export function getWikiDisplayText(raw: string): string {
  const [targetPart = "", aliasPart] = raw.split("|")

  if (aliasPart?.trim()) return aliasPart.trim()

  const trimmed = targetPart.trim()
  return trimmed.split("/").pop() ?? trimmed
}

export function findFileEntryByWikiTarget(
  entries: FileEntry[],
  rawTarget: string,
): FileEntry | null {
  const needle = normalizeWikiTarget(rawTarget)
  if (!needle) return null

  const candidates: FileEntry[] = []

  function walk(list: FileEntry[]) {
    for (const entry of list) {
      if (entry.is_dir) {
        if (entry.children?.length) walk(entry.children)
        continue
      }

      const normalizedPath = entry.path.replaceAll("\\", "/").toLowerCase()
      const normalizedPathWithoutExtension = normalizedPath.replace(
        /\.[^/.]+$/,
        "",
      )
      const normalizedName = entry.name.toLowerCase()
      const normalizedNameWithoutExtension = normalizedName.replace(
        /\.[^/.]+$/,
        "",
      )

      if (
        normalizedPath === needle ||
        normalizedPathWithoutExtension === needle ||
        normalizedName === needle ||
        normalizedNameWithoutExtension === needle
      ) {
        candidates.push(entry)
      }
    }
  }

  walk(entries)

  return (
    candidates.find((candidate) => {
      const path = candidate.path.replaceAll("\\", "/").toLowerCase()
      return path === needle || path.replace(/\.[^/.]+$/, "") === needle
    }) ??
    candidates[0] ??
    null
  )
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadText(text: string, filename: string, mime: string): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text
    .split("")
    .map((char) => {
      const lower = char.toLowerCase();
      const mapped = CYRILLIC_TO_LATIN[lower];
      if (mapped === undefined) return char;
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    })
    .join("");
}

/**
 * Turns a project name into a safe filename stem (no extension).
 *
 * Chromium has a long-standing quirk (still present in current stable
 * releases) where an `<a download>` filename containing non-Latin
 * characters on a `blob:` URL is silently replaced with a generic
 * "download" -- losing the extension too. Since every example name in this
 * app is in Russian, that would defeat the point of "save with this name"
 * for effectively all users, so filenames are transliterated to Latin
 * characters. The project's actual `name` field (inside the file/JSON) is
 * untouched -- only the on-disk filename changes.
 */
export function toFilenameStem(name: string): string {
  const cleaned = transliterate(name.trim())
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/[^\w\- .]+/g, "")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[\s-]+|[\s-]+$/g, "");
  return /\w/.test(cleaned) ? cleaned : "project";
}

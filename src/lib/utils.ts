export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getGoogleDriveFileId(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (!host.includes("drive.google.com") && !host.includes("docs.google.com")) {
      return null;
    }

    const directFileMatch = url.pathname.match(/\/file\/(?:u\/\d+\/)?d\/([^/]+)/);
    if (directFileMatch?.[1]) {
      return directFileMatch[1];
    }

    const queryId = url.searchParams.get("id");
    if (queryId) {
      return queryId;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const dIndex = segments.indexOf("d");
    if (dIndex >= 0 && segments[dIndex + 1]) {
      return segments[dIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
}

export function getGoogleDrivePreviewUrl(value: string) {
  const fileId = getGoogleDriveFileId(value);

  if (!fileId) {
    return null;
  }

  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getPlayableAudioUrl(value: string) {
  const fileId = getGoogleDriveFileId(value);

  if (fileId) {
    return `https://docs.google.com/uc?export=open&id=${fileId}`;
  }

  return value;
}

const assetRoot = import.meta.env.VITE_GITHUB_PAGES === "true" ? `${import.meta.env.BASE_URL}assets` : "/manus-storage";

export const assets = {
  visualTarget: `${assetRoot}/tsundoku-visual-target_5a2589b4.png`,
  shelfBackdrop: `${assetRoot}/tsundoku-shelf-backdrop_40e28dc2.png`,
  books: `${assetRoot}/tsundoku-book-collection_aa9c04b8.png`,
  readerAids: `${assetRoot}/tsundoku-reader-and-aids_0d045fa7.png`,
  mark: `${assetRoot}/tsundoku-library-mark_5a446500.png`,
} as const;

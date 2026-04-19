export const ITEM_WIDTH = 7.65 as const;
export const ITEM_GAP = 2.75 as const;
export const ITEMS_TO_GENERATE = 50 as const;
export const IDLE_SPEED_VH = 30 as const;
export const SPIN_DURATION_MS = 6250 as const;
export const CASE_INTRO_VIDEO_SRC = '/videos/newbie_case.webm' as const;
export const CASE_INTRO_VIDEO_VOLUME = 0.7 as const;
export const CASE_SLIDER_AFTER_INTRO_FADE_S = 0.3 as const;
export const CASE_OPEN_VIDEO_DURATION_MS = 8000 as const;
export const CASE_SLIDER_ENTERS_AT_MS = 2000 as const;
export const CASE_SPIN_SYNC_WITH_VIDEO_MS =
  CASE_OPEN_VIDEO_DURATION_MS - CASE_SLIDER_ENTERS_AT_MS;
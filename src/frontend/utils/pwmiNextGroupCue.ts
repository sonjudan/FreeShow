/** PWMI: show a next-section badge only at a group boundary. */
export interface CueSlideRef {
    type?: string
    data?: { disabled?: boolean }
}

export const LAST_GROUP_CUE = "slide_group_upcoming_last"

export function nextGroupAtBoundary(ref: readonly CueSlideRef[], slideIndex: number): number {
    if (!Number.isInteger(slideIndex) || slideIndex < 0 || !ref[slideIndex]) return -1
    let next = slideIndex + 1
    while (next < ref.length) {
        // A child that is still part of this section means it is not the last slide.
        if (ref[next].type !== "parent") {
            if (!ref[next].data?.disabled) return -1
            next++
            continue
        }
        if (!ref[next].data?.disabled) return next
        // A disabled group and its children are skipped by normal advancement.
        next++
        while (next < ref.length && ref[next].type !== "parent") next++
    }
    return -1
}

export function hideLastGroupCue(text: string, nextGroup: string, templatePreview = false): boolean {
    return !templatePreview && /\{slide_group_upcoming_last(?:[|?][^}]*)?\}/.test(text) && !nextGroup.trim()
}

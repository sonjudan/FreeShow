import { describe, expect, it } from "vitest"
import { hideLastGroupCue, nextGroupAtBoundary } from "./pwmiNextGroupCue"

const parent = () => ({ type: "parent" })
const child = () => ({ type: "child" })

describe("PWMI last-slide next-group cue", () => {
    it("shows only at the last of three Verse slides", () => {
        const ref = [parent(), child(), child(), parent(), child()]
        expect(nextGroupAtBoundary(ref, 0)).toBe(-1)
        expect(nextGroupAtBoundary(ref, 1)).toBe(-1)
        expect(nextGroupAtBoundary(ref, 2)).toBe(3)
    })
    it("handles two-slide and three-slide Pre-Choruses independently", () => {
        const ref = [parent(), child(), parent(), child(), child(), parent()]
        expect(nextGroupAtBoundary(ref, 0)).toBe(-1)
        expect(nextGroupAtBoundary(ref, 1)).toBe(2)
        expect(nextGroupAtBoundary(ref, 2)).toBe(-1)
        expect(nextGroupAtBoundary(ref, 3)).toBe(-1)
        expect(nextGroupAtBoundary(ref, 4)).toBe(5)
    })
    it("hides after the final group and for missing/cleared output", () => {
        expect(nextGroupAtBoundary([parent(), child()], 1)).toBe(-1)
        expect(nextGroupAtBoundary([], 0)).toBe(-1)
        expect(nextGroupAtBoundary([parent()], -1)).toBe(-1)
        expect(nextGroupAtBoundary([parent()], 10)).toBe(-1)
    })
    it("treats each repeated arrangement group as a separate boundary", () => {
        expect(nextGroupAtBoundary([parent(), parent()], 0)).toBe(1)
    })
    it("skips disabled slides and disabled groups", () => {
        const ref = [parent(), { type: "child", data: { disabled: true } }, { type: "parent", data: { disabled: true } }, child(), parent()]
        expect(nextGroupAtBoundary(ref, 0)).toBe(4)
    })
    it("hides the complete cue badge, but keeps ordinary text and template editing visible", () => {
        expect(hideLastGroupCue("Next: {slide_group_upcoming_last}", "")).toBe(true)
        expect(hideLastGroupCue("{slide_group_upcoming_last|Next}", "")).toBe(true)
        expect(hideLastGroupCue("{slide_group_upcoming_last}", "CHORUS")).toBe(false)
        expect(hideLastGroupCue("{slide_group_upcoming}", "")).toBe(false)
        expect(hideLastGroupCue("{slide_group_upcoming_last}", "", true)).toBe(false)
    })
})

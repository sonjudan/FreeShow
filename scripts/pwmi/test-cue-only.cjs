const fs = require("node:fs")
const vm = require("node:vm")
const assert = require("node:assert/strict")
const ts = require("typescript")
const source = fs.readFileSync("src/frontend/components/actions/apiHelper.ts", "utf8")
const fn = source.slice(source.indexOf("function outputSlide("), source.indexOf("\nexport async function disableSlide", source.indexOf("function outputSlide(")))
let state = { primary: { out: { slide: { id: "song", layout: "layout", index: 7, line: 0 }, refresh: 4 } } }
let updates = 0,
    slides = 0
const context = {
    get: (store) => (store === "outLocked" ? false : store === "outputs" ? state : { id: "song" }),
    outLocked: "outLocked",
    activeShow: "activeShow",
    outputs: {
        update: (fn) => {
            state = fn(state)
        }
    },
    getActiveOutputs: () => ["primary"],
    _show: () => ({ get: () => "layout" }),
    updateOut: () => updates++,
    setOutput: (type, slide) => {
        slides++
        state.primary.out.slide = slide
    }
}
// The helper calls get(outputs) as well as outputs.update.
const originalGet = context.get
context.get = (store) => (store === context.outputs ? state : originalGet(store))
vm.createContext(context)
vm.runInContext(ts.transpileModule(fn, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context)
const originalSlide = JSON.stringify(state.primary.out)
for (const text of ["Instrumental", "", "Verse 1", ""]) context.outputSlide([], { showId: "song", layoutId: "layout", index: 7, pwmiNextSection: text, pwmiCueId: "cue" })
assert.equal(updates, 0)
assert.equal(slides, 0)
assert.equal(JSON.stringify(state.primary.out), originalSlide)
assert.equal(state.primary.pwmiCue.text, "")
context.outputSlide([], { showId: "song", layoutId: "layout", index: 17, pwmiNextSection: "Verse 1", pwmiCueId: "instrumental" })
assert.equal(updates, 1)
assert.equal(slides, 1)
assert.equal(state.primary.out.slide.index, 17)
context.outputSlide([], { showId: "song", layoutId: "layout", index: 17, pwmiNextSection: "", pwmiCueId: "instrumental" })
assert.equal(updates, 1)
assert.equal(slides, 1)
context.outputSlide([], { showId: "song", layoutId: "layout", index: 17 })
assert.equal(updates, 2)
assert.equal(slides, 2)
console.log("PASS cue show/hide preserves slide and refresh; group change transitions once; manual slide selection unchanged")

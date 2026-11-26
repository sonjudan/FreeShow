// Reuse upstream packaging, without ChurchApps' signing/publishing credentials.
const fs = require("node:fs")
const path = require("node:path")
const yaml = require("js-yaml")
const upstream = yaml.load(fs.readFileSync(path.join(__dirname, "electron-builder.yaml"), "utf8"))
const pkg = require("../../package.json")
const revision = require("../../.pwmi/upstream.json").customRevision
upstream.appId = "app.freeshow.pwmi"
upstream.productName = "FreeShow PWMI"
upstream.artifactName = "FreeShow-PWMI-${version}-${arch}.${ext}"
upstream.extraMetadata = {
    name: "freeshow-pwmi",
    productName: "FreeShow PWMI",
    version: `${pkg.version}-pwmi.${revision}`,
    repository: { type: "git", url: "https://github.com/sonjudan/FreeShow.git" }
}
delete upstream.win.azureSignOptions
delete upstream.afterSign
upstream.mac.identity = null
upstream.mac.notarize = false
upstream.publish = null
module.exports = upstream

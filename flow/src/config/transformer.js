import source from "./peizhi.json" with { type: "json" }
import fs from "fs"

function transformer(source) {
    
    return ""
}

const result = transformer(source)
// console.log(result)

const timestamp = Date.now()
const filename = `bpmn_${timestamp}.xml`
fs.writeFileSync(filename, result)
console.log(`Saved to ${filename}`)
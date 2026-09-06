import { readFile } from "node:fs/promises"
const ejs = require("ejs")

const utilEJS = /*js*/`
  <%
    function consumeAttribute(name) {
      let temp = attributes[name]
      if (temp) {
        delete attributes[name]
        return temp
      } else return ""
    }

    function consumeAttributes(...names){
      out = {}
      for (const name of names){
        out[name] = consumeAttribute(name)
      }
      return out
    }
    function stringifyAttributes() {
      let out = ""
      for (const attribute in attributes) out += attribute + '="' + attributes[attribute] + '"'
      return out
    }
  %>
`

async function replaceAll(str:string, regex:RegExp, replacer:Function){
  const matches = [...str.matchAll(regex)]

  const replacements = await Promise.all(matches.map(match => replacer(...match)))

  let out = ""
  let lastIndex = 0

  matches.forEach((match, i) => {
    out += str.slice(lastIndex, match.index)
    out += replacements[i]
    lastIndex = match.index + match[0].length
  })
  return out + str.slice(lastIndex)
}

export async function render(src:string, args={}, path="raw", ejsOptions={}): Promise<string> {
  const data = ejs.render(src, args, ejsOptions)
  return await replaceAll(data, /<Component([\s\S]*?)>([\s\S]*?)<\/Component>/g, async (match:string, p1:string, p2:string) => {
    const attributes:Record<string, string> =  {}

    const attributeRegex = /([A-z]*)="((?:\\.|[^"\\])*)"/g
    const matches:Array<Array<string>> = [...p1.matchAll(attributeRegex)]

    for (const match of matches) attributes[match[1] as string] = (match[2] as string)

    if (!attributes.src) {
      console.error(`Cannot load component in ${path} without source.`)
      return
    }

    const componentSrc:string = attributes.src
    const componentArgs:Record<string,any> = attributes.args ? JSON.parse(attributes.args) : {}
    
    delete attributes.src
    delete attributes.args

    componentArgs["attributes"] = attributes
    componentArgs["innerHTML"] = p2

    const componentData = await readFile(componentSrc, "utf8")

    return await render(utilEJS + componentData, componentArgs, componentSrc, ejsOptions)
  })
}

export async function renderFile(path:string, args={}, ejsOptions={}): Promise<string> {
  return await render(await readFile(path, "utf8"), args, path, ejsOptions)
}
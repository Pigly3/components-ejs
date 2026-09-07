import { readFile } from "node:fs/promises"
const ejs = require("ejs")
const crypto = require("crypto")

const boilerplateHTML = /*html*/`
<style>
  component {
    display: inline-block;
  }
</style>
`

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

async function renderComponent(path:string, args:Record<string, any>, ejsOptions={}){
  const componentData = await readFile(path, "utf8")

  const scope = (Date.now() % 1000).toString() + crypto.randomBytes(8).toString("base64")

  const data = await render(utilEJS + componentData, args, path, ejsOptions, true, scope)

  const attributes = args.attributes
  let attributeString = ""
  for (const attribute in attributes) attributeString += attribute + '="' + attributes[attribute] + '"'
  
  return `<component scope="${scope}" ${attributeString}>${data}</component>`
}

function modifyComponentHTML(src:string, scope:string): string{
  return src.replace(/<style([\s\S]*?)>([\s\S]*?)<\/style>/g, (match, p1, p2) => {
    if (p1.split(" ").includes("global")) return `<style${p1}>${p2}</style>`
    return `<style${p1}>@scope ([scope="${scope}"]){${p2}}</style>`
  })
}

export async function render(src:string, args={}, path="raw", ejsOptions={}, _isComponent=false, _scope=""): Promise<string> {
  let data = ejs.render(src, args, ejsOptions)
  
  if (_isComponent) {
    data = modifyComponentHTML(data, _scope)
  } else data = boilerplateHTML + data

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

    return await renderComponent(componentSrc, componentArgs, ejsOptions)
  })
}

export async function renderFile(path:string, args={}, ejsOptions={}): Promise<string> {
  return await render(await readFile(path, "utf8"), args, path, ejsOptions)
}
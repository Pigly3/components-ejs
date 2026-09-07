# components-ejs

[![npm version](https://img.shields.io/npm/v/components-ejs.svg)](https://www.npmjs.com/package/components-ejs)

Adds components on top of EJS.


## Components
```html
<Component src="component.ejs">
  <p>
    Other HTML elements can go inside components.
  </p>
</Component>
```

Components specify where to display the elements inside of them:
```html
  <div>
    <%- innerHTML %>
  </div>
```

Some components do not allow `innerHTML`. For these components, a closing tag is not needed:
```html
<Component src="slider.ejs" />
```
Not including a closing tag for an element that allows `innerHTML` will cause an error.

## Styling

All `style` elements inside of components have their styles scoped to the component unless they have the `global` attribute.

## Attributes
Components can consume attributes, allowing the component to use them internally.
```html
<% const attrs = consumeAttributes("id", "class") %>
<% const name = consumeAttribute("name") %>
```

The `attr` function is also provided for easier use, which, for ease of use, is equivalent to:
```js
const value = consumeAttribute(name)
value ? `${name}="${value}"` : ""
```
This function allows for much simpler code:
```html
<button <%- attr("class") %>></button>
```

Any attributes which are not consumed will be applied to the component's container `component` element when rendering.

## Package Documentation

The package provides the following exported functions:
```typescript
export async function renderFile(path:string, args={}, ejsOptions={}): Promise<string>
export async function render(src:string, args={}, path="raw", ejsOptions={}, _isComponent=false, _scope=""): Promise<string>
```

The path argument in `render` is only used to identify the code in error messages.

Arguments prefixed with _ are used internally for rendering components and *should not be used*.
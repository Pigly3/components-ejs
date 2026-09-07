# components-ejs

Adds components on top of EJS.

```html
<Component src="component.ejs">
  <p>
    Other HTML elements can go inside components.
  </p>
</Component>
```

All `style` elements inside of components have their styles scoped to the component unless they have the `global` attribute.

Components specify where to display the elements inside of them:
```html
  <div>
    <%- innerHTML %>
  </div>
```

Components can consume attributes, allowing the component to use them internally.
```html
<% const attrs = consumeAttributes("id", "class") %>
<% const name = consumeAttribute("name") %>
```

Any attributes which are not consumed will be applied to the component's container `component` element when rendering.

The package provides the following exported functions:
```typescript
export async function renderFile(path:string, args={}, ejsOptions={}): Promise<string>
export async function render(src:string, args={}, path="raw", ejsOptions={}): Promise<string>
```

The path argument in `render` is only used to identify the code in error messages.
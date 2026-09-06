# components-ejs

Adds components on top of EJS.

```html
<Component src="component.ejs">
  <p>
    Other HTML elements can go inside components.
  </p>
</Component>
```

All `style` elements inside of components have their styles scoped to the component.

Components specify where to display the elements inside of them:
```html
  <div>
    <%- innerHTML %>
  </div>
```

All attribtues on the component (except for src, which determines the component) are passed through to the component:
```html
  <div <%- stringifyAttributes() %>>
    <%- innerHTML %>
  </div>
```

It can also consume attributes, removing them from the `stringifyAttributes()` output and allowing the component to use them in a different place than the other attributes. Attributes should be consumed at the top of the file to ensure they are fully consumed.
```html
<% const attrs = consumeAttributes("id", "class") %>
<% const name = consumeAttribute("name") %>

<div <%- stringifyAttributes() %>>
  <%- innerHTML %>
</div>
```

The package provides the following exported functions:
```typescript
export async function renderFile(path:string, args={}, ejsOptions={}): Promise<string>
export async function render(src:string, args={}, path="raw", ejsOptions={}): Promise<string>
```

The path argument in `render` is only used to identify the code in error messages.
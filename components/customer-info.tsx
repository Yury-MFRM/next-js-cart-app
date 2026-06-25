/**
 * Customer information fields (simulation only — values are never processed or
 * persisted). Rendered as part of the checkout server-action form.
 */
const fields = [
  { id: 'fullName', label: 'Full name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name', full: true },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com', autoComplete: 'email', full: true },
  { id: 'address', label: 'Address', type: 'text', placeholder: '123 Market St', autoComplete: 'street-address', full: true },
  { id: 'city', label: 'City', type: 'text', placeholder: 'San Francisco', autoComplete: 'address-level2', full: false },
  { id: 'zip', label: 'ZIP code', type: 'text', placeholder: '94103', autoComplete: 'postal-code', full: false },
] as const

export function CustomerInfo() {
  return (
    <section
      aria-label="Customer information"
      className="rounded-lg border border-border bg-card p-6"
    >
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-foreground">
        Customer information
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className={`flex flex-col gap-1.5 ${field.full ? 'sm:col-span-2' : ''}`}
          >
            <label
              htmlFor={field.id}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

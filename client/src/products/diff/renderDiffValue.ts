const hasStringProperty = (value: Record<string, unknown>, property: string): value is Record<string, string> =>
  typeof value[property] === 'string'

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  return value as Record<string, unknown>
}

export const renderDiffValue = (value: unknown): string => {
  if (value === null) {
    return 'null'
  }
  if (value === undefined) {
    return ''
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map((item) => renderDiffValue(item)).join(', ')
  }

  const objectValue = toRecord(value)
  if (!objectValue) {
    return String(value)
  }

  if (hasStringProperty(objectValue, 'title') && hasStringProperty(objectValue, 'url')) {
    return `${objectValue.title} (${objectValue.url})`
  }

  if (hasStringProperty(objectValue, 'title')) {
    return objectValue.title
  }

  if (hasStringProperty(objectValue, 'url')) {
    return objectValue.url
  }

  return JSON.stringify(objectValue)
}

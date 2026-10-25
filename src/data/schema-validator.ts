import Ajv2020, { ErrorObject, Schema } from 'ajv/dist/2020'

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  formats: {
    'date-time': {
      type: 'string',
      validate: (v) => typeof v === 'string' && !isNaN(Date.parse(v)),
    },
  },
})

const validators = new Map<string, (data: unknown) => boolean>()

export function addSchema(uri: string, schema: Schema): void {
  const validate = ajv.compile(schema)
  validators.set(uri, validate)
}

export function validate<T = unknown>(uri: string, data: T): boolean {
  const validator = validators.get(uri)
  if (!validator) {
    throw new Error(`Schema not registered: ${uri}`)
  }
  return validator(data)
}

export function validateAll(uri: string, data: unknown): { valid: boolean; errors: ErrorObject[] } {
  const validator = validators.get(uri)
  if (!validator) {
    throw new Error(`Schema not registered: ${uri}`)
  }
  const valid = validator(data)
  const errors = (validator as any).errors ?? []
  return { valid, errors: errors as ErrorObject[] }
}

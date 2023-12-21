export interface NewAdminUserDTO {
  name?: string | null
  email: string
  password: string
  roles: string[]
  attributes: {}
}

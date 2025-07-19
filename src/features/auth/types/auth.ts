import { z } from 'zod'

// Schémas de validation
export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
})

export const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Types
export type LoginFormData = z.infer<typeof LoginSchema>
export type RegisterFormData = z.infer<typeof RegisterSchema>
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

export interface ActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface User {
  id: string
  email: string
  emailConfirmed: boolean
  lastSignInAt?: string
  createdAt: string
}

export interface AuthSession {
  user: User | null
  loading: boolean
} 
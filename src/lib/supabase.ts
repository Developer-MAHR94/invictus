import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          usuario: string
          clave: string
          rol: 'admin' | 'asistente' | 'barbero'
          nombre: string | null
          apellido: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario: string
          clave: string
          rol: 'admin' | 'asistente' | 'barbero'
          nombre?: string | null
          apellido?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario?: string
          clave?: string
          rol?: 'admin' | 'asistente' | 'barbero'
          nombre?: string | null
          apellido?: string | null
          created_at?: string
        }
      }
      productos: {
        Row: {
          id: string
          nombre: string
          precio_entrada: number
          precio_salida: number
          cantidad: number
          fecha_ingreso: string
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          precio_entrada: number
          precio_salida: number
          cantidad: number
          fecha_ingreso: string
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          precio_entrada?: number
          precio_salida?: number
          cantidad?: number
          fecha_ingreso?: string
          created_at?: string
        }
      }
      facturas: {
        Row: {
          id: string
          numero: string
          fecha: string
          cliente: string
          servicios: any
          total: number
          abierta: boolean
          efectivo: number
          transferencia: number
          tipo_pago: string
          created_at: string
        }
        Insert: {
          id?: string
          numero: string
          fecha: string
          cliente: string
          servicios: any
          total: number
          abierta: boolean
          efectivo: number
          transferencia: number
          tipo_pago: string
          created_at?: string
        }
        Update: {
          id?: string
          numero?: string
          fecha?: string
          cliente?: string
          servicios?: any
          total?: number
          abierta?: boolean
          efectivo?: number
          transferencia?: number
          tipo_pago?: string
          created_at?: string
        }
      }
      cierres_caja: {
        Row: {
          id: string
          fecha: string
          total_ventas: number
          total_propinas: number
          total_efectivo: number
          total_tarjeta: number
          observaciones: string | null
          created_at: string
        }
        Insert: {
          id?: string
          fecha: string
          total_ventas: number
          total_propinas: number
          total_efectivo: number
          total_tarjeta: number
          observaciones?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          fecha?: string
          total_ventas?: number
          total_propinas?: number
          total_efectivo?: number
          total_tarjeta?: number
          observaciones?: string | null
          created_at?: string
        }
      }
      barberos: {
        Row: {
          id: string
          usuario: string
          nombre: string | null
          apellido: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario: string
          nombre?: string | null
          apellido?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario?: string
          nombre?: string | null
          apellido?: string | null
          created_at?: string
        }
      }
      propinas: {
        Row: {
          id: string
          barbero: string
          monto: number
          fecha: string
          entregada: boolean
          created_at: string
        }
        Insert: {
          id?: string
          barbero: string
          monto: number
          fecha: string
          entregada?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          barbero?: string
          monto?: number
          fecha?: string
          entregada?: boolean
          created_at?: string
        }
      }
    }
  }
} 
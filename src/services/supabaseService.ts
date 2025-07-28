import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Usuario = Database['public']['Tables']['usuarios']['Row']
type Producto = Database['public']['Tables']['productos']['Row']
type Factura = Database['public']['Tables']['facturas']['Row']
type CierreCaja = Database['public']['Tables']['cierres_caja']['Row']
type Barbero = Database['public']['Tables']['barberos']['Row']
type Propina = Database['public']['Tables']['propinas']['Row']

// Servicios de Usuarios
export const usuarioService = {
  async login(usuario: string, clave: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('clave', clave)
      .single()
    
    if (error) {
      console.error('Error en login:', error)
      return null
    }
    
    return data
  },

  async getUsuarios(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo usuarios:', error)
      return []
    }
    
    return data || []
  },

  async crearUsuario(usuario: Omit<Usuario, 'id' | 'created_at'>): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuario)
      .select()
      .single()
    
    if (error) {
      console.error('Error creando usuario:', error)
      return null
    }
    
    return data
  },

  async actualizarUsuario(id: string, updates: Partial<Usuario>): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando usuario:', error)
      return null
    }
    
    return data
  }
}

// Servicios de Productos
export const productoService = {
  async getProductos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo productos:', error)
      return []
    }
    
    return data || []
  },

  async crearProducto(producto: Omit<Producto, 'id' | 'created_at'>): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto)
      .select()
      .single()
    
    if (error) {
      console.error('Error creando producto:', error)
      return null
    }
    
    return data
  },

  async actualizarProducto(id: string, updates: Partial<Producto>): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando producto:', error)
      return null
    }
    
    return data
  },

  async eliminarProducto(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error eliminando producto:', error)
      return false
    }
    
    return true
  }
}

// Servicios de Facturas
export const facturaService = {
  async getFacturas(): Promise<Factura[]> {
    const { data, error } = await supabase
      .from('facturas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo facturas:', error)
      return []
    }
    
    return data || []
  },

  async crearFactura(factura: Omit<Factura, 'id' | 'created_at'>): Promise<Factura | null> {
    const { data, error } = await supabase
      .from('facturas')
      .insert(factura)
      .select()
      .single()
    
    if (error) {
      console.error('Error creando factura:', error)
      return null
    }
    
    return data
  },

  async actualizarFactura(id: string, updates: Partial<Factura>): Promise<Factura | null> {
    const { data, error } = await supabase
      .from('facturas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando factura:', error)
      return null
    }
    
    return data
  },

  async eliminarFactura(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('facturas')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error eliminando factura:', error)
      return false
    }
    
    return true
  }
}

// Servicios de Cierres de Caja
export const cierreCajaService = {
  async getCierres(): Promise<CierreCaja[]> {
    const { data, error } = await supabase
      .from('cierres_caja')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo cierres:', error)
      return []
    }
    
    return data || []
  },

  async crearCierre(cierre: Omit<CierreCaja, 'id' | 'created_at'>): Promise<CierreCaja | null> {
    const { data, error } = await supabase
      .from('cierres_caja')
      .insert(cierre)
      .select()
      .single()
    
    if (error) {
      console.error('Error creando cierre:', error)
      return null
    }
    
    return data
  }
}

// Servicios de Barberos
export const barberoService = {
  async getBarberos(): Promise<Barbero[]> {
    const { data, error } = await supabase
      .from('barberos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo barberos:', error)
      return []
    }
    
    return data || []
  },

  async crearBarbero(barbero: Omit<Barbero, 'id' | 'created_at'>): Promise<Barbero | null> {
    const { data, error } = await supabase
      .from('barberos')
      .insert(barbero)
      .select()
      .single()
    
    if (error) {
      console.error('Error creando barbero:', error)
      return null
    }
    
    return data
  },

  async eliminarBarbero(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('barberos')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error eliminando barbero:', error)
      return false
    }
    
    return true
  }
}

// Servicios de Propinas
export const propinaService = {
  async getPropinas(): Promise<Propina[]> {
    const { data, error } = await supabase
      .from('propinas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo propinas:', error)
      return []
    }
    
    return data || []
  },

  async crearPropina(propina: Omit<Propina, 'id' | 'created_at'>): Promise<Propina | null> {
    const { data, error } = await supabase
      .from('propinas')
      .insert(propina)
      .select()
      .single()
    
    if (error) {
      console.error('Error creando propina:', error)
      return null
    }
    
    return data
  },

  async actualizarPropina(id: string, updates: Partial<Propina>): Promise<Propina | null> {
    const { data, error } = await supabase
      .from('propinas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando propina:', error)
      return null
    }
    
    return data
  }
} 
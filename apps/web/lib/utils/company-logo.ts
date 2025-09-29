/**
 * Utilidad para obtener el logo de la empresa desde localStorage o Supabase
 */

export interface CompanyInfo {
  name: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  founded: string;
  employees: number;
  currency: string;
  timezone: string;
  logo: string;
}

// Datos por defecto vacíos - solo datos reales de la base de datos
const defaultCompanyInfo: CompanyInfo = {
  name: "",
  ruc: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  description: "",
  founded: "",
  employees: 0,
  currency: "USD",
  timezone: "America/Guayaquil",
  logo: ""
};

// Cache para evitar llamadas repetidas
let companyInfoCache: CompanyInfo | null = null;
let isLoadingCompanyInfo = false;

/**
 * Obtiene la información de la empresa incluyendo el logo
 */
export async function getCompanyInfo(): Promise<CompanyInfo> {
  try {
    // Si ya está cargando, devolver cache o datos por defecto
    if (isLoadingCompanyInfo) {
      return companyInfoCache || defaultCompanyInfo;
    }

    // Si ya tenemos cache, devolverlo
    if (companyInfoCache) {
      return companyInfoCache;
    }

    // Marcar como cargando
    isLoadingCompanyInfo = true;

    // Primero intentar desde localStorage
    const localData = localStorage.getItem('empresa_config');
    if (localData) {
      const parsed = JSON.parse(localData);
      companyInfoCache = {
        ...defaultCompanyInfo,
        ...parsed
      };
      isLoadingCompanyInfo = false;
      return companyInfoCache!;
    }

    // Si no hay datos locales, intentar cargar desde Supabase
    try {
      const { supabase } = await import('@/lib/supabase/client');

      const { data, error } = await supabase
        .from('empresa_config')
        .select('*')
        .single();

      if (error) {
        console.warn('Error obteniendo datos de empresa desde Supabase:', error.message);
        companyInfoCache = defaultCompanyInfo;
      } else if (data) {
        companyInfoCache = {
          name: data.nombre_empresa || data.nombre || '',
          ruc: data.ruc || '',
          address: data.direccion || '',
          phone: data.telefono || '',
          email: data.email || '',
          website: data.website || '',
          description: data.descripcion || '',
          founded: data.fecha_fundacion || '',
          employees: data.numero_empleados || 0,
          currency: data.moneda || 'USD',
          timezone: data.zona_horaria || 'America/Guayaquil',
          logo: data.logo_url || ''
        };
        
        // Guardar en localStorage para futuras cargas
        localStorage.setItem('empresa_config', JSON.stringify(companyInfoCache));
      } else {
        companyInfoCache = defaultCompanyInfo;
      }
    } catch (supabaseError) {
      console.warn('Error de conexión a Supabase:', supabaseError);
      companyInfoCache = defaultCompanyInfo;
    }

    isLoadingCompanyInfo = false;
    return companyInfoCache;
  } catch (error) {
    console.error('Error obteniendo información de la empresa:', error);
    isLoadingCompanyInfo = false;
    companyInfoCache = defaultCompanyInfo;
    return companyInfoCache;
  }
}

/**
 * Obtiene solo el logo de la empresa
 */
export async function getCompanyLogo(): Promise<string> {
  const companyInfo = await getCompanyInfo();
  return companyInfo.logo || '';
}

/**
 * Obtiene el nombre de la empresa
 */
export async function getCompanyName(): Promise<string> {
  const companyInfo = await getCompanyInfo();
  return companyInfo.name || 'LogicQP';
}

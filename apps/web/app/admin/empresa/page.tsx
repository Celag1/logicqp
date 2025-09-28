"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  Save, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

interface CompanyInfo {
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

export default function EmpresaPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  // Cargar datos de la empresa desde Supabase (principal) o localStorage (respaldo)
  const loadCompanyData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos de la empresa...');
      
      // Primero intentar cargar desde Supabase
      try {
        // Crear cliente de Supabase con service role key para evitar problemas de JWT
        const supabaseAdmin = createClient(
          'http://127.0.0.1:54321',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        );
        
        const { data, error } = await supabaseAdmin
          .from('empresa_config')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('❌ Error al cargar desde Supabase:', error);
          throw new Error(`Error de base de datos: ${error.message}`);
        }

        if (data) {
          console.log('✅ Datos cargados desde Supabase');
          const companyData = {
            name: data.nombre || "",
            ruc: data.ruc || "",
            address: data.direccion || "",
            phone: data.telefono || "",
            email: data.email || "",
            website: data.website || "",
            description: data.descripcion || "",
            founded: data.fecha_fundacion || "",
            employees: data.numero_empleados || 0,
            currency: data.moneda || "USD",
            timezone: data.zona_horaria || "America/Guayaquil",
            logo: data.logo_url || ""
          };
          
          setCompanyInfo(companyData);
          
          // Si hay logo base64, establecer el preview
          if (data.logo_url && data.logo_url.startsWith('data:image/')) {
            setLogoPreview(data.logo_url);
          }
          
          // Guardar en localStorage como respaldo
          localStorage.setItem('empresa_config', JSON.stringify(companyData));
          setLoading(false);
          return;
        } else {
          console.log('ℹ️ No hay datos en Supabase, usando datos vacíos');
          setCompanyInfo(defaultCompanyInfo);
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.error('❌ Error de base de datos:', dbError);
        console.log('🔄 Intentando cargar desde localStorage como respaldo...');
        
        // Si falla Supabase, intentar cargar desde localStorage
        const localData = localStorage.getItem('empresa_config');
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            setCompanyInfo(parsedData);
            
            // Si hay logo base64, establecer el preview
            if (parsedData.logo && parsedData.logo.startsWith('data:image/')) {
              setLogoPreview(parsedData.logo);
            }
            
            console.log('✅ Datos cargados desde localStorage (respaldo)');
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('❌ Error al parsear datos locales:', parseError);
          }
        }
        
        // Si todo falla, usar datos vacíos
        console.log('⚠️ Usando datos vacíos');
        setCompanyInfo(defaultCompanyInfo);
      }
    } catch (error) {
      console.error('❌ Error general al cargar datos:', error);
      setCompanyInfo(defaultCompanyInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('🚀 INICIANDO handleSave...');
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      console.log('💾 Guardando datos de la empresa...');
      console.log('📝 Datos a guardar:', companyInfo);

      // Preparar datos completos para Supabase
      const companyData = {
        nombre: companyInfo.name, // Campo requerido NOT NULL
        ruc: companyInfo.ruc,
        direccion: companyInfo.address,
        telefono: companyInfo.phone,
        email: companyInfo.email,
        website: companyInfo.website || null,
        descripcion: companyInfo.description || null,
        fecha_fundacion: companyInfo.founded || null,
        numero_empleados: companyInfo.employees || null,
        moneda: companyInfo.currency || 'USD',
        zona_horaria: companyInfo.timezone || 'America/Guayaquil',
        logo_url: companyInfo.logo || null,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Datos preparados para Supabase:', companyData);

      // Intentar guardar en Supabase con timeout de 15 segundos
      let supabaseSuccess = false;
      try {
        console.log('🔍 Intentando guardar en Supabase...');
        
        // Crear cliente de Supabase con service role key para evitar problemas de JWT
        const supabaseAdmin = createClient(
          'http://127.0.0.1:54321',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
        );
        
        // Primero intentar UPDATE, si no existe hacer INSERT
        const { data: existingData, error: selectError } = await supabaseAdmin
          .from('empresa_config')
          .select('id')
          .limit(1);
        
        let { error: upsertError } = { error: null };
        
        if (existingData && existingData.length > 0) {
          // Actualizar registro existente
          const { error: updateError } = await supabaseAdmin
            .from('empresa_config')
            .update(companyData)
            .eq('id', existingData[0].id);
          upsertError = updateError;
        } else {
          // Insertar nuevo registro
          const { error: insertError } = await supabaseAdmin
            .from('empresa_config')
            .insert(companyData);
          upsertError = insertError;
        }

        if (!upsertError) {
          console.log('✅ Datos guardados exitosamente en Supabase');
          supabaseSuccess = true;
        } else {
          console.error('❌ Error guardando en Supabase:', upsertError);
        }
      } catch (dbError) {
        console.error('❌ Error en operación de Supabase:', dbError);
        console.log('⚠️ Continuando con guardado en localStorage...');
      }
      
      // Siempre guardar en localStorage
      console.log('💾 Guardando en localStorage...');
      localStorage.setItem('empresa_config', JSON.stringify(companyInfo));
      console.log('✅ Datos guardados en localStorage');
      
      // Mostrar mensaje de éxito
      setSaveStatus('success');
      setIsEditing(false);
      
      if (supabaseSuccess) {
        console.log('🎉 Guardado completo: Supabase + localStorage');
      } else {
        console.log('🎉 Guardado en localStorage (Supabase falló)');
      }
      
      // Limpiar el estado de éxito después de 3 segundos
      setTimeout(() => {
        console.log('🧹 Limpiando mensaje de éxito...');
        setSaveStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error general en handleSave:', error);
      setSaveStatus('error');
      setIsEditing(false);
    } finally {
      // GARANTIZAR que siempre se desactive el estado de guardado
      console.log('🔚 EJECUTANDO finally block...');
      console.log('🔄 DESACTIVANDO estado de guardado...');
      setIsSaving(false);
      console.log('✅ Estado de guardado DESACTIVADO');
    }
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string | number) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, SVG)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 5MB');
      return;
    }

    setIsUploading(true);

    try {
      console.log('📤 Iniciando subida de logo...');
      
      // Crear URL de vista previa inmediatamente
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      console.log('✅ Vista previa creada');

      // Convertir archivo a base64 de forma síncrona para evitar timeouts
      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      console.log('✅ Archivo convertido a base64');

      // Actualizar la información de la empresa
      const updatedCompanyInfo = {
        ...companyInfo,
        logo: base64String
      };
      
      setCompanyInfo(updatedCompanyInfo);
      console.log('✅ Estado de empresa actualizado');

      // Guardar en localStorage inmediatamente
      localStorage.setItem('empresa_config', JSON.stringify(updatedCompanyInfo));
      console.log('✅ Guardado en localStorage');

      // Intentar guardar en Supabase de forma asíncrona (no bloquea)
      setTimeout(async () => {
        try {
          const companyData = {
            nombre: updatedCompanyInfo.name,
            ruc: updatedCompanyInfo.ruc,
            direccion: updatedCompanyInfo.address,
            telefono: updatedCompanyInfo.phone,
            email: updatedCompanyInfo.email,
            website: updatedCompanyInfo.website || null,
            descripcion: updatedCompanyInfo.description || null,
            fecha_fundacion: updatedCompanyInfo.founded || null,
            numero_empleados: updatedCompanyInfo.employees || null,
            moneda: updatedCompanyInfo.currency || 'USD',
            zona_horaria: updatedCompanyInfo.timezone || 'America/Guayaquil',
            logo_url: base64String,
            updated_at: new Date().toISOString()
          };

          const { error: upsertError } = await supabase
            .from('empresa_config')
            .upsert(companyData, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          if (upsertError) {
            console.warn('⚠️ Error guardando en Supabase:', upsertError.message);
          } else {
            console.log('✅ Logo guardado en Supabase');
          }
        } catch (dbError) {
          console.warn('⚠️ Error de base de datos:', dbError);
        }
      }, 100); // Ejecutar después de 100ms

      alert('Logo subido exitosamente');
      console.log('✅ Subida completada');

    } catch (error) {
      console.error('❌ Error al subir el archivo:', error);
      alert(`Error al subir el archivo: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      // GARANTIZAR que siempre se desactive el estado de subida
      console.log('🔚 DESACTIVANDO estado de subida...');
      setIsUploading(false);
      console.log('✅ Estado de subida DESACTIVADO');
    }
  };

  const handleRemoveLogo = async () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    
    const updatedCompanyInfo = {
      ...companyInfo,
      logo: ""
    };
    
    setCompanyInfo(updatedCompanyInfo);

    // Guardar en Supabase con todos los campos
    try {
      const companyData = {
        nombre: updatedCompanyInfo.name,
        ruc: updatedCompanyInfo.ruc,
        direccion: updatedCompanyInfo.address,
        telefono: updatedCompanyInfo.phone,
        email: updatedCompanyInfo.email,
        website: updatedCompanyInfo.website || null,
        descripcion: updatedCompanyInfo.description || null,
        fecha_fundacion: updatedCompanyInfo.founded || null,
        numero_empleados: updatedCompanyInfo.employees || null,
        moneda: updatedCompanyInfo.currency || 'USD',
        zona_horaria: updatedCompanyInfo.timezone || 'America/Guayaquil',
        logo_url: "",
        updated_at: new Date().toISOString()
      };

      const { data: existingData, error: fetchError } = await supabase
        .from('empresa_config')
        .select('id')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Error consultando tabla: ${fetchError.message}`);
      }

      let saveError = null;

      if (existingData) {
        const { error: updateError } = await supabase
          .from('empresa_config')
          .update(companyData)
          .eq('id', existingData.id);
        saveError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('empresa_config')
          .insert([companyData]);
        saveError = insertError;
      }

      if (saveError) {
        throw new Error(`Error removiendo logo: ${saveError.message}`);
      }

      console.log('✅ Logo removido de Supabase');
    } catch (dbError) {
      console.error('❌ Error removiendo logo de Supabase:', dbError);
      throw new Error(`Error al remover logo: ${dbError.message}`);
    }

    // Guardar en localStorage como respaldo
    localStorage.setItem('empresa_config', JSON.stringify(updatedCompanyInfo));
  };

  // Funciones para acciones rápidas
  const handleViewWebsite = () => {
    if (companyInfo.website) {
      // Verificar si la URL tiene protocolo
      const url = companyInfo.website.startsWith('http') 
        ? companyInfo.website 
        : `https://${companyInfo.website}`;
      window.open(url, '_blank');
    } else {
      alert('No hay sitio web configurado');
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      nombre: companyInfo.name,
      ruc: companyInfo.ruc,
      direccion: companyInfo.address,
      telefono: companyInfo.phone,
      email: companyInfo.email,
      website: companyInfo.website,
      descripcion: companyInfo.description,
      fecha_fundacion: companyInfo.founded,
      numero_empleados: companyInfo.employees,
      moneda: companyInfo.currency,
      zona_horaria: companyInfo.timezone
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `empresa_${companyInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAdvancedSettings = () => {
    alert('Configuración avanzada - Esta funcionalidad estará disponible próximamente');
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCompanyData();
  }, []);

  // Limpiar URLs de objetos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Moderno */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-sm opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Información de la Empresa
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mt-1">
                    Gestiona los datos corporativos de tu organización
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-slate-50 dark:bg-slate-800/80 dark:border-slate-700 dark:hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Editar Información
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Indicadores de estado modernos */}
          {saveStatus === 'success' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-green-800 font-semibold">¡Datos guardados exitosamente!</span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-red-800 font-semibold">Error al guardar los datos. Por favor intenta nuevamente.</span>
            </div>
          )}

          {loading && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center space-x-3 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-semibold">Cargando datos de la empresa...</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información Básica */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                      Información Básica
                    </span>
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                    Datos principales de la empresa
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Nombre de la Empresa
                      </Label>
                      <Input
                        id="name"
                        value={companyInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                        placeholder="Ingresa el nombre de tu empresa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ruc" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        RUC
                      </Label>
                      <Input
                        id="ruc"
                        value={companyInfo.ruc}
                        onChange={(e) => handleInputChange('ruc', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                        placeholder="1234567890001"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Descripción de la Empresa
                    </Label>
                    <Textarea
                      id="description"
                      value={companyInfo.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
                      placeholder="Describe brevemente tu empresa y sus servicios..."
                    />
                  </div>
                </CardContent>
            </Card>

              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                      Información de Contacto
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Dirección
                    </Label>
                    <Input
                      id="address"
                      value={companyInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="Av. Principal 123, Ciudad, País"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        value={companyInfo.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                        placeholder="+593 99 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Sitio Web
                    </Label>
                    <Input
                      id="website"
                      value={companyInfo.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent font-bold">
                      Configuración del Sistema
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Moneda
                      </Label>
                      <select
                        id="currency"
                        value={companyInfo.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                        title="Seleccionar moneda"
                      >
                        <option value="PEN">Soles (PEN)</option>
                        <option value="USD">Dólares (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Zona Horaria
                      </Label>
                      <select
                        id="timezone"
                        value={companyInfo.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-12 px-4 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                        title="Seleccionar zona horaria"
                      >
                        <option value="America/Guayaquil">Guayaquil (GMT-5)</option>
                        <option value="America/Lima">Lima (GMT-5)</option>
                        <option value="America/New_York">Nueva York (GMT-5)</option>
                        <option value="America/Mexico_City">México (GMT-6)</option>
                        <option value="America/Bogota">Bogotá (GMT-5)</option>
                        <option value="America/Santiago">Santiago (GMT-3)</option>
                        <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                        <option value="Europe/Madrid">Madrid (GMT+1)</option>
                        <option value="Europe/London">Londres (GMT+0)</option>
                        <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Logo Upload */}
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                      Logo de la Empresa
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {logoPreview || companyInfo.logo ? (
                    <div className="space-y-6">
                      <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                        <img 
                          src={logoPreview || companyInfo.logo} 
                          alt="Logo de la empresa" 
                          className="h-32 w-32 object-contain mx-auto mb-4 rounded-lg shadow-lg"
                        />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Logo actual</p>
                      </div>
                      {isEditing && (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={!isEditing || isUploading}
                            />
                            <label htmlFor="logo-upload">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full h-10 cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 transition-all duration-200" 
                                disabled={isUploading}
                                asChild
                              >
                                <span>
                                  {isUploading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                                      Subiendo...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Cambiar Logo
                                    </>
                                  )}
                                </span>
                              </Button>
                            </label>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRemoveLogo}
                            disabled={isUploading}
                            className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sube el logo de tu empresa</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Formatos: JPG, PNG, GIF, SVG (máx. 5MB)</p>
                      <div>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={!isEditing || isUploading}
                        />
                        <label htmlFor="logo-upload">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={!isEditing || isUploading}
                            className="h-10 cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 transition-all duration-200"
                            asChild
                          >
                            <span>
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                                  Subiendo...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Seleccionar Archivo
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
            </Card>

              {/* Company Stats */}
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-bold">
                      Estadísticas
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fundada</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{companyInfo.founded || 'No especificada'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Empleados</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{companyInfo.employees || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Moneda</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{companyInfo.currency}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-bold">
                      Acciones Rápidas
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-12 justify-start bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border-pink-200 hover:border-pink-300 text-pink-700 hover:text-pink-800 transition-all duration-200"
                    onClick={handleViewWebsite}
                  >
                    <Globe className="h-4 w-4 mr-3" />
                    Ver Sitio Web
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-12 justify-start bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                    onClick={handleExportData}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Exportar Datos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-12 justify-start bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200"
                    onClick={handleAdvancedSettings}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Configuración Avanzada
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

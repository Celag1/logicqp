"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Lock,
  Key,
  CheckCircle,
  AlertTriangle,
  Info,
  Database,
  Server,
  HardDrive,
  Wifi,
  Monitor,
  Smartphone,
  Laptop
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
}

const mockPermissions: Permission[] = [
  {
    id: "1",
    name: "Ver Dashboard",
    description: "Acceso al panel principal del sistema",
    resource: "dashboard",
    action: "read",
    roles: ["super_admin", "administrador", "vendedor", "inventario", "contable"],
    enabled: true,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Gestionar Usuarios",
    description: "Crear, editar y eliminar usuarios del sistema",
    resource: "users",
    action: "write",
    roles: ["super_admin", "administrador"],
    enabled: true,
    createdAt: "2024-01-15"
  },
  {
    id: "3",
    name: "Administrar Inventario",
    description: "Control completo del inventario de productos",
    resource: "inventory",
    action: "write",
    roles: ["super_admin", "administrador", "inventario"],
    enabled: true,
    createdAt: "2024-01-15"
  },
  {
    id: "4",
    name: "Ver Reportes",
    description: "Acceso a reportes y estadísticas",
    resource: "reports",
    action: "read",
    roles: ["super_admin", "administrador", "contable"],
    enabled: true,
    createdAt: "2024-01-15"
  },
  {
    id: "5",
    name: "Configurar Sistema",
    description: "Modificar configuraciones globales del sistema",
    resource: "settings",
    action: "write",
    roles: ["super_admin"],
    enabled: true,
    createdAt: "2024-01-15"
  }
];

const roleColors = {
  super_admin: "bg-red-100 text-red-800",
  administrador: "bg-purple-100 text-purple-800",
  vendedor: "bg-blue-100 text-blue-800",
  inventario: "bg-green-100 text-green-800",
  contable: "bg-orange-100 text-orange-800"
};

export default function PermisosPage() {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || permission.roles.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const togglePermission = (id: string) => {
    setPermissions(prev => 
      prev.map(permission => 
        permission.id === id 
          ? { ...permission, enabled: !permission.enabled }
          : permission
      )
    );
  };

  // Función para calcular métricas de permisos
  const calculatePermissionMetrics = () => {
    const totalPermissions = permissions.length;
    const activePermissions = permissions.filter(p => p.enabled).length;
    const inactivePermissions = totalPermissions - activePermissions;
    
    // Análisis por roles
    const roleAnalysis = permissions.reduce((acc, permission) => {
      permission.roles.forEach(role => {
        if (!acc[role]) {
          acc[role] = { total: 0, active: 0, inactive: 0 };
        }
        acc[role].total++;
        if (permission.enabled) {
          acc[role].active++;
        } else {
          acc[role].inactive++;
        }
      });
      return acc;
    }, {} as Record<string, { total: number; active: number; inactive: number }>);
    
    // Análisis por recursos
    const resourceAnalysis = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = { total: 0, active: 0, inactive: 0 };
      }
      acc[permission.resource].total++;
      if (permission.enabled) {
        acc[permission.resource].active++;
      } else {
        acc[permission.resource].inactive++;
      }
      return acc;
    }, {} as Record<string, { total: number; active: number; inactive: number }>);
    
    // Análisis por acciones
    const actionAnalysis = permissions.reduce((acc, permission) => {
      if (!acc[permission.action]) {
        acc[permission.action] = { total: 0, active: 0, inactive: 0 };
      }
      acc[permission.action].total++;
      if (permission.enabled) {
        acc[permission.action].active++;
      } else {
        acc[permission.action].inactive++;
      }
      return acc;
    }, {} as Record<string, { total: number; active: number; inactive: number }>);
    
    return {
      totalPermissions,
      activePermissions,
      inactivePermissions,
      roleAnalysis,
      resourceAnalysis,
      actionAnalysis
    };
  };

  // Función para generar reporte CSV de permisos
  const generatePermissionsReportCSV = () => {
    const currentDate = new Date();
    const metrics = calculatePermissionMetrics();
    
    let csvContent = [];
    
    // Encabezado principal
    csvContent.push(['GESTIÓN DE PERMISOS - SISTEMA LOGICQP']);
    csvContent.push(['Sistema de Gestión Farmacéutica Inteligente']);
    csvContent.push(['Fecha de Generación:', currentDate.toLocaleDateString('es-ES')]);
    csvContent.push(['Hora de Generación:', currentDate.toLocaleTimeString('es-ES')]);
    csvContent.push([]);
    
    // Resumen ejecutivo
    csvContent.push(['RESUMEN EJECUTIVO']);
    csvContent.push(['Métrica', 'Valor', 'Porcentaje']);
    csvContent.push(['Total Permisos', metrics.totalPermissions.toString(), '100%']);
    csvContent.push(['Permisos Activos', metrics.activePermissions.toString(), metrics.totalPermissions > 0 ? `${Math.round((metrics.activePermissions / metrics.totalPermissions) * 100)}%` : '0%']);
    csvContent.push(['Permisos Inactivos', metrics.inactivePermissions.toString(), metrics.totalPermissions > 0 ? `${Math.round((metrics.inactivePermissions / metrics.totalPermissions) * 100)}%` : '0%']);
    csvContent.push(['Total Roles', Object.keys(metrics.roleAnalysis).length.toString(), '']);
    csvContent.push(['Total Recursos', Object.keys(metrics.resourceAnalysis).length.toString(), '']);
    csvContent.push([]);
    
    // Análisis por roles
    csvContent.push(['ANÁLISIS POR ROLES']);
    csvContent.push(['Rol', 'Total Permisos', 'Activos', 'Inactivos', 'Porcentaje Activos']);
    Object.entries(metrics.roleAnalysis).forEach(([role, data]) => {
      csvContent.push([
        role,
        data.total.toString(),
        data.active.toString(),
        data.inactive.toString(),
        data.total > 0 ? `${Math.round((data.active / data.total) * 100)}%` : '0%'
      ]);
    });
    csvContent.push([]);
    
    // Análisis por recursos
    csvContent.push(['ANÁLISIS POR RECURSOS']);
    csvContent.push(['Recurso', 'Total Permisos', 'Activos', 'Inactivos', 'Porcentaje Activos']);
    Object.entries(metrics.resourceAnalysis).forEach(([resource, data]) => {
      csvContent.push([
        resource,
        data.total.toString(),
        data.active.toString(),
        data.inactive.toString(),
        data.total > 0 ? `${Math.round((data.active / data.total) * 100)}%` : '0%'
      ]);
    });
    csvContent.push([]);
    
    // Análisis por acciones
    csvContent.push(['ANÁLISIS POR ACCIONES']);
    csvContent.push(['Acción', 'Total Permisos', 'Activos', 'Inactivos', 'Porcentaje Activos']);
    Object.entries(metrics.actionAnalysis).forEach(([action, data]) => {
      csvContent.push([
        action,
        data.total.toString(),
        data.active.toString(),
        data.inactive.toString(),
        data.total > 0 ? `${Math.round((data.active / data.total) * 100)}%` : '0%'
      ]);
    });
    csvContent.push([]);
    
    // Listado detallado de permisos
    csvContent.push(['LISTADO DETALLADO DE PERMISOS']);
    csvContent.push(['ID', 'Nombre', 'Descripción', 'Recurso', 'Acción', 'Roles', 'Estado', 'Fecha Creación']);
    filteredPermissions.forEach(permission => {
      csvContent.push([
        permission.id,
        permission.name,
        permission.description,
        permission.resource,
        permission.action,
        permission.roles.join('; '),
        permission.enabled ? 'Activo' : 'Inactivo',
        permission.createdAt
      ]);
    });
    csvContent.push([]);
    
    // Recomendaciones de seguridad
    csvContent.push(['RECOMENDACIONES DE SEGURIDAD']);
    csvContent.push(['Gestión de Permisos']);
    csvContent.push(['- Revisar permisos inactivos y reactivar si es necesario']);
    csvContent.push(['- Implementar auditorías regulares de permisos']);
    csvContent.push(['- Establecer políticas de asignación de roles']);
    csvContent.push(['- Monitorear cambios en permisos críticos']);
    csvContent.push([]);
    csvContent.push(['Optimización del Sistema']);
    csvContent.push(['- Analizar patrones de uso de permisos']);
    csvContent.push(['- Implementar permisos granulares por módulo']);
    csvContent.push(['- Crear roles específicos para farmacéuticos']);
    csvContent.push(['- Establecer rotación de permisos administrativos']);
    
    return csvContent.map(row => row.join(',')).join('\n');
  };

  // Función para generar reporte PDF profesional de permisos
  const generatePermissionsReportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      
      // Crear contenedor temporal para el reporte
      const reportContainer = document.createElement('div');
      reportContainer.style.width = '800px';
      reportContainer.style.padding = '20px';
      reportContainer.style.fontFamily = 'Arial, sans-serif';
      reportContainer.style.lineHeight = '1.4';
      
      // Generar contenido del reporte
      const reportContent = generatePermissionsReportContent();
      reportContainer.innerHTML = reportContent;
      
      // Agregar al DOM temporalmente
      document.body.appendChild(reportContainer);
      
      // Convertir a canvas
      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calcular dimensiones
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Si el contenido es muy alto, dividir en páginas
      if (imgHeight > pageHeight - margin) {
        const totalPages = Math.ceil(imgHeight / (pageHeight - margin));
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) doc.addPage();
          
          const yOffset = -(i * (pageHeight - margin));
          doc.addImage(canvas, 'PNG', margin, margin + yOffset, imgWidth, imgHeight);
        }
      } else {
        doc.addImage(canvas, 'PNG', margin, margin, imgWidth, imgHeight);
      }
      
      // Limpiar
      document.body.removeChild(reportContainer);
      
      // Descargar
      doc.save(`reporte_permisos_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF');
    }
  };

  // Función para generar contenido del reporte de permisos
  const generatePermissionsReportContent = () => {
    const currentDate = new Date();
    const metrics = calculatePermissionMetrics();
    
    return `
      <div style="text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 25px; margin-bottom: 35px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 28px; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🔐 GESTIÓN DE PERMISOS</h1>
          <p style="color: #bfdbfe; font-size: 16px; margin: 8px 0; font-weight: 500;">Sistema de Gestión Farmacéutica - LogicQP</p>
          <p style="color: #93c5fd; font-size: 14px; margin: 5px 0;"><strong>Fecha de Generación:</strong> ${currentDate.toLocaleDateString('es-ES')} | <strong>Hora:</strong> ${currentDate.toLocaleTimeString('es-ES')}</p>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          📊 RESUMEN EJECUTIVO
        </h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 25px 0;">
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #eff6ff, #dbeafe); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">🔐 Total Permisos</div>
            <div style="font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">${metrics.totalPermissions}</div>
            <div style="font-size: 13px; color: #6b7280;">En el sistema</div>
          </div>
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">✅ Permisos Activos</div>
            <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px;">${metrics.activePermissions}</div>
            <div style="font-size: 13px; color: #6b7280;">${metrics.totalPermissions > 0 ? Math.round((metrics.activePermissions / metrics.totalPermissions) * 100) : 0}% del total</div>
          </div>
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fde68a); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Inactivos</div>
            <div style="font-size: 24px; font-weight: bold; color: #d97706; margin-bottom: 8px;">${metrics.inactivePermissions}</div>
            <div style="font-size: 13px; color: #6b7280;">Requieren atención</div>
          </div>
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f3e8ff, #e9d5ff); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">👥 Roles</div>
            <div style="font-size: 24px; font-weight: bold; color: #7c3aed; margin-bottom: 8px;">${Object.keys(metrics.roleAnalysis).length}</div>
            <div style="font-size: 13px; color: #6b7280;">Roles definidos</div>
          </div>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          👥 DISTRIBUCIÓN POR ROLES FARMACÉUTICOS
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Rol</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Total Permisos</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Activos</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Inactivos</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">% Activos</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(metrics.roleAnalysis).map(([role, data]) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">${role}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #1e40af; font-weight: bold;">${data.total}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: bold;">${data.active}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #d97706; font-weight: bold;">${data.inactive}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          📋 LISTADO DETALLADO DE PERMISOS
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                <th style="padding: 8px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Permiso</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Descripción</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Recurso</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Acción</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Roles</th>
                <th style="padding: 8px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPermissions.map(permission => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">
                    <div style="font-weight: bold; color: #1f2937;">${permission.name}</div>
                    <div style="font-size: 11px; color: #6b7280;">ID: ${permission.id}</div>
                  </td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; color: #6b7280; font-size: 11px;">${permission.description}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: #e5e7eb; color: #374151;">${permission.resource}</span>
                  </td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: #e5e7eb; color: #374151;">${permission.action}</span>
                  </td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #6b7280;">${permission.roles.join(', ')}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; ${permission.enabled ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">${permission.enabled ? 'Activo' : 'Inactivo'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          📊 ANÁLISIS POR RECURSOS Y ACCIONES
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 16px;">Distribución por Recursos</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
                ${Object.entries(metrics.resourceAnalysis).map(([resource, data]) => `
                  <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                    <div style="font-weight: bold; color: #1e40af;">${resource}</div>
                    <div style="font-size: 14px; color: #6b7280;">${data.total} permisos (${data.active} activos, ${data.inactive} inactivos)</div>
                    <div style="font-size: 12px; color: #9ca3af;">${data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}% activos</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div>
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 16px;">Distribución por Acciones</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
                ${Object.entries(metrics.actionAnalysis).map(([action, data]) => `
                  <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                    <div style="font-weight: bold; color: #1e40af;">${action}</div>
                    <div style="font-size: 14px; color: #6b7280;">${data.total} permisos (${data.active} activos, ${data.inactive} inactivos)</div>
                    <div style="font-size: 12px; color: #9ca3af;">${data.total > 0 ? Math.round((data.active / data.total) * 100) : 0}% activos</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          💡 RECOMENDACIONES DE SEGURIDAD
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 14px;">Gestión de Permisos</h3>
              <ul style="color: #374151; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Revisar permisos inactivos y reactivar si es necesario</li>
                <li>Implementar auditorías regulares de permisos</li>
                <li>Establecer políticas de asignación de roles</li>
                <li>Monitorear cambios en permisos críticos</li>
              </ul>
            </div>
            <div>
              <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 14px;">Optimización del Sistema</h3>
              <ul style="color: #374151; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Analizar patrones de uso de permisos</li>
                <li>Implementar permisos granulares por módulo</li>
                <li>Crear roles específicos para farmacéuticos</li>
                <li>Establecer rotación de permisos administrativos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 11px; border-top: 2px solid #e5e7eb; padding-top: 25px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-radius: 10px; padding: 20px;">
        <p style="margin: 5px 0; font-weight: bold; color: #374151;">🔐 Gestión de Permisos - Sistema LogicQP</p>
        <p style="margin: 5px 0; color: #6b7280;">Sistema de Gestión Farmacéutica Inteligente</p>
        <p style="margin: 5px 0; color: #9ca3af;">© ${new Date().getFullYear()} LogicQP - Todos los derechos reservados</p>
      </div>
    `;
  };

  const handleExport = () => {
    const csvContent = generatePermissionsReportCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_permisos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
              <p className="text-gray-600">Administra los permisos y roles del sistema</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Permisos</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{permissions.filter(p => p.enabled).length}</p>
                </div>
                <Settings className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Roles</p>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recursos</p>
                  <p className="text-2xl font-bold text-orange-600">{new Set(permissions.map(p => p.resource)).size}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar permisos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por rol"
                >
                  <option value="all">Todos los roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="inventario">Inventario</option>
                  <option value="contable">Contable</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="outline" size="sm" onClick={generatePermissionsReportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Permiso
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions List */}
        <div className="space-y-4">
          {filteredPermissions.map((permission) => (
            <Card key={permission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{permission.name}</h3>
                      <Badge variant={permission.enabled ? "default" : "secondary"}>
                        {permission.enabled ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{permission.description}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Recurso:</span>
                        <Badge variant="outline">{permission.resource}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Acción:</span>
                        <Badge variant="outline">{permission.action}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Roles:</span>
                        <div className="flex space-x-1">
                          {permission.roles.map(role => (
                            <Badge key={role} className={roleColors[role as keyof typeof roleColors]}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`toggle-${permission.id}`} className="text-sm">
                        Habilitado
                      </Label>
                      <Switch
                        id={`toggle-${permission.id}`}
                        checked={permission.enabled}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPermissions.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron permisos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

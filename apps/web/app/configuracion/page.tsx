"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Palette,
  BellRing,
  Lock,
  Users,
  FileText,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Server,
  HardDrive,
  Wifi,
  Monitor,
  Smartphone,
  Laptop
} from "lucide-react";

interface SystemConfig {
  // Configuración General
  appName: string;
  appVersion: string;
  timezone: string;
  language: string;
  currency: string;
  
  // Configuración de Notificaciones
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  lowStockAlerts: boolean;
  expirationAlerts: boolean;
  
  // Configuración de Seguridad
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireTwoFactor: boolean;
  
  // Configuración de Base de Datos
  backupFrequency: string;
  backupRetention: number;
  autoBackup: boolean;
  
  // Configuración de Email
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: boolean;
  
  // Configuración de Archivos
  maxFileSize: number;
  allowedFileTypes: string[];
  autoDeleteTempFiles: boolean;
}

const defaultConfig: SystemConfig = {
  appName: "LogicQP",
  appVersion: "1.0.0",
  timezone: "America/Guayaquil",
  language: "es",
  currency: "USD",
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  lowStockAlerts: true,
  expirationAlerts: true,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireTwoFactor: false,
  backupFrequency: "daily",
  backupRetention: 30,
  autoBackup: true,
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "",
  smtpSecure: true,
  maxFileSize: 10,
  allowedFileTypes: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
  autoDeleteTempFiles: true
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = async () => {
    setLoading(true);
    // Simular guardado
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  // Función para calcular puntuación de seguridad
  const calculateSecurityScore = () => {
    let score = 0;
    if (config.sessionTimeout <= 30) score += 25;
    if (config.maxLoginAttempts <= 5) score += 25;
    if (config.passwordMinLength >= 8) score += 25;
    if (config.requireTwoFactor) score += 25;
    return score;
  };

  // Función para calcular puntuación de respaldo
  const calculateBackupScore = () => {
    let score = 0;
    if (config.autoBackup) score += 40;
    if (config.backupFrequency === 'daily') score += 30;
    if (config.backupRetention >= 30) score += 30;
    return score;
  };

  // Función para generar reporte CSV de configuración
  const generateConfigReportCSV = () => {
    const currentDate = new Date();
    
    let csvContent = [];
    
    // Encabezado principal
    csvContent.push(['CONFIGURACIÓN DEL SISTEMA - LOGICQP']);
    csvContent.push(['Sistema de Gestión Farmacéutica Inteligente']);
    csvContent.push(['Fecha de Generación:', currentDate.toLocaleDateString('es-ES')]);
    csvContent.push(['Hora de Generación:', currentDate.toLocaleTimeString('es-ES')]);
    csvContent.push([]);
    
    // Resumen ejecutivo
    csvContent.push(['RESUMEN EJECUTIVO']);
    csvContent.push(['Métrica', 'Valor']);
    csvContent.push(['Total de Configuraciones', Object.keys(config).length.toString()]);
    csvContent.push(['Funciones Habilitadas', [
      config.emailNotifications,
      config.pushNotifications,
      config.smsNotifications,
      config.lowStockAlerts,
      config.expirationAlerts,
      config.autoBackup,
      config.smtpSecure,
      config.autoDeleteTempFiles
    ].filter(Boolean).length.toString()]);
    csvContent.push(['Puntuación de Seguridad', `${calculateSecurityScore()}/100`]);
    csvContent.push(['Puntuación de Respaldo', `${calculateBackupScore()}/100`]);
    csvContent.push([]);
    
    // Configuración general
    csvContent.push(['CONFIGURACIÓN GENERAL']);
    csvContent.push(['Parámetro', 'Valor', 'Descripción']);
    csvContent.push(['Nombre de la Aplicación', config.appName, 'Identificador principal del sistema']);
    csvContent.push(['Versión', config.appVersion, 'Versión actual del sistema']);
    csvContent.push(['Zona Horaria', config.timezone, 'Zona horaria del servidor']);
    csvContent.push(['Idioma', config.language.toUpperCase(), 'Idioma de la interfaz']);
    csvContent.push(['Moneda', config.currency, 'Moneda base del sistema']);
    csvContent.push([]);
    
    // Notificaciones
    csvContent.push(['CONFIGURACIÓN DE NOTIFICACIONES']);
    csvContent.push(['Tipo', 'Estado', 'Descripción']);
    csvContent.push(['Email Notifications', config.emailNotifications ? 'Habilitado' : 'Deshabilitado', 'Notificaciones por correo electrónico']);
    csvContent.push(['Push Notifications', config.pushNotifications ? 'Habilitado' : 'Deshabilitado', 'Notificaciones en tiempo real']);
    csvContent.push(['SMS Notifications', config.smsNotifications ? 'Habilitado' : 'Deshabilitado', 'Notificaciones por SMS']);
    csvContent.push(['Stock Bajo', config.lowStockAlerts ? 'Habilitado' : 'Deshabilitado', 'Alertas de inventario bajo']);
    csvContent.push(['Vencimiento', config.expirationAlerts ? 'Habilitado' : 'Deshabilitado', 'Alertas de productos próximos a vencer']);
    csvContent.push([]);
    
    // Seguridad
    csvContent.push(['CONFIGURACIÓN DE SEGURIDAD']);
    csvContent.push(['Parámetro', 'Valor', 'Estado']);
    csvContent.push(['Tiempo de Sesión (min)', config.sessionTimeout.toString(), config.sessionTimeout >= 30 ? 'Seguro' : 'Revisar']);
    csvContent.push(['Intentos Máximos Login', config.maxLoginAttempts.toString(), config.maxLoginAttempts <= 5 ? 'Seguro' : 'Revisar']);
    csvContent.push(['Longitud Mínima Contraseña', config.passwordMinLength.toString(), config.passwordMinLength >= 8 ? 'Seguro' : 'Revisar']);
    csvContent.push(['Autenticación 2FA', config.requireTwoFactor ? 'Habilitado' : 'Deshabilitado', config.requireTwoFactor ? 'Seguro' : 'Revisar']);
    csvContent.push([]);
    
    // Respaldo
    csvContent.push(['CONFIGURACIÓN DE RESPALDO']);
    csvContent.push(['Parámetro', 'Valor', 'Descripción']);
    csvContent.push(['Frecuencia', config.backupFrequency, 'Frecuencia de respaldos automáticos']);
    csvContent.push(['Retención (días)', config.backupRetention.toString(), 'Días de retención de respaldos']);
    csvContent.push(['Automático', config.autoBackup ? 'Habilitado' : 'Deshabilitado', 'Respaldo automático']);
    csvContent.push([]);
    
    // Email
    csvContent.push(['CONFIGURACIÓN DE EMAIL']);
    csvContent.push(['Parámetro', 'Valor', 'Estado']);
    csvContent.push(['Servidor SMTP', config.smtpHost, config.smtpHost ? 'Configurado' : 'No configurado']);
    csvContent.push(['Puerto SMTP', config.smtpPort.toString(), config.smtpPort ? 'Configurado' : 'No configurado']);
    csvContent.push(['Usuario SMTP', config.smtpUser || 'No configurado', config.smtpUser ? 'Configurado' : 'No configurado']);
    csvContent.push(['Conexión Segura', config.smtpSecure ? 'TLS Habilitado' : 'TLS Deshabilitado', config.smtpSecure ? 'Seguro' : 'Revisar']);
    csvContent.push([]);
    
    // Archivos
    csvContent.push(['CONFIGURACIÓN DE ARCHIVOS']);
    csvContent.push(['Parámetro', 'Valor', 'Descripción']);
    csvContent.push(['Tamaño Máximo (MB)', config.maxFileSize.toString(), 'Tamaño máximo de archivos permitidos']);
    csvContent.push(['Tipos Permitidos', config.allowedFileTypes.join(', '), 'Extensiones de archivos permitidas']);
    csvContent.push(['Auto Eliminar Temp', config.autoDeleteTempFiles ? 'Habilitado' : 'Deshabilitado', 'Eliminación automática de archivos temporales']);
    
    return csvContent.map(row => row.join(',')).join('\n');
  };

  // Función para generar contenido del reporte de configuración
  const generateConfigReportContent = () => {
    const currentDate = new Date();
    
    // Calcular métricas del sistema
    const totalSettings = Object.keys(config).length;
    const enabledFeatures = [
      config.emailNotifications,
      config.pushNotifications,
      config.smsNotifications,
      config.lowStockAlerts,
      config.expirationAlerts,
      config.autoBackup,
      config.smtpSecure,
      config.autoDeleteTempFiles
    ].filter(Boolean).length;
    
    const securityScore = calculateSecurityScore();
    const backupScore = calculateBackupScore();
    
    return `
      <div style="text-align: center; border-bottom: 4px solid #3b82f6; padding-bottom: 25px; margin-bottom: 35px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 28px; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">⚙️ CONFIGURACIÓN DEL SISTEMA</h1>
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
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">⚙️ Configuraciones</div>
            <div style="font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 8px;">${totalSettings}</div>
            <div style="font-size: 13px; color: #6b7280;">Total de parámetros</div>
          </div>
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">✅ Funciones Activas</div>
            <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 8px;">${enabledFeatures}</div>
            <div style="font-size: 13px; color: #6b7280;">Características habilitadas</div>
          </div>
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #fef3c7, #fde68a); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">🔒 Seguridad</div>
            <div style="font-size: 24px; font-weight: bold; color: #d97706; margin-bottom: 8px;">${securityScore}/100</div>
            <div style="font-size: 13px; color: #6b7280;">Puntuación de seguridad</div>
          </div>
          <div style="border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #f3e8ff, #e9d5ff); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">💾 Respaldo</div>
            <div style="font-size: 24px; font-weight: bold; color: #7c3aed; margin-bottom: 8px;">${backupScore}/100</div>
            <div style="font-size: 13px; color: #6b7280;">Puntuación de respaldo</div>
          </div>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          🌐 CONFIGURACIÓN GENERAL
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Parámetro</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Valor</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Nombre de la Aplicación</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.appName}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Identificador principal del sistema</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Versión</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.appVersion}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Versión actual del sistema</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Zona Horaria</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.timezone}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Zona horaria del servidor</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Idioma</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.language.toUpperCase()}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Idioma de la interfaz</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Moneda</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.currency}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Moneda base del sistema</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          🔔 CONFIGURACIÓN DE NOTIFICACIONES
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 16px;">Notificaciones Generales</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Email Notifications</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.emailNotifications ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Push Notifications</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.pushNotifications ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">SMS Notifications</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.smsNotifications ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
              </div>
            </div>
            <div>
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 16px;">Alertas Farmacéuticas</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Stock Bajo</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.lowStockAlerts ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Vencimiento</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.expirationAlerts ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          🔒 CONFIGURACIÓN DE SEGURIDAD
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Parámetro de Seguridad</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Valor</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Tiempo de Sesión (min)</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #1e40af; font-weight: bold;">${config.sessionTimeout}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.sessionTimeout >= 30 ? '✅ Seguro' : '⚠️ Revisar'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Intentos Máximos Login</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #1e40af; font-weight: bold;">${config.maxLoginAttempts}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.maxLoginAttempts <= 5 ? '✅ Seguro' : '⚠️ Revisar'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Longitud Mínima Contraseña</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #1e40af; font-weight: bold;">${config.passwordMinLength}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.passwordMinLength >= 8 ? '✅ Seguro' : '⚠️ Revisar'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Autenticación 2FA</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #1e40af; font-weight: bold;">${config.requireTwoFactor ? 'Habilitado' : 'Deshabilitado'}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.requireTwoFactor ? '✅ Seguro' : '⚠️ Revisar'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          💾 CONFIGURACIÓN DE RESPALDO
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <div>
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 16px;">Configuración de Respaldo</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Frecuencia</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.backupFrequency}</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Retención</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.backupRetention} días</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Automático</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.autoBackup ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
              </div>
            </div>
            <div>
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 16px;">Configuración de Archivos</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e40af;">
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Tamaño Máximo</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.maxFileSize} MB</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Tipos Permitidos</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.allowedFileTypes.join(', ')}</div>
                </div>
                <div style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                  <div style="font-weight: bold; color: #1e40af;">Auto Eliminar Temp</div>
                  <div style="font-size: 14px; color: #6b7280;">${config.autoDeleteTempFiles ? '✅ Habilitado' : '❌ Deshabilitado'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          📧 CONFIGURACIÓN DE EMAIL
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Parámetro SMTP</th>
                <th style="padding: 12px; text-align: left; border: 1px solid #1e40af; font-weight: bold;">Valor</th>
                <th style="padding: 12px; text-align: center; border: 1px solid #1e40af; font-weight: bold;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Servidor SMTP</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.smtpHost}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.smtpHost ? '✅ Configurado' : '❌ No configurado'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Puerto SMTP</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.smtpPort}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.smtpPort ? '✅ Configurado' : '❌ No configurado'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Usuario SMTP</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.smtpUser || 'No configurado'}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.smtpUser ? '✅ Configurado' : '❌ No configurado'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #1f2937;">Conexión Segura</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #1e40af; font-weight: bold;">${config.smtpSecure ? 'TLS Habilitado' : 'TLS Deshabilitado'}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${config.smtpSecure ? '✅ Seguro' : '⚠️ Revisar'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin: 35px 0;">
        <h2 style="color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 12px; font-size: 20px; background: linear-gradient(90deg, #eff6ff, transparent); padding: 15px; border-radius: 8px;">
          💡 RECOMENDACIONES ESTRATÉGICAS
        </h2>
        <div style="background: #f9fafb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 14px;">Seguridad</h3>
              <ul style="color: #374151; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Habilitar autenticación de dos factores</li>
                <li>Reducir tiempo de sesión a 15-30 minutos</li>
                <li>Implementar políticas de contraseñas más estrictas</li>
                <li>Configurar alertas de seguridad</li>
              </ul>
            </div>
            <div>
              <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 14px;">Optimización</h3>
              <ul style="color: #374151; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Configurar respaldos automáticos diarios</li>
                <li>Implementar monitoreo de rendimiento</li>
                <li>Optimizar configuración de notificaciones</li>
                <li>Revisar configuración de archivos regularmente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 11px; border-top: 2px solid #e5e7eb; padding-top: 25px; background: linear-gradient(135deg, #f9fafb, #f3f4f6); border-radius: 10px; padding: 20px;">
        <p style="margin: 5px 0; font-weight: bold; color: #374151;">⚙️ Configuración del Sistema - LogicQP</p>
        <p style="margin: 5px 0; color: #6b7280;">Sistema de Gestión Farmacéutica Inteligente</p>
        <p style="margin: 5px 0; color: #9ca3af;">© ${new Date().getFullYear()} LogicQP - Todos los derechos reservados</p>
      </div>
    `;
  };

  // Función para generar reporte PDF profesional de configuración
  const generateConfigReportPDF = async () => {
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
      const reportContent = generateConfigReportContent();
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
      doc.save(`reporte_configuracion_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF');
    }
  };

  const handleExport = () => {
    const csvContent = generateConfigReportCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_configuracion_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.createObjectURL(new Blob([url], { type: 'text/plain' }));
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setConfig(importedConfig);
        } catch (error) {
          console.error('Error importing config:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "database", label: "Base de Datos", icon: Database },
    { id: "email", label: "Email", icon: Mail },
    { id: "files", label: "Archivos", icon: Upload }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra la configuración general del sistema LogicQP
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={generateConfigReportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? "Guardado" : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Configuración guardada exitosamente</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorías</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Tab */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="appName">Nombre de la Aplicación</Label>
                    <Input
                      id="appName"
                      value={config.appName}
                      onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appVersion">Versión</Label>
                    <Input
                      id="appVersion"
                      value={config.appVersion}
                      onChange={(e) => setConfig({ ...config, appVersion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select value={config.timezone} onValueChange={(value) => setConfig({ ...config, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Guayaquil">Guayaquil (GMT-5)</SelectItem>
                        <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={config.language} onValueChange={(value) => setConfig({ ...config, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={config.currency} onValueChange={(value) => setConfig({ ...config, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="PEN">PEN (S/)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones importantes por correo electrónico</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={config.emailNotifications}
                      onCheckedChange={(checked) => setConfig({ ...config, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones en tiempo real en el navegador</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={config.pushNotifications}
                      onCheckedChange={(checked) => setConfig({ ...config, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">Notificaciones SMS</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recibir alertas críticas por mensaje de texto</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={config.smsNotifications}
                      onCheckedChange={(checked) => setConfig({ ...config, smsNotifications: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lowStockAlerts">Alertas de Stock Bajo</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notificar cuando el inventario esté por debajo del mínimo</p>
                    </div>
                    <Switch
                      id="lowStockAlerts"
                      checked={config.lowStockAlerts}
                      onCheckedChange={(checked) => setConfig({ ...config, lowStockAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="expirationAlerts">Alertas de Vencimiento</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notificar sobre productos próximos a vencer</p>
                    </div>
                    <Switch
                      id="expirationAlerts"
                      checked={config.expirationAlerts}
                      onCheckedChange={(checked) => setConfig({ ...config, expirationAlerts: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) => setConfig({ ...config, sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Intentos Máximos de Login</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) => setConfig({ ...config, maxLoginAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={config.passwordMinLength}
                      onChange={(e) => setConfig({ ...config, passwordMinLength: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireTwoFactor">Autenticación de Dos Factores</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Requerir 2FA para usuarios administrativos</p>
                    </div>
                    <Switch
                      id="requireTwoFactor"
                      checked={config.requireTwoFactor}
                      onCheckedChange={(checked) => setConfig({ ...config, requireTwoFactor: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Tab */}
          {activeTab === "database" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configuración de Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                    <Select value={config.backupFrequency} onValueChange={(value) => setConfig({ ...config, backupFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backupRetention">Retención de Respaldos (días)</Label>
                    <Input
                      id="backupRetention"
                      type="number"
                      value={config.backupRetention}
                      onChange={(e) => setConfig({ ...config, backupRetention: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Respaldo Automático</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Realizar respaldos automáticos según la frecuencia configurada</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={config.autoBackup}
                    onCheckedChange={(checked) => setConfig({ ...config, autoBackup: checked })}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Información de Respaldo</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Los respaldos se almacenan en un servidor seguro y se pueden restaurar en cualquier momento. 
                        Se recomienda mantener al menos 30 días de respaldos.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuración de Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="smtpHost">Servidor SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={config.smtpHost}
                      onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">Puerto SMTP</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={config.smtpPort}
                      onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtpUser">Usuario SMTP</Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    value={config.smtpUser}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smtpSecure">Conexión Segura (TLS)</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Usar conexión encriptada para el envío de emails</p>
                  </div>
                  <Switch
                    id="smtpSecure"
                    checked={config.smtpSecure}
                    onCheckedChange={(checked) => setConfig({ ...config, smtpSecure: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Configuración de Archivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={config.maxFileSize}
                    onChange={(e) => setConfig({ ...config, maxFileSize: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="allowedFileTypes">Tipos de Archivo Permitidos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.allowedFileTypes.map((type, index) => (
                      <Badge key={index} variant="secondary">
                        .{type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoDeleteTempFiles">Eliminar Archivos Temporales</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Eliminar automáticamente archivos temporales después de 24 horas</p>
                  </div>
                  <Switch
                    id="autoDeleteTempFiles"
                    checked={config.autoDeleteTempFiles}
                    onCheckedChange={(checked) => setConfig({ ...config, autoDeleteTempFiles: checked })}
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Importar Configuración</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Puedes importar una configuración desde un archivo JSON.
                      </p>
                      <label htmlFor="config-import" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Seleccionar archivo de configuración
                      </label>
                      <input
                        id="config-import"
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="mt-2 text-sm"
                        title="Seleccionar archivo de configuración"
                        aria-label="Importar configuración desde archivo JSON"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

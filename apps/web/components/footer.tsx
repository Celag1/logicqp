"use client";

import { useState, useEffect } from "react";
import { getCompanyLogo } from "@/lib/utils/company-logo";

export default function Footer() {
  const [companyLogo, setCompanyLogo] = useState<string>('');

  // Cargar logo de la empresa
  useEffect(() => {
    const loadCompanyLogo = async () => {
      try {
        const logo = await getCompanyLogo();
        setCompanyLogo(logo);
      } catch (error) {
        console.error('Error cargando logo de la empresa:', error);
      }
    };

    loadCompanyLogo();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {companyLogo ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={companyLogo} 
                    alt="Logo de LogicQP"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
              )}
              <span className="text-lg font-semibold">LogicQP</span>
            </div>
            <p className="text-gray-400 text-sm">
              La farmacia del futuro con inteligencia artificial avanzada
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Productos</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/catalogo" className="hover:text-white transition-colors">Catálogo</a></li>
              <li><a href="/catalogo?categoria=analgesicos" className="hover:text-white transition-colors">Analgésicos</a></li>
              <li><a href="/catalogo?categoria=vitaminas" className="hover:text-white transition-colors">Vitaminas</a></li>
              <li><a href="/catalogo?categoria=antibioticos" className="hover:text-white transition-colors">Antibióticos</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/admin/empresa" className="hover:text-white transition-colors">Información</a></li>
              <li><a href="/admin/usuarios" className="hover:text-white transition-colors">Usuarios</a></li>
              <li><a href="/admin/permisos" className="hover:text-white transition-colors">Permisos</a></li>
              <li><a href="/admin/database" className="hover:text-white transition-colors">Base de Datos</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/ayuda" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
              <li><a href="/contacto" className="hover:text-white transition-colors">Contacto</a></li>
              <li><a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="/terminos" className="hover:text-white transition-colors">Términos</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 LogicQP. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desarrollado con tecnología de avanzada para la industria farmacéutica
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

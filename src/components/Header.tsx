import React from 'react';
import { BuildingId, OverdueAlert } from '../types';
import { BUILDINGS_INFO } from '../data/initialData';
import { 
  Building2, 
  Receipt, 
  PieChart, 
  Bell, 
  Download, 
  RotateCcw, 
  Calendar,
  AlertTriangle,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  activeTab: BuildingId | 'expenses' | 'dashboard';
  setActiveTab: (tab: BuildingId | 'expenses' | 'dashboard') => void;
  overdueAlerts: OverdueAlert[];
  setIsNotificationOpen: (open: boolean) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  simulatedDate: Date;
  setSimulatedDate: (d: Date) => void;
  onExportExcel: () => void;
  onResetData: () => void;
  onOpenConnectMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  overdueAlerts,
  setIsNotificationOpen,
  currentYear,
  setCurrentYear,
  simulatedDate,
  setSimulatedDate,
  onExportExcel,
  onResetData,
  onOpenConnectMobile,
}) => {
  const currentFormattedDate = simulatedDate.toISOString().split('T')[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner with Alert bar if overdue payments exist */}
      {overdueAlerts.length > 0 && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs sm:text-sm text-rose-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse flex-shrink-0" />
            <span>
              <strong>¡Atención!</strong> Tienes <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-full font-bold">{overdueAlerts.length}</span> pagos de renta con retraso en este mes.
            </span>
          </div>
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="text-rose-700 hover:text-rose-900 underline font-semibold cursor-pointer"
          >
            Ver detalles y notificar
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  Control de Rentas y Gastos
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Marmota • Cuyo • Mapache • Suites Ardillas
                </p>
              </div>
            </div>

            {/* Mobile Notification & Year controls */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {overdueAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {overdueAlerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Controls: Year selector, Date Simulator, Export, Notifications */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs font-medium">
              <span className="text-slate-500 px-2 font-semibold">Año:</span>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-white text-slate-800 rounded px-2 py-1 font-bold border border-slate-200 outline-none cursor-pointer"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            {/* Date Simulator / System Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-500 font-medium">Fecha corte:</span>
              <input
                type="date"
                value={currentFormattedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSimulatedDate(new Date(y, m - 1, d));
                  }
                }}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-800 text-xs outline-none cursor-pointer"
                title="Puedes cambiar la fecha para probar cómo se activan las alertas de retraso según el día de pago"
              />
            </div>

            {/* Connect Mobile QR */}
            <button
              onClick={onOpenConnectMobile}
              className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Abrir en celular mediante código QR o enlace"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Móvil</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={onExportExcel}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Descargar reporte completo en Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>

            {/* Reset Defaults */}
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Restablecer a datos iniciales"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Notification Bell (Desktop) */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="hidden md:flex relative items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span>Notificaciones</span>
              {overdueAlerts.length > 0 && (
                <span className="bg-rose-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                  {overdueAlerts.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-100 pt-2 pb-1 overflow-x-auto no-scrollbar">
          {BUILDINGS_INFO.map((b) => {
            const isActive = activeTab === b.id;
            const bOverdue = overdueAlerts.filter((a) => a.buildingId === b.id).length;
            return (
              <button
                key={b.id}
                onClick={() => setActiveTab(b.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className={`w-4 h-4 ${isActive ? 'text-sky-200' : 'text-slate-400'}`} />
                <span>{b.name}</span>
                {bOverdue > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {bOverdue}
                  </span>
                )}
              </button>
            );
          })}

          {/* Gastos Tab */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className={`w-4 h-4 ${activeTab === 'expenses' ? 'text-amber-200' : 'text-slate-400'}`} />
            <span>Control de Gastos</span>
          </button>

          {/* Resumen Financiero Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-200' : 'text-slate-400'}`} />
            <span>Resumen & Métricas</span>
          </button>
        </div>
      </div>
    </header>
  );
};

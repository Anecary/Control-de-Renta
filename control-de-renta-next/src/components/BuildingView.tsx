'use client';

import React, { useState } from 'react';
import { BuildingId, Tenant, PaymentRecord, OverdueAlert } from '@/types';
import { MONTHS, formatCurrency, formatPlainCurrency, getWhatsAppReminderLink } from '@/utils/formatters';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Building, 
  CalendarDays,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

interface BuildingViewProps {
  buildingId: BuildingId;
  buildingName: string;
  buildingDescription: string;
  tenants: Tenant[];
  payments: PaymentRecord[];
  currentYear: number;
  simulatedDate: Date;
  overdueAlerts: OverdueAlert[];
  onOpenPaymentModal: (tenant: Tenant, month: number) => void;
  onOpenTenantModal: (tenant?: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
  onUpdateTenantNote: (tenantId: string, notes: string) => void;
}

export const BuildingView: React.FC<BuildingViewProps> = ({
  buildingId,
  buildingName,
  buildingDescription,
  tenants,
  payments,
  currentYear,
  simulatedDate,
  overdueAlerts,
  onOpenPaymentModal,
  onOpenTenantModal,
  onDeleteTenant,
  onUpdateTenantNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMonthRange, setVisibleMonthRange] = useState<'q3q4' | 'all'>('q3q4');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const displayedMonths = visibleMonthRange === 'q3q4'
    ? MONTHS.filter(m => m.value >= 8)
    : MONTHS;

  const simYear = simulatedDate.getFullYear();
  const simMonth = simulatedDate.getMonth();
  const simDay = simulatedDate.getDate();

  const filteredTenants = tenants.filter(t => 
    t.dpto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPayment = (tenantId: string, month: number, year: number) => {
    return payments.find(p => p.tenantId === tenantId && p.month === month && p.year === year);
  };

  const isCellOverdue = (tenant: Tenant, month: number, year: number) => {
    if (tenant.isVacant || tenant.paymentDay === null) return false;
    const payment = getPayment(tenant.id, month, year);
    if (payment && payment.amount > 0) return false;

    if (year < simYear) return true;
    if (year > simYear) return false;

    if (month < simMonth) return true;
    if (month === simMonth && simDay > tenant.paymentDay) return true;

    return false;
  };

  const getMonthTotal = (month: number) => {
    return tenants.reduce((sum, tenant) => {
      const payment = getPayment(tenant.id, month, currentYear);
      return sum + (payment ? payment.amount : 0);
    }, 0);
  };

  const currentMonthPayments = tenants.filter(t => {
    const p = getPayment(t.id, simMonth, currentYear);
    return p && p.amount > 0;
  }).length;

  const currentMonthOverdue = tenants.filter(t => isCellOverdue(t, simMonth, currentYear)).length;
  const occupiedUnits = tenants.filter(t => !t.isVacant).length;
  const vacantUnits = tenants.filter(t => t.isVacant).length;
  const currentMonthTotalAmount = getMonthTotal(simMonth);

  return (
    <div className="space-y-4 pb-16 sm:pb-4">
      {/* Top summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Pagados ({MONTHS[simMonth].short})</p>
            <p className="text-base sm:text-lg font-bold text-slate-900">{currentMonthPayments} / {occupiedUnits}</p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
            currentMonthOverdue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Con Retraso</p>
            <p className={`text-base sm:text-lg font-bold truncate ${currentMonthOverdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {currentMonthOverdue} inquilinos
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold flex-shrink-0">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Unidades</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {occupiedUnits} <span className="text-[11px] font-normal text-slate-500">({vacantUnits} vac.)</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">Total {MONTHS[simMonth].short}</p>
            <p className="text-base sm:text-lg font-bold text-indigo-700 truncate">{formatCurrency(currentMonthTotalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Toolbar & View Switcher */}
        <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar dpto o inquilino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md transition flex items-center gap-1 ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
                title="Vista en tarjetas táctiles (ideal para celular)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md transition flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
                title="Vista tabla tipo Excel"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Tabla</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setVisibleMonthRange('q3q4')}
                className={`px-2 py-1 rounded-md transition ${
                  visibleMonthRange === 'q3q4' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Sep - Dic
              </button>
              <button
                onClick={() => setVisibleMonthRange('all')}
                className={`px-2 py-1 rounded-md transition ${
                  visibleMonthRange === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                12 Meses
              </button>
            </div>

            <button
              onClick={() => onOpenTenantModal()}
              className="flex items-center gap-1 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Mobile Friendly Cards View */}
        {viewMode === 'cards' ? (
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTenants.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No se encontraron departamentos registrados.
              </div>
            ) : (
              filteredTenants.map((tenant) => {
                const isOverdueCurrentMonth = isCellOverdue(tenant, simMonth, currentYear);
                const dayFormatted = tenant.paymentDay !== null && tenant.paymentDay !== undefined
                  ? String(tenant.paymentDay).padStart(2, '0')
                  : '';

                return (
                  <div
                    key={tenant.id}
                    className={`bg-white rounded-xl border transition-all p-3.5 flex flex-col justify-between gap-3 shadow-xs ${
                      isOverdueCurrentMonth
                        ? 'border-rose-400 ring-1 ring-rose-300 bg-rose-50/20'
                        : tenant.isVacant
                        ? 'border-dashed border-slate-300 bg-slate-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-sky-900 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                          {tenant.dpto}
                        </span>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-bold truncate ${tenant.isVacant ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                            {tenant.name}
                          </h4>
                          {tenant.paymentDay ? (
                            <span className="text-[11px] font-semibold text-slate-500">
                              Límite: <strong className="text-sky-800">Día {dayFormatted}</strong>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Sin fecha fija</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!tenant.isVacant && tenant.paymentDay && isOverdueCurrentMonth && (
                          <a
                            href={getWhatsAppReminderLink(
                              tenant.phone,
                              tenant.name,
                              tenant.dpto,
                              buildingName,
                              MONTHS[simMonth].label,
                              tenant.paymentDay
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition shadow-xs flex items-center gap-1 text-[11px] font-bold"
                            title="Cobrar por WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onOpenTenantModal(tenant)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTenant(tenant.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isOverdueCurrentMonth && (
                      <div className="flex items-center gap-1.5 bg-rose-100/80 border border-rose-300 text-rose-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse flex-shrink-0" />
                        <span className="truncate">Retraso en pago de {MONTHS[simMonth].label}</span>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        Meses de Renta ({currentYear})
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {displayedMonths.map((m) => {
                          const payment = getPayment(tenant.id, m.value, currentYear);
                          const isOverdue = isCellOverdue(tenant, m.value, currentYear);
                          const hasPayment = payment && payment.amount > 0;

                          return (
                            <button
                              key={m.value}
                              onClick={() => onOpenPaymentModal(tenant, m.value)}
                              className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center justify-center cursor-pointer select-none ${
                                hasPayment
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : isOverdue
                                  ? 'bg-rose-100 border-2 border-rose-500 text-rose-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-sky-50 hover:border-sky-300'
                              }`}
                            >
                              <span className="text-[10px] font-bold">{m.short}</span>
                              <span className="text-[10px] font-extrabold truncate w-full mt-0.5">
                                {hasPayment ? (
                                  `$${payment.amount}`
                                ) : isOverdue ? (
                                  <span className="text-rose-600 font-black">Vencido</span>
                                ) : (
                                  <span className="text-slate-400 font-normal">+ Renta</span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {tenant.notes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 truncate">
                        📝 {tenant.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* VIEW 2: Excel Matrix Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-900 text-white text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-3 border-r border-sky-800 text-center w-14">
                    Dpto.
                  </th>
                  <th className="py-3 px-3 border-r border-sky-800 min-w-[160px]">
                    Nombre y Día de Pago
                  </th>
                  {displayedMonths.map((m) => (
                    <th
                      key={m.value}
                      className={`py-3 px-3 border-r border-sky-800 text-right min-w-[110px] ${
                        m.value === simMonth && currentYear === simYear ? 'bg-sky-800 text-yellow-300 font-extrabold' : ''
                      }`}
                    >
                      {m.label}
                    </th>
                  ))}
                  <th className="py-3 px-3 border-r border-sky-800 min-w-[180px]">
                    Observaciones
                  </th>
                  <th className="py-3 px-2 text-center w-16">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-700">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={displayedMonths.length + 4} className="py-8 text-center text-slate-400">
                      No se encontraron departamentos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant, idx) => {
                    const isVacant = tenant.isVacant;
                    const dayFormatted = tenant.paymentDay !== null && tenant.paymentDay !== undefined
                      ? String(tenant.paymentDay).padStart(2, '0')
                      : '';

                    return (
                      <tr
                        key={tenant.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-center border-r border-slate-200 text-slate-900 bg-slate-100/50">
                          {tenant.dpto}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-semibold ${isVacant ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                              {tenant.name} {dayFormatted ? <span className="font-bold text-sky-800 ml-1">{dayFormatted}</span> : ''}
                            </span>
                            {!isVacant && tenant.paymentDay && isCellOverdue(tenant, simMonth, currentYear) && (
                              <a
                                href={getWhatsAppReminderLink(
                                  tenant.phone,
                                  tenant.name,
                                  tenant.dpto,
                                  buildingName,
                                  MONTHS[simMonth].label,
                                  tenant.paymentDay
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                                title="Enviar recordatorio WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {displayedMonths.map((m) => {
                          const payment = getPayment(tenant.id, m.value, currentYear);
                          const isOverdue = isCellOverdue(tenant, m.value, currentYear);
                          const hasPayment = payment && payment.amount > 0;

                          return (
                            <td
                              key={m.value}
                              onClick={() => onOpenPaymentModal(tenant, m.value)}
                              className={`py-2 px-3 border-r border-slate-200 text-right cursor-pointer select-none transition-all ${
                                hasPayment
                                  ? 'bg-emerald-50/50 text-emerald-900 font-bold hover:bg-emerald-100/60'
                                  : isOverdue
                                  ? 'bg-rose-50 border-2 border-rose-500 text-rose-700 font-bold hover:bg-rose-100'
                                  : 'hover:bg-sky-50 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {hasPayment ? (
                                  <span className="text-emerald-700 font-bold">
                                    {formatPlainCurrency(payment.amount)}
                                  </span>
                                ) : isOverdue ? (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-rose-600 animate-pulse" />
                                    <span className="text-rose-600 font-black text-[11px]">Vencido</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-[11px]">+ Cobrar</span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                          <input
                            type="text"
                            defaultValue={tenant.notes || ''}
                            onBlur={(e) => onUpdateTenantNote(tenant.id, e.target.value)}
                            placeholder="Agregar nota..."
                            className="w-full bg-transparent hover:bg-white focus:bg-white px-1 py-0.5 rounded border border-transparent focus:border-slate-300 outline-none text-xs text-slate-700"
                          />
                        </td>

                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenTenantModal(tenant)}
                              className="p-1 text-slate-400 hover:text-sky-600 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTenant(tenant.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-sky-100/70 text-slate-900 font-extrabold border-t-2 border-sky-300 text-xs">
                  <td className="py-2.5 px-3 text-center border-r border-sky-200 bg-sky-200/50">
                    Total
                  </td>
                  <td className="py-2.5 px-3 border-r border-sky-200 text-slate-600 font-medium">
                    {tenants.length} Dptos.
                  </td>
                  {displayedMonths.map((m) => {
                    const total = getMonthTotal(m.value);
                    return (
                      <td
                        key={m.value}
                        className="py-2.5 px-3 border-r border-sky-200 text-right font-black text-sky-950"
                      >
                        {formatPlainCurrency(total)}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 border-r border-sky-200 text-slate-400 font-normal">
                    Totales
                  </td>
                  <td className="py-2.5 px-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="px-3 sm:px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400 inline-block"></span>
              Pagada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-200 border-2 border-rose-500 inline-block"></span>
              Vencida
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block"></span>
              Pendiente
            </span>
          </div>
          <span>Toca cualquier mes para ingresar la renta.</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { OverdueAlert, Tenant, BuildingId } from '../types';
import { MONTHS, getWhatsAppReminderLink } from '../utils/formatters';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  MessageSquare, 
  DollarSign, 
  Building2, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  overdueAlerts: OverdueAlert[];
  onOpenPaymentModal: (tenantId: string, buildingId: BuildingId, month: number) => void;
  simulatedDate: Date;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  overdueAlerts,
  onOpenPaymentModal,
  simulatedDate,
}) => {
  if (!isOpen) return null;

  const currentMonthName = MONTHS[simulatedDate.getMonth()].label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Centro de Notificaciones y Cobranza
              </h3>
              <p className="text-xs text-rose-100">
                {overdueAlerts.length} inquilinos con retraso en el pago de renta de {currentMonthName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-3">
          {overdueAlerts.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">
                ¡Excelente! No hay rentas atrasadas
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Todos los inquilinos están al corriente o aún no se cumple su fecha límite de pago para este periodo.
              </p>
            </div>
          ) : (
            overdueAlerts.map((alert) => (
              <div
                key={alert.id}
                className="pt-3 first:pt-0 bg-rose-50/50 border border-rose-200/80 rounded-xl p-4 transition hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  {/* Info details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {alert.tenantName}
                      </span>
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {alert.daysLate} día(s) de retraso
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-sky-600" />
                        Edificio {alert.buildingName} • Dpto. {alert.dpto}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        Día límite fijado: <strong>Día {alert.paymentDay}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-rose-700 font-medium">
                      ⚠️ Mensaje: El inquilino tiene pago pendiente del mes de {MONTHS[alert.month].label} {alert.year}.
                    </p>
                  </div>

                  {/* Actions: WhatsApp + Pay button */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <a
                      href={getWhatsAppReminderLink(
                        alert.phone,
                        alert.tenantName,
                        alert.dpto,
                        alert.buildingName,
                        MONTHS[alert.month].label,
                        alert.paymentDay
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Enviar mensaje pre-redactado de cobro por WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => {
                        onClose();
                        onOpenPaymentModal(alert.tenantId, alert.buildingId, alert.month);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Cobrar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

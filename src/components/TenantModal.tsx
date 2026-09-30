import React, { useState } from 'react';
import { Tenant } from '../types';
import { X, Save, User, Calendar, FileText, Phone, Check } from 'lucide-react';

interface TenantModalProps {
  tenant?: Tenant | null;
  buildingName: string;
  onSaveTenant: (tenant: Tenant) => void;
  onClose: () => void;
}

export const TenantModal: React.FC<TenantModalProps> = ({
  tenant,
  buildingName,
  onSaveTenant,
  onClose,
}) => {
  const isEditing = !!tenant;
  const [dpto, setDpto] = useState(tenant?.dpto || '');
  const [name, setName] = useState(tenant?.name || '');
  const [paymentDay, setPaymentDay] = useState<string>(
    tenant?.paymentDay !== null && tenant?.paymentDay !== undefined
      ? String(tenant.paymentDay)
      : ''
  );
  const [phone, setPhone] = useState(tenant?.phone || '');
  const [notes, setNotes] = useState(tenant?.notes || '');
  const [isVacant, setIsVacant] = useState(tenant?.isVacant || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpto.trim()) {
      setError('El número o identificador del departamento es obligatorio');
      return;
    }

    const dayNum = paymentDay.trim() === '' ? null : parseInt(paymentDay, 10);
    if (dayNum !== null && (isNaN(dayNum) || dayNum < 1 || dayNum > 31)) {
      setError('El día de pago debe ser un número entre 1 y 31 (o dejar en blanco)');
      return;
    }

    const updatedTenant: Tenant = {
      id: tenant?.id || `tenant-${Date.now()}`,
      dpto: dpto.trim(),
      name: isVacant ? '(Disponible)' : (name.trim() || 'Sin Asignar'),
      paymentDay: dayNum,
      phone: phone.trim(),
      notes: notes.trim(),
      isVacant,
    };

    onSaveTenant(updatedTenant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-slate-800 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">
              {buildingName}
            </span>
            <h3 className="text-lg font-bold">
              {isEditing ? `Editar Dpto. ${tenant.dpto}` : 'Nuevo Departamento / Inquilino'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Dpto & Vacant check */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dpto. / Unidad *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1, 2, PH, etc."
                value={dpto}
                onChange={(e) => setDpto(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>
            <div className="pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isVacant}
                  onChange={(e) => setIsVacant(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <span>Marcar como Desocupado</span>
              </label>
            </div>
          </div>

          {/* Tenant Name */}
          {!isVacant && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> Nombre del Inquilino *
              </label>
              <input
                type="text"
                required={!isVacant}
                placeholder="Ej. Kenia, Luis, Claudia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>
          )}

          {/* Payment Day & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Día de Pago (1 - 31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Ej. 09, 18, 24"
                value={paymentDay}
                onChange={(e) => setPaymentDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Para el cálculo de alertas de retraso.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Ej. 5512345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Sin amueblar, cochera incluida, depósito pendiente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Inquilino</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

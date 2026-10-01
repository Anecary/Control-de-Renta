'use client';

import React, { useState } from 'react';
import { BuildingId, Tenant, PaymentRecord } from '@/types';
import { MONTHS } from '@/utils/formatters';
import { X, CheckCircle2, Calendar, CreditCard, Trash2 } from 'lucide-react';

interface PaymentCellModalProps {
  tenant: Tenant;
  buildingId: BuildingId;
  buildingName: string;
  month: number;
  year: number;
  existingPayment?: PaymentRecord;
  onSavePayment: (payment: PaymentRecord) => void;
  onDeletePayment: (paymentId: string) => void;
  onClose: () => void;
}

export const PaymentCellModal: React.FC<PaymentCellModalProps> = ({
  tenant,
  buildingId,
  buildingName,
  month,
  year,
  existingPayment,
  onSavePayment,
  onDeletePayment,
  onClose,
}) => {
  const [amount, setAmount] = useState<string>(
    existingPayment ? String(existingPayment.amount) : ''
  );
  const [paidAt, setPaidAt] = useState<string>(
    existingPayment?.paidAt || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro'
  >(existingPayment?.paymentMethod || 'Transferencia');
  const [notes, setNotes] = useState<string>(existingPayment?.notes || '');
  const [error, setError] = useState<string>('');

  const monthObj = MONTHS.find((m) => m.value === month);
  const monthName = monthObj ? monthObj.label : `Mes ${month + 1}`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    const record: PaymentRecord = {
      id: existingPayment?.id || `pay-${tenant.id}-${year}-${month}-${Date.now()}`,
      tenantId: tenant.id,
      buildingId,
      month,
      year,
      amount: numAmount,
      paidAt,
      paymentMethod,
      notes: notes.trim(),
    };

    onSavePayment(record);
    onClose();
  };

  const handleDelete = () => {
    if (existingPayment) {
      if (window.confirm('¿Deseas eliminar este registro de pago y marcarlo como pendiente?')) {
        onDeletePayment(existingPayment.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-sky-700 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-sky-200">
              {buildingName} • Dpto. {tenant.dpto}
            </span>
            <h3 className="text-lg font-bold">
              {existingPayment ? 'Modificar Pago' : 'Registrar Pago de Renta'}
            </h3>
            <p className="text-xs text-sky-100">
              Inquilino: <span className="font-semibold text-white">{tenant.name}</span> {tenant.paymentDay ? `(Día límite: ${tenant.paymentDay})` : ''} • Mes: <span className="font-semibold text-white">{monthName} {year}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Monto de Renta ($ MXN) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                autoFocus
                placeholder="Ej. 6500.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-lg focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Introduce el valor acordado o pagado para este mes específico.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Fecha de Pago
              </label>
              <input
                type="date"
                required
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Método
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 outline-none cursor-pointer"
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas / Observaciones del pago (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Pagó completo con recibo #459 / depósito BBVA"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:border-sky-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {existingPayment ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Borrar Pago</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Pago</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

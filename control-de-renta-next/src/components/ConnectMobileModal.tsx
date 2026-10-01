'use client';

import React from 'react';
import { X, Smartphone, Wifi, CheckCircle2, Copy } from 'lucide-react';

interface ConnectMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
  port: number;
}

export const ConnectMobileModal: React.FC<ConnectMobileModalProps> = ({
  isOpen,
  onClose,
  localIp,
  port,
}) => {
  if (!isOpen) return null;

  const mobileUrl = `http://${localIp}:${port}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    mobileUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    alert('¡Enlace copiado al portapapeles!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-sky-700 to-indigo-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Abrir en tu Teléfono Móvil
              </h3>
              <p className="text-xs text-sky-100">
                Next.js + PostgreSQL (Neon)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Misma red Wi-Fi conectada</span>
          </div>

          <p className="text-xs text-slate-600">
            Escanea este código QR con la <strong>cámara de tu celular</strong> o ingresa la siguiente dirección en tu navegador:
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block shadow-inner">
            <img
              src={qrApiUrl}
              alt="Código QR para celular"
              className="w-48 h-48 mx-auto rounded-lg"
              loading="lazy"
            />
          </div>

          <div className="flex items-center justify-center gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-300">
            <span className="text-xs font-mono font-bold text-slate-900 select-all">
              {mobileUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 text-sky-700 hover:bg-sky-100 rounded-md transition cursor-pointer"
              title="Copiar enlace"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="text-left bg-sky-50/70 p-3 rounded-xl border border-sky-200/60 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-sky-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              Tip: Instálala como App en tu celular
            </p>
            <p className="text-[11px] text-slate-600">
              En Safari (iPhone): <strong>Compartir → "Agregar a pantalla de inicio"</strong>.<br/>
              En Chrome (Android): <strong>Menú (3 puntos) → "Instalar aplicación"</strong>.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

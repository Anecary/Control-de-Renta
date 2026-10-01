'use client';

import React from 'react';
import { BuildingId, OverdueAlert } from '@/types';
import { BUILDINGS_INFO } from '@/data/initialData';
import { Building2, Receipt, PieChart, Bell } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: BuildingId | 'expenses' | 'dashboard';
  setActiveTab: (tab: BuildingId | 'expenses' | 'dashboard') => void;
  overdueAlerts: OverdueAlert[];
  setIsNotificationOpen: (open: boolean) => void;
  onOpenConnectMobileModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  overdueAlerts,
  setIsNotificationOpen,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around">
        {BUILDINGS_INFO.map((b) => {
          const isActive = activeTab === b.id;
          const bOverdue = overdueAlerts.filter((a) => a.buildingId === b.id).length;
          return (
            <button
              key={b.id}
              onClick={() => setActiveTab(b.id)}
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
                isActive ? 'text-sky-700 font-bold' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <Building2 className={`w-5 h-5 ${isActive ? 'text-sky-700' : 'text-slate-400'}`} />
                {bOverdue > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                    {bOverdue}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[58px]">
                {b.name}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            activeTab === 'expenses' ? 'text-amber-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Receipt className={`w-5 h-5 ${activeTab === 'expenses' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Gastos</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <PieChart className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Métricas</span>
        </button>

        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-500 flex-1"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-400" />
            {overdueAlerts.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce">
                {overdueAlerts.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Alertas</span>
        </button>
      </div>
    </nav>
  );
};

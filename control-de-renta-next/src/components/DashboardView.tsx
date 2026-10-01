'use client';

import React from 'react';
import { BuildingId, Tenant, PaymentRecord, Expense } from '@/types';
import { BUILDINGS_INFO } from '@/data/initialData';
import { MONTHS, formatCurrency } from '@/utils/formatters';
import { 
  TrendingUp, 
  TrendingDown, 
  Building, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardViewProps {
  tenants: Record<BuildingId, Tenant[]>;
  payments: PaymentRecord[];
  expenses: Expense[];
  currentYear: number;
  simulatedDate: Date;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tenants,
  payments,
  expenses,
  currentYear,
  simulatedDate,
}) => {
  const simMonth = simulatedDate.getMonth();

  const totalYearIncome = payments
    .filter((p) => p.year === currentYear)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalYearExpenses = expenses.reduce((sum, e) => {
    const expYear = new Date(e.date).getFullYear();
    return expYear === currentYear ? sum + e.amount : sum;
  }, 0);

  const netYearProfit = totalYearIncome - totalYearExpenses;

  const currentMonthIncome = payments
    .filter((p) => p.year === currentYear && p.month === simMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonthExpenses = expenses.reduce((sum, e) => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === simMonth
      ? sum + e.amount
      : sum;
  }, 0);

  const currentMonthProfit = currentMonthIncome - currentMonthExpenses;

  const allTenantsList = Object.values(tenants).flat();
  const totalUnits = allTenantsList.length;
  const occupiedUnits = allTenantsList.filter((t) => !t.isVacant).length;
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(0) : 0;

  const buildingStats = BUILDINGS_INFO.map((b) => {
    const bTenants = tenants[b.id] || [];
    const bOccupied = bTenants.filter((t) => !t.isVacant).length;
    
    const bIncomeYear = payments
      .filter((p) => p.buildingId === b.id && p.year === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);

    const bIncomeMonth = payments
      .filter((p) => p.buildingId === b.id && p.year === currentYear && p.month === simMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const bExpensesYear = expenses.reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === currentYear && (e.buildingId === b.id || e.buildingId === 'general')) {
        const share = e.buildingId === 'general' ? e.amount / 4 : e.amount;
        return sum + share;
      }
      return sum;
    }, 0);

    const bExpensesMonth = expenses.reduce((sum, e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === currentYear && d.getMonth() === simMonth && (e.buildingId === b.id || e.buildingId === 'general')) {
        const share = e.buildingId === 'general' ? e.amount / 4 : e.amount;
        return sum + share;
      }
      return sum;
    }, 0);

    const bProfitMonth = bIncomeMonth - bExpensesMonth;

    return {
      ...b,
      totalUnits: bTenants.length,
      occupiedUnits: bOccupied,
      incomeMonth: bIncomeMonth,
      expensesMonth: bExpensesMonth,
      profitMonth: bProfitMonth,
      incomeYear: bIncomeYear,
      expensesYear: bExpensesYear,
      profitYear: bIncomeYear - bExpensesYear,
    };
  });

  return (
    <div className="space-y-6 pb-16 sm:pb-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Resumen Financiero y Métricas ({currentYear})
        </h2>
        <p className="text-xs text-slate-500">
          Balance de ingresos por cobro de rentas, gastos operativos y utilidad neta en PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Ingresos ({MONTHS[simMonth].label})
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(currentMonthIncome)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Año {currentYear}: {formatCurrency(totalYearIncome)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Gastos ({MONTHS[simMonth].label})
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(currentMonthExpenses)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Año {currentYear}: {formatCurrency(totalYearExpenses)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Utilidad Neta ({MONTHS[simMonth].label})
            </span>
            <div className={`p-2 rounded-lg ${currentMonthProfit >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${currentMonthProfit >= 0 ? 'text-sky-700' : 'text-rose-600'}`}>
            {formatCurrency(currentMonthProfit)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-1">
            <span>Utilidad anual: {formatCurrency(netYearProfit)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Ocupación Total
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900 mt-2">
            {occupancyRate}%
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-1">
            <span>{occupiedUnits} ocupados de {totalUnits} dptos.</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Desglose por Edificio (Mes de {MONTHS[simMonth].label} {currentYear})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildingStats.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {b.code}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{b.name}</h4>
                    <span className="text-xs text-slate-500">
                      {b.occupiedUnits} de {b.totalUnits} departamentos ocupados
                    </span>
                  </div>
                </div>

                <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
                  {((b.occupiedUnits / b.totalUnits) * 100).toFixed(0)}% Ocupado
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Ingresos
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                    {formatCurrency(b.incomeMonth)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Gastos
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-600">
                    {formatCurrency(b.expensesMonth)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Utilidad
                  </span>
                  <span className={`text-xs sm:text-sm font-black ${b.profitMonth >= 0 ? 'text-sky-700' : 'text-rose-600'}`}>
                    {formatCurrency(b.profitMonth)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Acumulado del año ({currentYear}):</span>
                <span className="font-bold text-slate-800">
                  Ingreso: {formatCurrency(b.incomeYear)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

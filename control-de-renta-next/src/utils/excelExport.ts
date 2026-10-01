import * as XLSX from 'xlsx';
import { BuildingId, Tenant, PaymentRecord, Expense } from '../types';
import { BUILDINGS_INFO } from '../data/initialData';

export const exportAllToExcel = (
  tenants: Record<BuildingId, Tenant[]>,
  payments: PaymentRecord[],
  expenses: Expense[],
  year: number
) => {
  const wb = XLSX.utils.book_new();

  BUILDINGS_INFO.forEach((b) => {
    const bTenants = tenants[b.id] || [];
    
    const headers = [
      'Dpto.',
      'Nombre y Día de Pago',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
      'Observaciones'
    ];

    const rows: any[][] = [];

    let totalSep = 0;
    let totalOct = 0;
    let totalNov = 0;
    let totalDic = 0;

    bTenants.forEach((tenant) => {
      const getP = (m: number) => {
        const found = payments.find(
          (p) => p.tenantId === tenant.id && p.buildingId === b.id && p.year === year && p.month === m
        );
        return found ? found.amount : 0;
      };

      const sep = getP(8);
      const oct = getP(9);
      const nov = getP(10);
      const dic = getP(11);

      totalSep += sep;
      totalOct += oct;
      totalNov += nov;
      totalDic += dic;

      const dayStr = tenant.paymentDay ? ` ${String(tenant.paymentDay).padStart(2, '0')}` : '';
      const nameCol = tenant.isVacant ? '(Disponible)' : `${tenant.name}${dayStr}`;

      rows.push([
        tenant.dpto,
        nameCol,
        sep || '',
        oct || '',
        nov || '',
        dic || '',
        tenant.notes || ''
      ]);
    });

    rows.push([
      'Total',
      '',
      totalSep,
      totalOct,
      totalNov,
      totalDic,
      ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, b.name);
  });

  const expenseHeaders = ['Fecha', 'Monto', 'Tipo de Gasto', 'Edificio', 'Observaciones'];
  const expenseRows = expenses.map((e) => {
    const bName = e.buildingId === 'general' 
      ? 'General' 
      : BUILDINGS_INFO.find((item) => item.id === e.buildingId)?.name || e.buildingId;
    return [e.date, e.amount, e.category, bName, e.notes || ''];
  });

  const wsExpenses = XLSX.utils.aoa_to_sheet([expenseHeaders, ...expenseRows]);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Gastos');

  XLSX.writeFile(wb, `Control_Rentas_y_Gastos_${year}.xlsx`);
};

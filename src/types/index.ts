export type BuildingId = 'marmota' | 'cuyo' | 'mapache' | 'suites_ardillas';

export interface Tenant {
  id: string;
  dpto: string; // e.g. "1", "2", "PH"
  name: string; // e.g. "Kenia", "Luis"
  paymentDay: number | null; // e.g. 9, 24, null for "Sin fecha"
  phone?: string;
  notes?: string;
  isVacant?: boolean;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  buildingId: BuildingId;
  month: number; // 0 to 11 (0=Jan, 8=Sept, 9=Oct, 10=Nov, 11=Dec)
  year: number;
  amount: number;
  paidAt?: string; // ISO date or YYYY-MM-DD
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro';
  notes?: string;
}

export type ExpenseCategory = 
  | 'Internet y televisión'
  | 'Luz / CFE'
  | 'Agua'
  | 'Limpieza'
  | 'Mantenimiento y reparaciones'
  | 'Administración'
  | 'Seguridad'
  | 'Predial'
  | 'Otros';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory | string;
  buildingId: BuildingId | 'general';
  notes?: string;
}

export interface OverdueAlert {
  id: string;
  tenantId: string;
  tenantName: string;
  dpto: string;
  buildingId: BuildingId;
  buildingName: string;
  paymentDay: number;
  month: number;
  year: number;
  daysLate: number;
  phone?: string;
}

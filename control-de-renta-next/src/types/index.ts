export type BuildingId = 'marmota' | 'cuyo' | 'mapache' | 'suites_ardillas';

export interface Tenant {
  id: string;
  dpto: string;
  name: string;
  paymentDay: number | null;
  phone?: string;
  notes?: string;
  isVacant?: boolean;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  buildingId: BuildingId;
  month: number;
  year: number;
  amount: number;
  paidAt?: string;
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
  date: string;
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

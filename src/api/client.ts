import { BuildingId, Tenant, PaymentRecord, Expense } from '../types';

const API_BASE = '/api';

export const api = {
  // Health / Connection status
  async checkHealth(): Promise<{ status: string; db: string; time?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('API offline');
      return await res.json();
    } catch (e: any) {
      return { status: 'error', db: 'disconnected' };
    }
  },

  // Tenants
  async getTenants(): Promise<Record<BuildingId, Tenant[]>> {
    const res = await fetch(`${API_BASE}/tenants`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al obtener inquilinos');
    return json.data;
  },

  async saveTenant(tenant: Tenant, buildingId: BuildingId): Promise<Tenant> {
    const res = await fetch(`${API_BASE}/tenants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tenant, buildingId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al guardar inquilino');
    return json.data;
  },

  async deleteTenant(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tenants/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al eliminar inquilino');
  },

  // Payments
  async getPayments(year?: number): Promise<PaymentRecord[]> {
    const url = year ? `${API_BASE}/payments?year=${year}` : `${API_BASE}/payments`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al obtener pagos');
    return json.data;
  },

  async savePayment(payment: PaymentRecord): Promise<PaymentRecord> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al guardar pago');
    return json.data;
  },

  async deletePayment(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/payments/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al eliminar pago');
  },

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    const res = await fetch(`${API_BASE}/expenses`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al obtener gastos');
    return json.data;
  },

  async saveExpense(expense: Expense): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al guardar gasto');
    return json.data;
  },

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error al eliminar gasto');
  },
};

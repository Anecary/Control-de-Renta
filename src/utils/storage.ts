import { BuildingId, Tenant, PaymentRecord, Expense } from '../types';
import { INITIAL_TENANTS, INITIAL_EXPENSES } from '../data/initialData';

const TENANTS_STORAGE_KEY = 'rentas_tenants_v1';
const PAYMENTS_STORAGE_KEY = 'rentas_payments_v1';
const EXPENSES_STORAGE_KEY = 'rentas_expenses_v1';

export const loadTenants = (): Record<BuildingId, Tenant[]> => {
  try {
    const data = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading tenants from localStorage', e);
  }
  return INITIAL_TENANTS;
};

export const saveTenants = (tenants: Record<BuildingId, Tenant[]>) => {
  try {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
  } catch (e) {
    console.error('Error saving tenants to localStorage', e);
  }
};

export const loadPayments = (): PaymentRecord[] => {
  try {
    const data = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading payments from localStorage', e);
  }
  return [];
};

export const savePayments = (payments: PaymentRecord[]) => {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch (e) {
    console.error('Error saving payments to localStorage', e);
  }
};

export const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading expenses from localStorage', e);
  }
  return INITIAL_EXPENSES;
};

export const saveExpenses = (expenses: Expense[]) => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage', e);
  }
};

export const resetToDefaultData = () => {
  localStorage.removeItem(TENANTS_STORAGE_KEY);
  localStorage.removeItem(PAYMENTS_STORAGE_KEY);
  localStorage.removeItem(EXPENSES_STORAGE_KEY);
  return {
    tenants: INITIAL_TENANTS,
    payments: [],
    expenses: INITIAL_EXPENSES
  };
};

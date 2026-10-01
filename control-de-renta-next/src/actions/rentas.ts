'use server';

import { prisma } from '@/lib/prisma';
import { BuildingId, Tenant, PaymentRecord, Expense } from '@/types';
import { INITIAL_TENANTS, INITIAL_EXPENSES } from '@/data/initialData';
import { revalidatePath } from 'next/cache';

// 1. Health check Server Action
export async function checkDbHealthAction(): Promise<{ status: string; db: string; time?: string }> {
  try {
    const res: any = await prisma.$queryRaw`SELECT NOW() as now;`;
    return { status: 'ok', db: 'connected', time: res[0]?.now?.toISOString() };
  } catch (error: any) {
    console.error('[Server Action] Error checking DB health:', error);
    return { status: 'error', db: 'disconnected' };
  }
}

// 2. Ensure initial seed data exists in PostgreSQL
export async function seedInitialDataIfEmptyAction(): Promise<void> {
  try {
    const count = await prisma.tenant.count();
    if (count === 0) {
      console.log('🌱 [Server Action] Seeding initial data via Prisma...');
      for (const [bId, tList] of Object.entries(INITIAL_TENANTS)) {
        for (const t of tList) {
          await prisma.tenant.upsert({
            where: { id: t.id },
            update: {},
            create: {
              id: t.id,
              buildingId: bId,
              dpto: t.dpto,
              name: t.name,
              paymentDay: t.paymentDay,
              phone: t.phone || '',
              notes: t.notes || '',
              isVacant: t.isVacant || false,
            },
          });
        }
      }

      for (const exp of INITIAL_EXPENSES) {
        await prisma.expense.upsert({
          where: { id: exp.id },
          update: {},
          create: {
            id: exp.id,
            date: new Date(exp.date),
            amount: exp.amount,
            category: exp.category,
            buildingId: exp.buildingId,
            notes: exp.notes || '',
          },
        });
      }
    }
  } catch (error) {
    console.error('[Server Action] Seed error:', error);
  }
}

// 3. Tenants Server Actions
export async function getTenantsAction(): Promise<Record<BuildingId, Tenant[]>> {
  await seedInitialDataIfEmptyAction();
  const dbTenants = await prisma.tenant.findMany({
    orderBy: [
      { buildingId: 'asc' },
      { dpto: 'asc' }
    ],
  });

  const grouped: Record<BuildingId, Tenant[]> = {
    marmota: [],
    cuyo: [],
    mapache: [],
    suites_ardillas: []
  };

  dbTenants.forEach((t) => {
    const bId = t.buildingId as BuildingId;
    if (grouped[bId]) {
      grouped[bId].push({
        id: t.id,
        dpto: t.dpto,
        name: t.name,
        paymentDay: t.paymentDay,
        phone: t.phone || '',
        notes: t.notes || '',
        isVacant: t.isVacant,
      });
    }
  });

  // Sort natural order by numeric Dpto
  for (const bId of Object.keys(grouped) as BuildingId[]) {
    grouped[bId].sort((a, b) => {
      if (a.dpto === 'PH') return 1;
      if (b.dpto === 'PH') return -1;
      const numA = parseInt(a.dpto.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.dpto.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }

  return grouped;
}

export async function saveTenantAction(tenant: Tenant, buildingId: BuildingId): Promise<Tenant> {
  const tenantId = tenant.id || `tenant-${Date.now()}`;
  const saved = await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {
      buildingId,
      dpto: tenant.dpto,
      name: tenant.name,
      paymentDay: tenant.paymentDay,
      phone: tenant.phone || '',
      notes: tenant.notes || '',
      isVacant: !!tenant.isVacant,
    },
    create: {
      id: tenantId,
      buildingId,
      dpto: tenant.dpto,
      name: tenant.name,
      paymentDay: tenant.paymentDay,
      phone: tenant.phone || '',
      notes: tenant.notes || '',
      isVacant: !!tenant.isVacant,
    },
  });

  revalidatePath('/');
  return {
    id: saved.id,
    dpto: saved.dpto,
    name: saved.name,
    paymentDay: saved.paymentDay,
    phone: saved.phone || '',
    notes: saved.notes || '',
    isVacant: saved.isVacant,
  };
}

export async function deleteTenantAction(id: string): Promise<{ success: boolean }> {
  await prisma.tenant.delete({
    where: { id },
  });
  revalidatePath('/');
  return { success: true };
}

// 4. Payments Server Actions
export async function getPaymentsAction(year?: number): Promise<PaymentRecord[]> {
  const where = year ? { year } : {};
  const dbPayments = await prisma.payment.findMany({
    where,
    orderBy: [
      { year: 'desc' },
      { month: 'asc' },
    ],
  });

  return dbPayments.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    buildingId: p.buildingId as BuildingId,
    month: p.month,
    year: p.year,
    amount: p.amount,
    paidAt: p.paidAt ? p.paidAt.toISOString().split('T')[0] : undefined,
    paymentMethod: (p.paymentMethod as any) || 'Transferencia',
    notes: p.notes || '',
  }));
}

export async function savePaymentAction(payment: PaymentRecord): Promise<PaymentRecord> {
  const paymentId = payment.id || `pay-${payment.tenantId}-${payment.year}-${payment.month}-${Date.now()}`;
  const paidDate = payment.paidAt ? new Date(payment.paidAt) : null;

  const saved = await prisma.payment.upsert({
    where: {
      tenantId_month_year: {
        tenantId: payment.tenantId,
        month: payment.month,
        year: payment.year,
      },
    },
    update: {
      buildingId: payment.buildingId,
      amount: payment.amount,
      paidAt: paidDate,
      paymentMethod: payment.paymentMethod || 'Transferencia',
      notes: payment.notes || '',
    },
    create: {
      id: paymentId,
      tenantId: payment.tenantId,
      buildingId: payment.buildingId,
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      paidAt: paidDate,
      paymentMethod: payment.paymentMethod || 'Transferencia',
      notes: payment.notes || '',
    },
  });

  revalidatePath('/');
  return {
    id: saved.id,
    tenantId: saved.tenantId,
    buildingId: saved.buildingId as BuildingId,
    month: saved.month,
    year: saved.year,
    amount: saved.amount,
    paidAt: saved.paidAt ? saved.paidAt.toISOString().split('T')[0] : undefined,
    paymentMethod: (saved.paymentMethod as any) || 'Transferencia',
    notes: saved.notes || '',
  };
}

export async function deletePaymentAction(id: string): Promise<{ success: boolean }> {
  await prisma.payment.delete({
    where: { id },
  });
  revalidatePath('/');
  return { success: true };
}

// 5. Expenses Server Actions
export async function getExpensesAction(): Promise<Expense[]> {
  const dbExpenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' },
  });

  return dbExpenses.map((e) => ({
    id: e.id,
    date: e.date.toISOString().split('T')[0],
    amount: e.amount,
    category: e.category,
    buildingId: e.buildingId as any,
    notes: e.notes || '',
  }));
}

export async function saveExpenseAction(expense: Expense): Promise<Expense> {
  const expenseId = expense.id || `exp-${Date.now()}`;
  const expenseDate = new Date(expense.date);

  const saved = await prisma.expense.upsert({
    where: { id: expenseId },
    update: {
      date: expenseDate,
      amount: expense.amount,
      category: expense.category,
      buildingId: expense.buildingId,
      notes: expense.notes || '',
    },
    create: {
      id: expenseId,
      date: expenseDate,
      amount: expense.amount,
      category: expense.category,
      buildingId: expense.buildingId,
      notes: expense.notes || '',
    },
  });

  revalidatePath('/');
  return {
    id: saved.id,
    date: saved.date.toISOString().split('T')[0],
    amount: saved.amount,
    category: saved.category,
    buildingId: saved.buildingId as any,
    notes: saved.notes || '',
  };
}

export async function deleteExpenseAction(id: string): Promise<{ success: boolean }> {
  await prisma.expense.delete({
    where: { id },
  });
  revalidatePath('/');
  return { success: true };
}

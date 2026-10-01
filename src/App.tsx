import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BuildingId, Tenant, PaymentRecord, Expense, OverdueAlert } from './types';
import { BUILDINGS_INFO, INITIAL_TENANTS, INITIAL_EXPENSES } from './data/initialData';
import { api } from './api/client';
import { exportAllToExcel } from './utils/excelExport';
import { Header } from './components/Header';
import { BuildingView } from './components/BuildingView';
import { ExpensesView } from './components/ExpensesView';
import { DashboardView } from './components/DashboardView';
import { PaymentCellModal } from './components/PaymentCellModal';
import { TenantModal } from './components/TenantModal';
import { NotificationCenter } from './components/NotificationCenter';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ConnectMobileModal } from './components/ConnectMobileModal';
import { Database, RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<BuildingId | 'expenses' | 'dashboard'>('marmota');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());

  // Database States
  const [tenants, setTenants] = useState<Record<BuildingId, Tenant[]>>(INITIAL_TENANTS);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isConnectMobileOpen, setIsConnectMobileOpen] = useState(false);
  
  const [paymentModalData, setPaymentModalData] = useState<{
    tenant: Tenant;
    buildingId: BuildingId;
    month: number;
    year: number;
  } | null>(null);

  const [tenantModalData, setTenantModalData] = useState<{
    tenant?: Tenant | null;
    buildingId: BuildingId;
  } | null>(null);

  // Fetch all data from PostgreSQL
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsSyncing(true);

    try {
      const [health, tenantsData, paymentsData, expensesData] = await Promise.all([
        api.checkHealth(),
        api.getTenants(),
        api.getPayments(currentYear),
        api.getExpenses(),
      ]);

      if (health.status === 'ok') {
        setDbStatus('connected');
        setTenants(tenantsData);
        setPayments(paymentsData);
        setExpenses(expensesData);
        setErrorMessage(null);
      } else {
        setDbStatus('error');
      }
    } catch (err: any) {
      console.error('Error syncing with PostgreSQL:', err);
      setDbStatus('error');
      setErrorMessage(err.message || 'Error de conexión con la base de datos PostgreSQL');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [currentYear]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-sync polling every 10 seconds for real-time concurrency across multiple devices
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);

    const onFocus = () => fetchData(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData]);

  // Compute Overdue Rent Alerts
  const overdueAlerts: OverdueAlert[] = useMemo(() => {
    const alerts: OverdueAlert[] = [];
    const simYear = simulatedDate.getFullYear();
    const simMonth = simulatedDate.getMonth();
    const simDay = simulatedDate.getDate();

    BUILDINGS_INFO.forEach((b) => {
      const bTenants = tenants[b.id] || [];
      bTenants.forEach((tenant) => {
        if (tenant.isVacant || tenant.paymentDay === null) return;

        const hasPaidCurrentMonth = payments.some(
          (p) =>
            p.tenantId === tenant.id &&
            p.buildingId === b.id &&
            p.year === simYear &&
            p.month === simMonth &&
            p.amount > 0
        );

        if (!hasPaidCurrentMonth && simDay > tenant.paymentDay) {
          const daysLate = simDay - tenant.paymentDay;
          alerts.push({
            id: `alert-${b.id}-${tenant.id}-${simYear}-${simMonth}`,
            tenantId: tenant.id,
            tenantName: tenant.name,
            dpto: tenant.dpto,
            buildingId: b.id,
            buildingName: b.name,
            paymentDay: tenant.paymentDay,
            month: simMonth,
            year: simYear,
            daysLate,
            phone: tenant.phone,
          });
        }
      });
    });

    return alerts.sort((a, b) => b.daysLate - a.daysLate);
  }, [tenants, payments, simulatedDate]);

  // Handler: Save Payment to PostgreSQL
  const handleSavePayment = async (paymentRecord: PaymentRecord) => {
    try {
      // Optimistic update
      setPayments((prev) => {
        const filtered = prev.filter(
          (p) =>
            !(
              p.tenantId === paymentRecord.tenantId &&
              p.month === paymentRecord.month &&
              p.year === paymentRecord.year
            )
        );
        return [...filtered, paymentRecord];
      });

      const saved = await api.savePayment(paymentRecord);
      setPayments((prev) => prev.map((p) => (p.id === paymentRecord.id ? saved : p)));
    } catch (err: any) {
      alert(`Error al guardar pago en PostgreSQL: ${err.message}`);
      fetchData(true);
    }
  };

  // Handler: Delete Payment in PostgreSQL
  const handleDeletePayment = async (paymentId: string) => {
    try {
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      await api.deletePayment(paymentId);
    } catch (err: any) {
      alert(`Error al eliminar pago en PostgreSQL: ${err.message}`);
      fetchData(true);
    }
  };

  // Handler: Save Tenant in PostgreSQL
  const handleSaveTenant = async (updatedTenant: Tenant, buildingId: BuildingId) => {
    try {
      // Optimistic update
      setTenants((prev) => {
        const bTenants = prev[buildingId] || [];
        const existsIndex = bTenants.findIndex((t) => t.id === updatedTenant.id);
        let newBList = [...bTenants];
        if (existsIndex >= 0) {
          newBList[existsIndex] = updatedTenant;
        } else {
          newBList.push(updatedTenant);
        }
        return { ...prev, [buildingId]: newBList };
      });

      const saved = await api.saveTenant(updatedTenant, buildingId);
      setTenants((prev) => {
        const bTenants = prev[buildingId] || [];
        return {
          ...prev,
          [buildingId]: bTenants.map((t) => (t.id === updatedTenant.id ? saved : t)),
        };
      });
    } catch (err: any) {
      alert(`Error al guardar inquilino en PostgreSQL: ${err.message}`);
      fetchData(true);
    }
  };

  // Handler: Delete Tenant in PostgreSQL
  const handleDeleteTenant = async (tenantId: string, buildingId: BuildingId) => {
    if (window.confirm('¿Seguro que deseas eliminar este departamento/inquilino de PostgreSQL?')) {
      try {
        setTenants((prev) => ({
          ...prev,
          [buildingId]: (prev[buildingId] || []).filter((t) => t.id !== tenantId),
        }));
        setPayments((prev) => prev.filter((p) => p.tenantId !== tenantId));
        await api.deleteTenant(tenantId);
      } catch (err: any) {
        alert(`Error al eliminar en PostgreSQL: ${err.message}`);
        fetchData(true);
      }
    }
  };

  // Handler: Quick update note inline
  const handleUpdateTenantNote = async (tenantId: string, buildingId: BuildingId, notes: string) => {
    const tenant = (tenants[buildingId] || []).find((t) => t.id === tenantId);
    if (tenant && tenant.notes !== notes) {
      const updated = { ...tenant, notes };
      handleSaveTenant(updated, buildingId);
    }
  };

  // Handler: Add Expense in PostgreSQL
  const handleAddExpense = async (expense: Expense) => {
    try {
      setExpenses((prev) => [expense, ...prev]);
      const saved = await api.saveExpense(expense);
      setExpenses((prev) => prev.map((e) => (e.id === expense.id ? saved : e)));
    } catch (err: any) {
      alert(`Error al guardar gasto en PostgreSQL: ${err.message}`);
      fetchData(true);
    }
  };

  // Handler: Delete Expense in PostgreSQL
  const handleDeleteExpense = async (id: string) => {
    try {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      await api.deleteExpense(id);
    } catch (err: any) {
      alert(`Error al eliminar gasto en PostgreSQL: ${err.message}`);
      fetchData(true);
    }
  };

  // Handler: Refresh data manually
  const handleManualRefresh = () => {
    fetchData();
  };

  // Handler: Export Excel
  const handleExportExcel = () => {
    exportAllToExcel(tenants, payments, expenses, currentYear);
  };

  const handleOpenPaymentFromAlert = (tenantId: string, buildingId: BuildingId, month: number) => {
    const tenant = (tenants[buildingId] || []).find((t) => t.id === tenantId);
    if (tenant) {
      setPaymentModalData({
        tenant,
        buildingId,
        month,
        year: currentYear,
      });
    }
  };

  const currentBuildingInfo = BUILDINGS_INFO.find((b) => b.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Database Connection Status Bar */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : dbStatus === 'connecting'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-rose-500'
              }`}
            />
            <span className="font-semibold text-slate-300">
              {dbStatus === 'connected'
                ? 'Neon PostgreSQL Conectado'
                : dbStatus === 'connecting'
                ? 'Conectando a PostgreSQL...'
                : 'Error de Conexión a BD'}
            </span>
          </div>
          <span className="text-slate-500 hidden sm:inline">• Base de datos centralizada</span>
        </div>

        <div className="flex items-center gap-3">
          {isSyncing && (
            <span className="text-[11px] text-sky-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Sincronizando...
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] transition cursor-pointer"
            title="Refrescar datos desde PostgreSQL"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueAlerts={overdueAlerts}
        setIsNotificationOpen={setIsNotificationOpen}
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        simulatedDate={simulatedDate}
        setSimulatedDate={setSimulatedDate}
        onExportExcel={handleExportExcel}
        onResetData={handleManualRefresh}
        onOpenConnectMobile={() => setIsConnectMobileOpen(true)}
      />

      {/* Loading Skeleton / Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        {errorMessage && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">No se pudo conectar a la base de datos PostgreSQL en Neon:</p>
              <p className="font-mono text-[11px]">{errorMessage}</p>
              <p className="mt-1 text-rose-600">Asegúrate de que el servidor backend esté corriendo con <code className="bg-rose-100 px-1 py-0.5 rounded font-bold">npm run dev</code>.</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Cargando datos desde Neon PostgreSQL...
            </p>
          </div>
        ) : activeTab === 'expenses' ? (
          <ExpensesView
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            currentYear={currentYear}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            tenants={tenants}
            payments={payments}
            expenses={expenses}
            currentYear={currentYear}
            simulatedDate={simulatedDate}
          />
        ) : (
          currentBuildingInfo && (
            <BuildingView
              buildingId={currentBuildingInfo.id}
              buildingName={currentBuildingInfo.name}
              buildingDescription={currentBuildingInfo.description}
              tenants={tenants[currentBuildingInfo.id] || []}
              payments={payments}
              currentYear={currentYear}
              simulatedDate={simulatedDate}
              overdueAlerts={overdueAlerts}
              onOpenPaymentModal={(tenant, month) =>
                setPaymentModalData({
                  tenant,
                  buildingId: currentBuildingInfo.id,
                  month,
                  year: currentYear,
                })
              }
              onOpenTenantModal={(tenant) =>
                setTenantModalData({
                  tenant,
                  buildingId: currentBuildingInfo.id,
                })
              }
              onDeleteTenant={(tId) => handleDeleteTenant(tId, currentBuildingInfo.id)}
              onUpdateTenantNote={(tId, notes) =>
                handleUpdateTenantNote(tId, currentBuildingInfo.id, notes)
              }
            />
          )
        )}
      </main>

      {/* Payment Entry Modal */}
      {paymentModalData && (
        <PaymentCellModal
          tenant={paymentModalData.tenant}
          buildingId={paymentModalData.buildingId}
          buildingName={
            BUILDINGS_INFO.find((b) => b.id === paymentModalData.buildingId)?.name || ''
          }
          month={paymentModalData.month}
          year={paymentModalData.year}
          existingPayment={payments.find(
            (p) =>
              p.tenantId === paymentModalData.tenant.id &&
              p.buildingId === paymentModalData.buildingId &&
              p.month === paymentModalData.month &&
              p.year === paymentModalData.year
          )}
          onSavePayment={handleSavePayment}
          onDeletePayment={handleDeletePayment}
          onClose={() => setPaymentModalData(null)}
        />
      )}

      {/* Tenant Add/Edit Modal */}
      {tenantModalData && (
        <TenantModal
          tenant={tenantModalData.tenant}
          buildingName={
            BUILDINGS_INFO.find((b) => b.id === tenantModalData.buildingId)?.name || ''
          }
          onSaveTenant={(t) => handleSaveTenant(t, tenantModalData.buildingId)}
          onClose={() => setTenantModalData(null)}
        />
      )}

      {/* Overdue Notification Center Modal */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        overdueAlerts={overdueAlerts}
        onOpenPaymentModal={handleOpenPaymentFromAlert}
        simulatedDate={simulatedDate}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueAlerts={overdueAlerts}
        setIsNotificationOpen={setIsNotificationOpen}
        onOpenConnectMobileModal={() => setIsConnectMobileOpen(true)}
      />

      {/* Connect Mobile QR Modal */}
      <ConnectMobileModal
        isOpen={isConnectMobileOpen}
        onClose={() => setIsConnectMobileOpen(false)}
        localIp="192.168.101.122"
        port={3000}
      />
    </div>
  );
}
export default App;

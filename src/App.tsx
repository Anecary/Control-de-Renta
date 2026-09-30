import React, { useState, useEffect, useMemo } from 'react';
import { BuildingId, Tenant, PaymentRecord, Expense, OverdueAlert } from './types';
import { BUILDINGS_INFO } from './data/initialData';
import { 
  loadTenants, 
  saveTenants, 
  loadPayments, 
  savePayments, 
  loadExpenses, 
  saveExpenses, 
  resetToDefaultData 
} from './utils/storage';
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

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<BuildingId | 'expenses' | 'dashboard'>('marmota');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  
  // Date for checking overdue payments (defaults to real current date, can be simulated)
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());

  // Persistent States
  const [tenants, setTenants] = useState<Record<BuildingId, Tenant[]>>(loadTenants);
  const [payments, setPayments] = useState<PaymentRecord[]>(loadPayments);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);

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

  // Sync with LocalStorage
  useEffect(() => {
    saveTenants(tenants);
  }, [tenants]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  // Compute Overdue Rent Alerts
  const overdueAlerts: OverdueAlert[] = useMemo(() => {
    const alerts: OverdueAlert[] = [];
    const simYear = simulatedDate.getFullYear();
    const simMonth = simulatedDate.getMonth();
    const simDay = simulatedDate.getDate();

    // Check all buildings
    BUILDINGS_INFO.forEach((b) => {
      const bTenants = tenants[b.id] || [];
      bTenants.forEach((tenant) => {
        if (tenant.isVacant || tenant.paymentDay === null) return;

        // Check if there is an active payment for the current period
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

  // Handler: Save Payment
  const handleSavePayment = (newPayment: PaymentRecord) => {
    setPayments((prev) => {
      const filtered = prev.filter(
        (p) =>
          !(
            p.tenantId === newPayment.tenantId &&
            p.month === newPayment.month &&
            p.year === newPayment.year
          )
      );
      return [...filtered, newPayment];
    });
  };

  // Handler: Delete Payment
  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  };

  // Handler: Save Tenant (Create or Update)
  const handleSaveTenant = (updatedTenant: Tenant, buildingId: BuildingId) => {
    setTenants((prev) => {
      const bTenants = prev[buildingId] || [];
      const existsIndex = bTenants.findIndex((t) => t.id === updatedTenant.id);
      
      let newBList = [...bTenants];
      if (existsIndex >= 0) {
        newBList[existsIndex] = updatedTenant;
      } else {
        newBList.push(updatedTenant);
      }
      return {
        ...prev,
        [buildingId]: newBList,
      };
    });
  };

  // Handler: Delete Tenant
  const handleDeleteTenant = (tenantId: string, buildingId: BuildingId) => {
    if (window.confirm('¿Seguro que deseas eliminar este departamento/inquilino?')) {
      setTenants((prev) => ({
        ...prev,
        [buildingId]: (prev[buildingId] || []).filter((t) => t.id !== tenantId),
      }));
      setPayments((prev) => prev.filter((p) => p.tenantId !== tenantId));
    }
  };

  // Handler: Quick update note inline
  const handleUpdateTenantNote = (tenantId: string, buildingId: BuildingId, notes: string) => {
    setTenants((prev) => {
      const bTenants = prev[buildingId] || [];
      return {
        ...prev,
        [buildingId]: bTenants.map((t) => (t.id === tenantId ? { ...t, notes } : t)),
      };
    });
  };

  // Handler: Add Expense
  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  // Handler: Delete Expense
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Handler: Reset Data
  const handleResetData = () => {
    if (
      window.confirm(
        '¿Restablecer el sistema a los datos iniciales del Excel? Se conservarán los 4 edificios originales.'
      )
    ) {
      const defaults = resetToDefaultData();
      setTenants(defaults.tenants);
      setPayments(defaults.payments);
      setExpenses(defaults.expenses);
    }
  };

  // Handler: Export Excel
  const handleExportExcel = () => {
    exportAllToExcel(tenants, payments, expenses, currentYear);
  };

  // Open Payment modal from Notification
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
        onResetData={handleResetData}
        onOpenConnectMobile={() => setIsConnectMobileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Render Active View */}
        {activeTab === 'expenses' ? (
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

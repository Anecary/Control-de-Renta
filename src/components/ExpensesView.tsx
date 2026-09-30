import React, { useState } from 'react';
import { Expense, ExpenseCategory, BuildingId } from '../types';
import { BUILDINGS_INFO } from '../data/initialData';
import { formatCurrency } from '../utils/formatters';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  Building2, 
  Tag, 
  FileText,
  TrendingDown
} from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  currentYear: number;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Internet y televisión',
  'Luz / CFE',
  'Agua',
  'Limpieza',
  'Mantenimiento y reparaciones',
  'Administración',
  'Seguridad',
  'Predial',
  'Otros',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  currentYear,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterBuilding, setFilterBuilding] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Internet y televisión');
  const [buildingId, setBuildingId] = useState<BuildingId | 'general'>('general');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date,
      amount: numAmount,
      category,
      buildingId,
      notes: notes.trim(),
    };

    onAddExpense(newExpense);
    setAmount('');
    setNotes('');
    setShowAddForm(false);
    setError('');
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesBuilding = filterBuilding === 'all' || exp.buildingId === filterBuilding;
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesSearch =
      exp.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBuilding && matchesCategory && matchesSearch;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getBuildingName = (id: BuildingId | 'general') => {
    if (id === 'general') return 'Gasto General (Todos)';
    const b = BUILDINGS_INFO.find((item) => item.id === id);
    return b ? b.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Control de Gastos de Edificios
            </h2>
            <p className="text-xs text-slate-500">
              Registra pagos de servicios (Internet, Luz, Agua, Mantenimiento, Limpieza, etc.)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase text-slate-500 block">
              Total de Gastos
            </span>
            <span className="text-xl font-extrabold text-amber-700">
              {formatCurrency(totalExpenseAmount)}
            </span>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cerrar Formulario' : 'Registrar Gasto'}</span>
          </button>
        </div>
      </div>

      {/* New Expense Form Accordion */}
      {showAddForm && (
        <form
          onSubmit={handleCreateExpense}
          className="bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-lg space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Nuevo Registro de Gasto
            </h3>
            <span className="text-xs text-slate-500">* Campos obligatorios</span>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Monto ($ MXN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="Ej. 1450.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Tipo de Gasto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Tipo de Gasto *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Edificio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Edificio Asignado *
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="general">Gasto General (Todos)</option>
                {BUILDINGS_INFO.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Observaciones / Descripción
            </label>
            <input
              type="text"
              placeholder="Ej. Recibo de luz bimestre Septiembre, compra de material de limpieza..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      )}

      {/* Expenses Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filters bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar gasto o nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Filter by Building */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Todos los Edificios</option>
                <option value="general">Gasto General</option>
                {BUILDINGS_INFO.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Category */}
            <div className="text-xs">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Todas las Categorías</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mostrando <strong>{filteredExpenses.length}</strong> gastos
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-900/90 text-white text-xs uppercase tracking-wider font-bold">
                <th className="py-3 px-4 w-32">Fecha</th>
                <th className="py-3 px-4 w-32 text-right">Monto</th>
                <th className="py-3 px-4 w-48">Tipo de Gasto</th>
                <th className="py-3 px-4 w-44">Edificio</th>
                <th className="py-3 px-4">Observaciones</th>
                <th className="py-3 px-3 w-16 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700 font-medium">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No hay gastos registrados que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp, idx) => (
                  <tr
                    key={exp.id}
                    className={`hover:bg-amber-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-700">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {getBuildingName(exp.buildingId)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {exp.notes || <span className="text-slate-300 italic">Sin observaciones</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas eliminar este registro de gasto?')) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-amber-100 text-amber-950 font-extrabold text-xs border-t-2 border-amber-300">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-right font-black text-amber-900">
                  {formatCurrency(totalExpenseAmount)}
                </td>
                <td colSpan={4} className="py-3 px-4 text-slate-600 font-normal">
                  Suma total de gastos mostrados
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

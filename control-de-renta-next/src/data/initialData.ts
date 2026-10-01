import { BuildingId, Tenant, Expense } from '../types';

export interface BuildingInfo {
  id: BuildingId;
  name: string;
  code: string;
  iconColor: string;
  description: string;
}

export const BUILDINGS_INFO: BuildingInfo[] = [
  {
    id: 'marmota',
    name: 'Marmota',
    code: 'MAR',
    iconColor: 'emerald',
    description: 'Edificio Marmota - 17 Departamentos'
  },
  {
    id: 'cuyo',
    name: 'Cuyo',
    code: 'CUY',
    iconColor: 'blue',
    description: 'Edificio Cuyo - 10 Departamentos'
  },
  {
    id: 'mapache',
    name: 'Mapache',
    code: 'MAP',
    iconColor: 'amber',
    description: 'Edificio Mapache - 15 Departamentos'
  },
  {
    id: 'suites_ardillas',
    name: 'Suites Ardillas',
    code: 'ARD',
    iconColor: 'purple',
    description: 'Suites Ardillas - 18 Dptos + Penthouse'
  }
];

export const INITIAL_TENANTS: Record<BuildingId, Tenant[]> = {
  marmota: [
    { id: 'mar-1', dpto: '1', name: 'Luis', paymentDay: 24 },
    { id: 'mar-2', dpto: '2', name: 'Claudia', paymentDay: 18 },
    { id: 'mar-3', dpto: '3', name: 'Jesús', paymentDay: 4 },
    { id: 'mar-4', dpto: '4', name: 'David', paymentDay: 13 },
    { id: 'mar-5', dpto: '5', name: 'Wiliam', paymentDay: 8 },
    { id: 'mar-6', dpto: '6', name: 'Suki', paymentDay: 1 },
    { id: 'mar-7', dpto: '7', name: 'Miguel', paymentDay: 4 },
    { id: 'mar-8', dpto: '8', name: 'Maya', paymentDay: 26 },
    { id: 'mar-9', dpto: '9', name: 'Omar Nieves', paymentDay: null },
    { id: 'mar-10', dpto: '10', name: 'Lizeth', paymentDay: 23 },
    { id: 'mar-11', dpto: '11', name: 'Amashi', paymentDay: null },
    { id: 'mar-12', dpto: '12', name: 'Gabriela', paymentDay: 26 },
    { id: 'mar-13', dpto: '13', name: 'Señor Héctor', paymentDay: 28 },
    { id: 'mar-14', dpto: '14', name: 'Olga', paymentDay: 25 },
    { id: 'mar-15', dpto: '15', name: 'Jess', paymentDay: 21 },
    { id: 'mar-16', dpto: '16', name: 'Jesica Paola', paymentDay: 18 },
    { id: 'mar-17', dpto: '17', name: 'Víctor', paymentDay: 16 }
  ],
  cuyo: [
    { id: 'cuy-1', dpto: '1', name: 'Kenia', paymentDay: 9 },
    { id: 'cuy-2', dpto: '2', name: 'Ana', paymentDay: 30 },
    { id: 'cuy-3', dpto: '3', name: 'Rosa', paymentDay: 1 },
    { id: 'cuy-4', dpto: '4', name: 'Rosy', paymentDay: 1 },
    { id: 'cuy-5', dpto: '5', name: 'Ané', paymentDay: 8 },
    { id: 'cuy-6', dpto: '6', name: 'Cynthia', paymentDay: 17 },
    { id: 'cuy-7', dpto: '7', name: 'Diego', paymentDay: 6 },
    { id: 'cuy-8', dpto: '8', name: 'Erick', paymentDay: 30 },
    { id: 'cuy-9', dpto: '9', name: 'Jessica', paymentDay: 20 },
    { id: 'cuy-10', dpto: '10', name: 'Irelys', paymentDay: 15 }
  ],
  mapache: [
    { id: 'map-1', dpto: '1', name: 'Jocelyn', paymentDay: 16 },
    { id: 'map-2', dpto: '2', name: 'Albania', paymentDay: 29 },
    { id: 'map-3', dpto: '3', name: 'Edison', paymentDay: 3 },
    { id: 'map-4', dpto: '4', name: 'Calep', paymentDay: 1 },
    { id: 'map-5', dpto: '5', name: 'Marco', paymentDay: 6 },
    { id: 'map-6', dpto: '6', name: 'Serafín', paymentDay: 30 },
    { id: 'map-7', dpto: '7', name: 'Alejandro', paymentDay: 7, notes: 'Sin amueblar' },
    { id: 'map-8', dpto: '8', name: 'Alexander', paymentDay: 14 },
    { id: 'map-9', dpto: '9', name: 'Suko', paymentDay: 9 },
    { id: 'map-10', dpto: '10', name: 'Javier', paymentDay: 18 },
    { id: 'map-11', dpto: '11', name: 'Lili', paymentDay: null, notes: 'Personal / Sin fecha' },
    { id: 'map-12', dpto: '12', name: 'Antonia', paymentDay: 3 },
    { id: 'map-13', dpto: '13', name: 'Carolina', paymentDay: 4 },
    { id: 'map-14', dpto: '14', name: 'Joaquín', paymentDay: 14 },
    { id: 'map-15', dpto: '15', name: 'Diana Antonio', paymentDay: null }
  ],
  suites_ardillas: [
    { id: 'ard-2', dpto: '2', name: 'Julio', paymentDay: 30 },
    { id: 'ard-3', dpto: '3', name: 'Blanca', paymentDay: 30 },
    { id: 'ard-4', dpto: '4', name: 'Héctor', paymentDay: 15 },
    { id: 'ard-5', dpto: '5', name: 'Mario', paymentDay: 2 },
    { id: 'ard-6', dpto: '6', name: 'Anna', paymentDay: 4 },
    { id: 'ard-7', dpto: '7', name: 'Verónica', paymentDay: 25 },
    { id: 'ard-8', dpto: '8', name: '(Disponible)', paymentDay: null, isVacant: true },
    { id: 'ard-9', dpto: '9', name: 'Meli', paymentDay: 17 },
    { id: 'ard-10', dpto: '10', name: 'Daya', paymentDay: 19 },
    { id: 'ard-11', dpto: '11', name: 'Antoni', paymentDay: 1 },
    { id: 'ard-12', dpto: '12', name: '(Disponible)', paymentDay: null, isVacant: true },
    { id: 'ard-13', dpto: '13', name: '(Disponible)', paymentDay: null, isVacant: true },
    { id: 'ard-14', dpto: '14', name: 'Mar', paymentDay: 8 },
    { id: 'ard-15', dpto: '15', name: 'Beberly', paymentDay: 18 },
    { id: 'ard-16', dpto: '16', name: 'Alejandra', paymentDay: 30 },
    { id: 'ard-17', dpto: '17', name: 'Cyn', paymentDay: null },
    { id: 'ard-18', dpto: '18', name: 'Verónica', paymentDay: 30 },
    { id: 'ard-ph', dpto: 'PH', name: 'Sara', paymentDay: null, notes: 'Penthouse' }
  ]
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: new Date().toISOString().split('T')[0],
    amount: 1450,
    category: 'Internet y televisión',
    buildingId: 'general',
    notes: 'Servicio mensual de internet y televisión para áreas comunes'
  }
];

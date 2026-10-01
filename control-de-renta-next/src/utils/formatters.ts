export const MONTHS = [
  { value: 0, label: 'Enero', short: 'Ene' },
  { value: 1, label: 'Febrero', short: 'Feb' },
  { value: 2, label: 'Marzo', short: 'Mar' },
  { value: 3, label: 'Abril', short: 'Abr' },
  { value: 4, label: 'Mayo', short: 'May' },
  { value: 5, label: 'Junio', short: 'Jun' },
  { value: 6, label: 'Julio', short: 'Jul' },
  { value: 7, label: 'Agosto', short: 'Ago' },
  { value: 8, label: 'Septiembre', short: 'Sep' },
  { value: 9, label: 'Octubre', short: 'Oct' },
  { value: 10, label: 'Noviembre', short: 'Nov' },
  { value: 11, label: 'Diciembre', short: 'Dic' },
];

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return '0.00';
  }
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPlainCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return '0.00';
  }
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getWhatsAppReminderLink = (
  phone: string | undefined,
  tenantName: string,
  dpto: string,
  buildingName: string,
  monthName: string,
  paymentDay: number
) => {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const text = `Hola ${tenantName}, te saludamos de administración del Edificio ${buildingName}. Recordatorio cordial del pago de renta del Dpto. ${dpto} correspondiente al mes de ${monthName} (fecha límite día ${paymentDay}). Agradecemos tu apoyo con el comprobante. ¡Saludos!`;
  
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

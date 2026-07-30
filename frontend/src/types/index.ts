export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Vehicle {
  id: number;
  model: string;
  year: number;
  plate: string;
  avg_consumption: number;
  next_oil_change_km: number | null;
  next_revision_km: number | null;
}

export interface Journey {
  id: number;
  date: string;
  start_time: string;
  end_time: string | null;
  start_km: number;
  end_km: number | null;
  fuel_level_start: string | null;
  uber_amount: number | null;
  cash_amount: number | null;
  pix_amount: number | null;
  card_amount: number | null;
  tips: number | null;
  tolls_received: number | null;
  cash_on_hand: number | null;
  notes: string | null;
  total_km: number | null;
  total_revenue: number | null;
  revenue_per_km: number | null;
  revenue_per_hour: number | null;
  total_hours: number | null;
  is_active: boolean;
}

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  payment_method: string;
}

export interface Goal {
  id: number;
  type: 'daily' | 'weekly' | 'monthly';
  target_amount: number;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  payment_method: string;
  description: string;
}

export interface Fueling {
  id: number;
  date: string;
  station: string;
  amount: number;
  liters: number;
  price_per_liter: number;
  km: number;
  avg_consumption: number | null;
  km_per_liter: number | null;
  cost_per_km: number | null;
}

export interface Maintenance {
  id: number;
  date: string;
  service: string;
  amount: number;
  km: number;
  workshop: string;
  notes: string;
}

export interface DashboardData {
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  today_km: number;
  net_profit: number;
  total_fuel: number;
  daily_goal: number;
  daily_progress: number;
  daily_revenue: { date: string; revenue: number }[];
}

export interface ReportData {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_km: number;
  days_worked: number;
  avg_per_day: number;
  avg_per_hour: number;
  avg_per_km: number;
}

export interface UserSettings {
  gas_price: number;
  daily_goal: number;
  monthly_goal: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
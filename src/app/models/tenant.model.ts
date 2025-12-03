export interface Tenant {
  id: string;
  domain: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  active: boolean;
  displayName?: string;
  logoUrl?: string;
  subscriptionPlan: SubscriptionPlan;
  maxUsers?: number;
  createdAt?: string;
  updatedAt?: string;
  timezone?: string;
  locale?: string;
  currencyCode?: string;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export interface TenantCadastro {
  name: string;
  domain: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
}

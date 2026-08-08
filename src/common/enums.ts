export enum AgentStatus {
  PROSPECT = 'A-100',
  ENROLLED = 'A-200',
  TRAINED = 'A-300',
  ACTIVATED = 'A-400',
  TRANSACTIONAL_ACTIVE = 'A-500',
  DORMANT = 'A-600',
  TERMINATED = 'A-700',
}

export enum KpiType {
  ACTIVATION = 'activation',
  TRANSACTION_VOLUME = 'transaction_volume',
  CUSTOMER_ACQUISITION = 'customer_acquisition',
  RETENTION = 'retention',
}

export enum PaymentFlowType {
  VENDOR_AP = 'vendor_ap',
  DAP_COMMISSION = 'dap_commission',
  CLIENT_AR = 'client_ar',
  PAYROLL = 'payroll',
}

export enum PaymentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  VERIFICATION = 'verification',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum GlAccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
}

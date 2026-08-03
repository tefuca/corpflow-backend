import { Injectable } from '@nestjs/common';

@Injectable()
export class MasterDataService {
  private masterData = {
    departments: ['Engineering', 'Finance', 'Operations', 'HR', 'Management', 'IT', 'Audit'],
    paymentMethods: ['Bank Transfer', 'Check', 'Cash', 'Mobile Money'],
    assetCategories: ['Vehicle', 'Equipment', 'Furniture', 'IT Hardware', 'Software'],
    stockCategories: ['Office Supplies', 'Raw Materials', 'Finished Goods', 'Spare Parts'],
    vendors: ['ABC Supplies Ltd', 'TechWorld Inc', 'Global Logistics', 'Office Depot', 'Maintenance Pro'],
    banks: ['Zemen Bank', 'CBE', 'Awash Bank', 'Dashen Bank', 'Bunna Bank'],
    currencies: ['ETB', 'USD', 'EUR', 'GBP'],
    roles: ['System Admin', 'Finance Manager', 'Finance Officer', 'Cluster Contact', 'Operation Lead', 'Management', 'Auditor'],
  };

  getAll() {
    return this.masterData;
  }

  get(key: string) {
    return this.masterData[key] || [];
  }
}
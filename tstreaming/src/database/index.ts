export interface IDatabase {
  get(id: string): Promise<any>;
  getAll(): Promise<any[]>;
  getAllByFilters(filters: {[key: string]: any}): Promise<any[]>;
  create(data: object): Promise<any>;
  update(id: string, data: object): Promise<any>;
  delete(id: string): Promise<any>;
}

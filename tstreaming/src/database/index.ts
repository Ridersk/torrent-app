import {BaseModel} from "../models/@base";

export interface IDatabase<T extends BaseModel> {
  get(id: string): Promise<T>;
  getAll(): Promise<T[]>;
  getAllByFilters(filters: {[key: string]: any}): Promise<T[]>;
  create(data: object): Promise<T>;
  update(id: string, data: object): Promise<T>;
  delete(id: string): Promise<void>;
  addObjectsListener(callback: (data: T[]) => void): void;
  addObjectListener(id: string, callback: (data: T) => void): void;
}

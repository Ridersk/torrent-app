export class BaseModel {
  _id: string;
  [key: string]: any;

  constructor(_id: string) {
    this._id = _id;
  }

  static from(data: any) {
    let model = new BaseModel(data._id);

    for (const key of Object.keys(data)) {
      model[key] = data[key];
    }

    return model;
  }
}

export interface BaseModelClass<T extends BaseModel> {
  from(data: any): T;
}

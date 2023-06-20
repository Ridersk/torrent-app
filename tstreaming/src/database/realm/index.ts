import {ObjectClass} from "realm";
import {IDatabase} from "..";
import {BaseModel, BaseModelClass} from "../../models/@base";

export class RealmDatabase<T extends BaseModel> implements IDatabase<T> {
  private readonly realm: Realm;
  private readonly schemaClass: ObjectClass;
  private readonly modelClass: BaseModelClass<T>;

  constructor(schema: ObjectClass, model: BaseModelClass<T>) {
    this.realm = new Realm({
      schema: [schema],
      schemaVersion: 1,
    });
    this.schemaClass = schema;
    this.modelClass = model;
  }

  get(id: string): Promise<T> {
    const realmObject = this.realm.objectForPrimaryKey<T>(
      this.schemaClass.name,
      id,
    );

    if (!realmObject) {
      throw new Error("Object not found");
    }

    return Promise.resolve(realmObject);
  }

  getAll(): Promise<T[]> {
    const objects = this.realm.objects<T>(this.schemaClass.name);
    return Promise.resolve(Array.from(objects));
  }

  getAllByFilters(filters: {[key: string]: any}): Promise<T[]> {
    let filtersStringList = [];
    let query = "";

    for (const filter of Object.keys(filters)) {
      filtersStringList.push(`${filter} = "${filters[filter]}"`);
    }

    if (filtersStringList.length > 0) {
      query = filtersStringList.join(" && ");
    }

    const objects = this.realm
      .objects<T>(this.schemaClass.name)
      .filtered(query);
    return Promise.resolve(Array.from(objects));
  }

  create(data: object): Promise<T> {
    return this.realm.write(async () => {
      (data as T)._id = new Realm.BSON.UUID().toHexString();
      const newObject = this.realm.create<T>(this.schemaClass.name, {
        ...data,
      });
      return newObject;
    });
  }

  update(id: string, data: object): Promise<T> {
    const realmObject = this.realm.objectForPrimaryKey<T>(
      this.schemaClass.name,
      id,
    );

    if (!realmObject) {
      throw new Error(`Object not found: ${id}`);
    }

    this.realm.write(() => {
      this.realm.create(
        this.schemaClass.name,
        {_id: realmObject._id, ...data},
        Realm.UpdateMode.Modified,
      );
    });

    return Promise.resolve(realmObject);
  }

  delete(id: string): Promise<void> {
    const realmObject = this.realm.objectForPrimaryKey(
      this.schemaClass.name,
      id,
    );

    if (!realmObject) {
      throw new Error("Object not found");
    }

    this.realm.write(() => {
      this.realm.delete(realmObject);
    });

    return Promise.resolve();
  }

  addObjectsListener(callback: (data: T[]) => void) {
    const objects = this.realm.objects(this.schemaClass.name);

    console.log("LISTENER OBJECTS:", objects);

    objects.addListener(_objects => {
      const changedObjects = _objects.map(
        object => this.modelClass.from(object) as T,
      );
      callback(changedObjects);
    });
  }

  addObjectListener(id: string, callback: (data: T) => void) {
    const object = this.realm.objectForPrimaryKey(this.schemaClass.name, id);

    if (!object) {
      throw new Error("Object not found");
    }

    object.addListener(_object => {
      callback(this.modelClass.from(object) as T);
    });
  }
}

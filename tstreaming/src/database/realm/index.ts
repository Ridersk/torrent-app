import {ObjectClass} from "realm";
import {IDatabase} from "..";

export class RealmDatabase implements IDatabase {
  private readonly realm: Realm;
  private readonly schema: ObjectClass;

  constructor(schema: ObjectClass) {
    this.realm = new Realm({
      schema: [schema],
      schemaVersion: 1,
    });
    this.schema = schema;
  }

  get(id: string): Promise<any> {
    const realmObject = this.realm.objectForPrimaryKey(this.schema.name, id);

    if (!realmObject) {
      throw new Error("Object not found");
    }

    return Promise.resolve(realmObject);
  }

  getAll(): Promise<any[]> {
    const objects = this.realm.objects(this.schema.name);
    return Promise.resolve(Array.from(objects));
  }

  getAllByFilters(filters: {[key: string]: any}): Promise<any[]> {
    let filtersStringList = [];
    let query = "";

    for (const filter of Object.keys(filters)) {
      filtersStringList.push(`${filter} = "${filters[filter]}"`);
    }

    if (filtersStringList.length > 0) {
      query = filtersStringList.join(" && ");
    }

    const objects = this.realm.objects(this.schema.name).filtered(query);
    return Promise.resolve(Array.from(objects));
  }

  create(data: object): Promise<Realm.Object> {
    return this.realm.write(async () => {
      const newObject = this.realm.create(this.schema.name, {
        _id: new Realm.BSON.UUID().toHexString(),
        ...data,
      });
      return newObject;
    });
  }

  update(id: string, data: object): Promise<any> {
    const realmObject = this.realm.objectForPrimaryKey(this.schema.name, id);

    if (!realmObject) {
      throw new Error(`Object not found: ${id}`);
    }

    this.realm.write(() => {
      this.realm.create(
        this.schema.name,
        {_id: realmObject._id, ...data},
        Realm.UpdateMode.Modified,
      );
    });

    return Promise.resolve(realmObject);
  }

  delete(id: string): Promise<void> {
    const realmObject = this.realm.objectForPrimaryKey(this.schema.name, id);

    if (!realmObject) {
      throw new Error("Object not found");
    }

    this.realm.write(() => {
      this.realm.delete(realmObject);
    });

    return Promise.resolve();
  }

  addObjectsListener(callback: (data: any) => void) {
    const objects = this.realm.objects(this.schema.name);
    objects.addListener(callback);
  }

  addObjectListener(id: string, callback: (data: any) => void) {
    const realmObject = this.realm.objectForPrimaryKey(this.schema.name, id);

    if (!realmObject) {
      throw new Error("Object not found");
    }

    realmObject.addListener(callback);
  }
}

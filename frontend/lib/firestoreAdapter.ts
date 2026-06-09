import { db } from "./db";
import * as admin from "firebase-admin";

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

export class MongooseDoc {
  [key: string]: any;
  _id: string;
  id: string;
  private _collectionName!: string;

  constructor(collectionName: string, data: any, id: string) {
    Object.assign(this, data);
    this._id = id;
    this.id = id;
    Object.defineProperty(this, "_collectionName", { value: collectionName, enumerable: false });
  }

  async save() {
    const dataToSave = { ...this };
    delete (dataToSave as any)._id;
    delete (dataToSave as any).id;
    await db.collection(this._collectionName).doc(this.id).set(dataToSave, { merge: true });
    return this;
  }

  toObject() {
    return { ...this };
  }

  toJSON() {
    return { ...this };
  }
}

export class FirestoreQuery {
  private collectionName: string;
  private queryObj: any;
  private sortObj: any = null;
  private limitVal: number | null = null;
  private skipVal: number | null = null;
  private selectFields: string[] = [];
  private populates: { path: string; selectFields?: string }[] = [];
  public isSingleDoc: boolean = false;

  constructor(collectionName: string, queryObj: any = {}, isSingleDoc = false) {
    this.collectionName = collectionName;
    this.queryObj = queryObj || {};
    this.isSingleDoc = isSingleDoc;
  }

  sort(sortVal: any) {
    this.sortObj = sortVal;
    return this;
  }

  limit(limitVal: number) {
    this.limitVal = limitVal;
    return this;
  }

  skip(skipVal: number) {
    this.skipVal = skipVal;
    return this;
  }

  select(selectVal: string) {
    if (typeof selectVal === "string") {
      this.selectFields = selectVal.split(/\s+/).filter(Boolean);
    }
    return this;
  }

  populate(path: string, selectFields?: string) {
    this.populates.push({ path, selectFields });
    return this;
  }

  lean() {
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.exec();
      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  async exec(): Promise<any> {
    let queryRef: admin.firestore.Query = db.collection(this.collectionName);

    let needsClientFilter = false;
    const clientFilters: Array<(doc: any) => boolean> = [];

    for (const key of Object.keys(this.queryObj)) {
      let val = this.queryObj[key];

      if (key === "$or" && Array.isArray(val)) {
        needsClientFilter = true;
        clientFilters.push((doc) => {
          return val.some((subQuery: any) => {
            return Object.keys(subQuery).every(subKey => {
              const subVal = subQuery[subKey];
              let docVal = getNestedValue(doc, subKey);
              if (subKey === "_id" && docVal && typeof docVal === "object" && docVal.toString) {
                docVal = docVal.toString();
              }
              if (subVal && typeof subVal === "object" && !(subVal instanceof Date)) {
                const ops = Object.keys(subVal);
                return ops.every(op => {
                  const opVal = subVal[op];
                  if (op === "$regex") {
                    const regex = new RegExp(opVal, subVal["$options"] || "");
                    return typeof docVal === "string" && regex.test(docVal);
                  }
                  if (op === "$options") return true;
                  if (op === "$exists") {
                    return opVal ? docVal !== undefined : docVal === undefined;
                  }
                  if (op === "$in") {
                    const mappedOps = Array.isArray(opVal) ? opVal.map(x => x && x.toString ? x.toString() : x) : [];
                    return mappedOps.includes(docVal && docVal.toString ? docVal.toString() : docVal);
                  }
                  if (op === "$nin") {
                    const mappedOps = Array.isArray(opVal) ? opVal.map(x => x && x.toString ? x.toString() : x) : [];
                    return !mappedOps.includes(docVal && docVal.toString ? docVal.toString() : docVal);
                  }
                  if (op === "$ne") return docVal !== opVal;
                  if (op === "$gte") return docVal >= opVal;
                  if (op === "$lte") return docVal <= opVal;
                  if (op === "$gt") return docVal > opVal;
                  if (op === "$lt") return docVal < opVal;
                  return false;
                });
              }
              const compSubVal = subVal && subVal.toString ? subVal.toString() : subVal;
              const compDocVal = docVal && docVal.toString ? docVal.toString() : docVal;
              return compDocVal === compSubVal;
            });
          });
        });
        continue;
      }

      // Handle ID field mapping
      const firestoreKey = key === "_id" ? admin.firestore.FieldPath.documentId() : key;
      if (key === "_id") {
        if (val && typeof val === "object" && val.toString) {
          val = val.toString();
        }
      }

      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        const keys = Object.keys(val);
        for (const op of keys) {
          const opVal = val[op];
          if (op === "$in") {
            if (Array.isArray(opVal) && opVal.length === 0) {
              needsClientFilter = true;
              clientFilters.push(() => false);
            } else {
              queryRef = queryRef.where(firestoreKey, "in", opVal);
            }
          } else if (op === "$nin") {
            if (Array.isArray(opVal) && opVal.length === 0) {
              // nim empty array matches everything, no filter needed
            } else {
              queryRef = queryRef.where(firestoreKey, "not-in", opVal);
            }
          } else if (op === "$regex") {
            needsClientFilter = true;
            const regex = new RegExp(opVal, val["$options"] || "");
            clientFilters.push((doc) => {
              const fieldValue = getNestedValue(doc, key);
              return typeof fieldValue === "string" && regex.test(fieldValue);
            });
          } else if (op === "$options") {
            // Handled by $regex
          } else if (op === "$exists") {
            needsClientFilter = true;
            clientFilters.push((doc) => {
              const fieldValue = getNestedValue(doc, key);
              return opVal ? fieldValue !== undefined : fieldValue === undefined;
            });
          } else if (op === "$ne") {
            needsClientFilter = true;
            clientFilters.push((doc) => {
              let docVal = getNestedValue(doc, key);
              if (key === "_id" && docVal && typeof docVal === "object" && docVal.toString) {
                docVal = docVal.toString();
              }
              const neVal = opVal && opVal.toString ? opVal.toString() : opVal;
              const compDocVal = docVal && docVal.toString ? docVal.toString() : docVal;
              return compDocVal !== neVal;
            });
          } else if (op === "$gte") {
            queryRef = queryRef.where(firestoreKey, ">=", opVal);
          } else if (op === "$lte") {
            queryRef = queryRef.where(firestoreKey, "<=", opVal);
          } else if (op === "$gt") {
            queryRef = queryRef.where(firestoreKey, ">", opVal);
          } else if (op === "$lt") {
            queryRef = queryRef.where(firestoreKey, "<", opVal);
          } else {
            needsClientFilter = true;
            clientFilters.push((doc) => {
              return getNestedValue(doc, key) === val;
            });
          }
        }
      } else {
        // Simple equality
        queryRef = queryRef.where(firestoreKey, "==", val);
      }
    }

    if (this.limitVal !== null && !needsClientFilter && !this.sortObj) {
      queryRef = queryRef.limit(this.limitVal);
    }

    const snapshot = await queryRef.get();
    let results = snapshot.docs.map(doc => {
      const data = doc.data();
      for (const k of Object.keys(data)) {
        if (data[k] && typeof data[k] === "object" && typeof data[k].toDate === "function") {
          data[k] = data[k].toDate();
        }
      }
      return new MongooseDoc(this.collectionName, data, doc.id);
    });

    if (needsClientFilter) {
      for (const filter of clientFilters) {
        results = results.filter(filter);
      }
    }

    if (this.selectFields.length > 0) {
      results = results.map(doc => {
        const newDoc: any = new MongooseDoc(this.collectionName, {}, doc.id);
        const hasExclusions = this.selectFields.some(f => f.startsWith("-"));
        if (hasExclusions) {
          const excludedFields = this.selectFields.map(f => f.startsWith("-") ? f.substring(1) : f);
          for (const key of Object.keys(doc)) {
            if (!excludedFields.includes(key)) {
              newDoc[key] = doc[key];
            }
          }
        } else {
          const includedFields = [...this.selectFields, "_id", "id"];
          for (const field of includedFields) {
            const cleanField = field.startsWith("+") ? field.substring(1) : field;
            if (doc[cleanField] !== undefined) {
              newDoc[cleanField] = doc[cleanField];
            }
          }
        }
        return newDoc;
      });
    }

    // Apply in-memory populates
    if (this.populates.length > 0) {
      for (const pop of this.populates) {
        let targetColl = "users";
        if (pop.path === "businessId") {
          targetColl = "businesses";
        } else if (pop.path === "connectionId") {
          targetColl = "connections";
        }

        for (const doc of results) {
          const refId = doc[pop.path];
          if (refId && typeof refId === "string") {
            const refSnap = await db.collection(targetColl).doc(refId).get();
            if (refSnap.exists) {
              const refData = refSnap.data() || {};
              for (const k of Object.keys(refData)) {
                if (refData[k] && typeof refData[k] === "object" && typeof refData[k].toDate === "function") {
                  refData[k] = refData[k].toDate();
                }
              }
              const refDoc: any = new MongooseDoc(targetColl, refData, refSnap.id);
              
              if (pop.selectFields) {
                const fields = pop.selectFields.split(/\s+/).filter(Boolean);
                const selectedDoc: any = new MongooseDoc(targetColl, {}, refSnap.id);
                for (const field of fields) {
                  if (refDoc[field] !== undefined) {
                    selectedDoc[field] = refDoc[field];
                  }
                }
                doc[pop.path] = selectedDoc;
              } else {
                doc[pop.path] = refDoc;
              }
            }
          }
        }
      }
    }

    // Apply in-memory sorting
    if (this.sortObj) {
      results.sort((a: any, b: any) => {
        if (typeof this.sortObj === "string") {
          const desc = this.sortObj.startsWith("-");
          const field = desc ? this.sortObj.substring(1) : this.sortObj;
          
          let valA = a[field];
          let valB = b[field];
          
          if (valA === undefined || valA === null) return desc ? 1 : -1;
          if (valB === undefined || valB === null) return desc ? -1 : 1;
          
          if (valA instanceof Date && valB instanceof Date) {
            return desc ? valB.getTime() - valA.getTime() : valA.getTime() - valB.getTime();
          }
          if (typeof valA === "string" && typeof valB === "string") {
            return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          if (valA < valB) return desc ? 1 : -1;
          if (valA > valB) return desc ? -1 : 1;
          return 0;
        } else if (typeof this.sortObj === "object") {
          for (const k of Object.keys(this.sortObj)) {
            const dir = this.sortObj[k] === -1 || this.sortObj[k] === "desc" ? "desc" : "asc";
            
            let valA = a[k];
            let valB = b[k];
            
            if (valA === undefined || valA === null) return dir === "desc" ? 1 : -1;
            if (valB === undefined || valB === null) return dir === "desc" ? -1 : 1;
            
            if (valA instanceof Date && valB instanceof Date) {
              const diff = dir === "desc" ? valB.getTime() - valA.getTime() : valA.getTime() - valB.getTime();
              if (diff !== 0) return diff;
            } else if (typeof valA === "string" && typeof valB === "string") {
              const diff = dir === "desc" ? valB.localeCompare(valA) : valA.localeCompare(valB);
              if (diff !== 0) return diff;
            } else {
              if (valA < valB) return dir === "desc" ? 1 : -1;
              if (valA > valB) return dir === "desc" ? -1 : 1;
            }
          }
          return 0;
        }
        return 0;
      });
    }

    if (this.skipVal !== null) {
      results = results.slice(this.skipVal);
    }

    if (this.limitVal !== null) {
      results = results.slice(0, this.limitVal);
    }

    if (this.isSingleDoc) {
      return results[0] || null;
    }

    return results;
  }
}

export class FirestoreModel {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  find(query: any = {}) {
    return new FirestoreQuery(this.collectionName, query, false);
  }

  findOne(query: any = {}) {
    return new FirestoreQuery(this.collectionName, query, true).limit(1);
  }

  findById(id: any) {
    const docId = typeof id === "object" && id.toString ? id.toString() : String(id);
    return new FirestoreQuery(this.collectionName, { _id: docId }, true).limit(1);
  }

  async create(data: any): Promise<any> {
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        const itemCopy = { ...item };
        delete itemCopy._id;
        delete itemCopy.id;
        const docRef = await db.collection(this.collectionName).add({
          ...itemCopy,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        results.push(new MongooseDoc(this.collectionName, itemCopy, docRef.id));
      }
      return results;
    } else {
      const itemCopy = { ...data };
      delete itemCopy._id;
      delete itemCopy.id;
      const docRef = await db.collection(this.collectionName).add({
        ...itemCopy,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return new MongooseDoc(this.collectionName, itemCopy, docRef.id);
    }
  }

  async findOneAndUpdate(query: any, update: any, options: any = {}) {
    let doc = await this.findOne(query);
    const updateData = update.$set || update;
    
    const cleanedUpdate: any = {};
    for (const key of Object.keys(updateData)) {
      if (!key.startsWith("$")) {
        cleanedUpdate[key] = updateData[key];
      }
    }

    if (!doc) {
      if (options.upsert) {
        const initialData = { ...query, ...cleanedUpdate };
        delete initialData._id;
        doc = await this.create(initialData);
        return doc;
      }
      return null;
    }

    const docId = doc.id;
    await db.collection(this.collectionName).doc(docId).set(cleanedUpdate, { merge: true });
    
    if (options.new) {
      return this.findById(docId);
    }
    return doc;
  }

  async findByIdAndUpdate(id: any, update: any, options: any = {}) {
    const docId = typeof id === "object" && id.toString ? id.toString() : String(id);
    return this.findOneAndUpdate({ _id: docId }, update, options);
  }

  async updateOne(query: any, update: any) {
    const doc = await this.findOne(query);
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    const updateData = update.$set || update;
    
    const cleanedUpdate: any = {};
    for (const key of Object.keys(updateData)) {
      if (!key.startsWith("$")) {
        cleanedUpdate[key] = updateData[key];
      }
    }

    await db.collection(this.collectionName).doc(doc.id).set(cleanedUpdate, { merge: true });
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteMany(query: any = {}) {
    const docs = await this.find(query);
    const batch = db.batch();
    for (const doc of docs) {
      const ref = db.collection(this.collectionName).doc(doc.id);
      batch.delete(ref);
    }
    await batch.commit();
    return { deletedCount: docs.length };
  }

  async deleteOne(query: any = {}) {
    const doc = await this.findOne(query);
    if (!doc) return { deletedCount: 0 };
    await db.collection(this.collectionName).doc(doc.id).delete();
    return { deletedCount: 1 };
  }

  async countDocuments(query: any = {}) {
    const results = await this.find(query);
    return results.length;
  }

  async insertMany(docs: any[]) {
    return this.create(docs);
  }

  async findByIdAndDelete(id: any) {
    const docId = typeof id === "object" && id.toString ? id.toString() : String(id);
    const doc = await this.findById(docId);
    if (!doc) return null;
    await db.collection(this.collectionName).doc(docId).delete();
    return doc;
  }

  async aggregate(pipeline: any[]) {
    let matchQuery: any = {};
    for (const stage of pipeline) {
      if (stage.$match) {
        for (const key of Object.keys(stage.$match)) {
          if (!key.startsWith("ownerData.")) {
            matchQuery[key] = stage.$match[key];
          }
        }
      }
    }

    const businesses = await this.find(matchQuery).exec();
    const usersModel = new FirestoreModel("users");
    
    const results: any[] = [];
    for (const biz of businesses) {
      const ownerId = biz.ownerId;
      const ownerData = await usersModel.findById(ownerId);
      
      const suspendedFilter = pipeline.some(stage => 
        stage.$match && stage.$match["ownerData.status"] && stage.$match["ownerData.status"].$ne === "SUSPENDED"
      );

      if (ownerData) {
        if (suspendedFilter && ownerData.status === "SUSPENDED") {
          continue;
        }
        results.push({
          ...biz.toObject(),
          ownerData: ownerData.toObject()
        });
      }
    }
    return results;
  }
}

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

function matchValue(docVal: any, op: string, opVal: any, subVal?: any): boolean {
  if (op === "$eq") return docVal === opVal;
  if (op === "$ne") {
    const neVal = opVal && opVal.toString ? opVal.toString() : opVal;
    const compDocVal = docVal && docVal.toString ? docVal.toString() : docVal;
    return compDocVal !== neVal;
  }
  if (op === "$gt") return docVal > opVal;
  if (op === "$gte") return docVal >= opVal;
  if (op === "$lt") return docVal < opVal;
  if (op === "$lte") return docVal <= opVal;
  if (op === "$regex") {
    const regex = new RegExp(opVal, subVal ? subVal["$options"] || "" : "");
    return typeof docVal === "string" && regex.test(docVal);
  }
  if (op === "$exists") {
    return opVal ? docVal !== undefined : docVal === undefined;
  }
  if (op === "$in") {
    const mappedOps = Array.isArray(opVal) ? opVal.map(x => x && x.toString ? x.toString() : x) : [];
    if (Array.isArray(docVal)) {
      return docVal.some(d => mappedOps.includes(d && d.toString ? d.toString() : d));
    }
    return mappedOps.includes(docVal && docVal.toString ? docVal.toString() : docVal);
  }
  if (op === "$nin") {
    const mappedOps = Array.isArray(opVal) ? opVal.map(x => x && x.toString ? x.toString() : x) : [];
    if (Array.isArray(docVal)) {
      return !docVal.some(d => mappedOps.includes(d && d.toString ? d.toString() : d));
    }
    return !mappedOps.includes(docVal && docVal.toString ? docVal.toString() : docVal);
  }
  return false;
}

function evaluateFilter(doc: any, query: any): boolean {
  if (!query) return true;
  for (const key of Object.keys(query)) {
    const val = query[key];
    if (key === "$or" && Array.isArray(val)) {
      if (!val.some(subQuery => evaluateFilter(doc, subQuery))) return false;
    } else if (key === "$and" && Array.isArray(val)) {
      if (!val.every(subQuery => evaluateFilter(doc, subQuery))) return false;
    } else {
      let docVal = getNestedValue(doc, key);
      if (key === "_id" || key === "id") {
        docVal = doc._id || doc.id;
      }
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        const ops = Object.keys(val);
        const isOp = ops.every(op => op.startsWith("$"));
        if (isOp) {
          for (const op of ops) {
            if (op === "$options") continue;
            if (!matchValue(docVal, op, val[op], val)) return false;
          }
        } else {
          if (JSON.stringify(docVal) !== JSON.stringify(val)) return false;
        }
      } else {
        const compVal = val && val.toString ? val.toString() : val;
        const compDocVal = docVal && docVal.toString ? docVal.toString() : docVal;
        if (compDocVal !== compVal) return false;
      }
    }
  }
  return true;
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
    try {
      let queryRef: admin.firestore.Query = db.collection(this.collectionName);
      let canUseDirectQuery = true;

      for (const key of Object.keys(this.queryObj)) {
        const val = this.queryObj[key];
        if (key === "$or" || key === "$and" || key === "$nor") {
          canUseDirectQuery = false;
          break;
        }

        const isIdField = key === "_id" || key === "id";
        const dbField = isIdField ? admin.firestore.FieldPath.documentId() : key;

        if (val && typeof val === "object" && !Array.isArray(val)) {
          for (const op of Object.keys(val)) {
            if (op === "$eq") {
              queryRef = queryRef.where(dbField, "==", val[op]);
            } else if (op === "$in") {
              queryRef = queryRef.where(dbField, "in", val[op]);
            } else if (op === "$gt") {
              queryRef = queryRef.where(dbField, ">", val[op]);
            } else if (op === "$gte") {
              queryRef = queryRef.where(dbField, ">=", val[op]);
            } else if (op === "$lt") {
              queryRef = queryRef.where(dbField, "<", val[op]);
            } else if (op === "$lte") {
              queryRef = queryRef.where(dbField, "<=", val[op]);
            } else {
              canUseDirectQuery = false;
              break;
            }
          }
        } else {
          queryRef = queryRef.where(dbField, "==", val);
        }
        if (!canUseDirectQuery) break;
      }

      if (canUseDirectQuery) {
        if (this.sortObj) {
          if (typeof this.sortObj === "string") {
            const desc = this.sortObj.startsWith("-");
            const field = desc ? this.sortObj.substring(1) : this.sortObj;
            queryRef = queryRef.orderBy(field, desc ? "desc" : "asc");
          } else if (typeof this.sortObj === "object") {
            for (const k of Object.keys(this.sortObj)) {
              const dir = this.sortObj[k] === -1 || this.sortObj[k] === "desc" ? "desc" : "asc";
              queryRef = queryRef.orderBy(k, dir);
            }
          }
        }

        if (this.limitVal !== null) {
          queryRef = queryRef.limit(this.limitVal);
        }
        if (this.skipVal !== null) {
          queryRef = queryRef.offset(this.skipVal);
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

        if (this.populates.length > 0) {
          for (const pop of this.populates) {
            let targetColl = "users";
            if (pop.path === "businessId") {
              targetColl = "businesses";
            } else if (pop.path === "connectionId") {
              targetColl = "connections";
            } else if (pop.path === "senderId" || pop.path === "receiverId" || pop.path === "userId" || pop.path === "matchedUserId") {
              targetColl = "users";
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

        if (this.isSingleDoc) {
          return results[0] || null;
        }
        return results;
      }
    } catch (err: any) {
      console.warn(`Direct query failed (or requires index) for ${this.collectionName}, falling back to in-memory. Error: ${err.message}`);
    }

    // --- FALLBACK TO IN-MEMORY ---
    const snapshot = await db.collection(this.collectionName).get();
    let results = snapshot.docs.map(doc => {
      const data = doc.data();
      for (const k of Object.keys(data)) {
        if (data[k] && typeof data[k] === "object" && typeof data[k].toDate === "function") {
          data[k] = data[k].toDate();
        }
      }
      return new MongooseDoc(this.collectionName, data, doc.id);
    });

    results = results.filter(doc => evaluateFilter(doc, this.queryObj));

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

    if (this.populates.length > 0) {
      for (const pop of this.populates) {
        let targetColl = "users";
        if (pop.path === "businessId") {
          targetColl = "businesses";
        } else if (pop.path === "connectionId") {
          targetColl = "connections";
        } else if (pop.path === "senderId" || pop.path === "receiverId" || pop.path === "userId" || pop.path === "matchedUserId") {
          targetColl = "users";
        }

        // Only run populate on sliced results to avoid fetching thousands of documents
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
    let results = await this.find({}).exec();

    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter((doc: any) => evaluateFilter(doc, stage.$match));
      } else if (stage.$group) {
        const groupKeyPath = stage.$group._id;
        const accumulators = Object.keys(stage.$group).filter(k => k !== "_id");
        
        const groups = new Map<any, any[]>();
        for (const doc of results) {
          let groupVal: any;
          if (groupKeyPath === null) {
            groupVal = null;
          } else if (typeof groupKeyPath === "string" && groupKeyPath.startsWith("$")) {
            groupVal = getNestedValue(doc, groupKeyPath.substring(1));
          } else if (typeof groupKeyPath === "object") {
            if (groupKeyPath.$dateToString) {
              const { format, date } = groupKeyPath.$dateToString;
              const dateVal = date.startsWith("$") ? getNestedValue(doc, date.substring(1)) : date;
              if (dateVal instanceof Date) {
                const y = dateVal.getFullYear();
                const m = String(dateVal.getMonth() + 1).padStart(2, "0");
                const d = String(dateVal.getDate()).padStart(2, "0");
                groupVal = `${y}-${m}-${d}`;
              } else {
                groupVal = null;
              }
            } else {
              groupVal = {};
              for (const k of Object.keys(groupKeyPath)) {
                const path = groupKeyPath[k];
                if (typeof path === "string" && path.startsWith("$")) {
                  groupVal[k] = getNestedValue(doc, path.substring(1));
                } else if (path && typeof path === "object" && path.$arrayElemAt) {
                  const [arrPath, idx] = path.$arrayElemAt;
                  const arr = arrPath.startsWith("$") ? getNestedValue(doc, arrPath.substring(1)) : arrPath;
                  groupVal[k] = Array.isArray(arr) ? arr[idx] : undefined;
                } else {
                  groupVal[k] = path;
                }
              }
              groupVal = JSON.stringify(groupVal);
            }
          } else {
            groupVal = groupKeyPath;
          }
          
          if (!groups.has(groupVal)) {
            groups.set(groupVal, []);
          }
          groups.get(groupVal)!.push(doc);
        }
        
        const groupResults: any[] = [];
        for (const [gKey, docs] of groups.entries()) {
          const groupObj: any = {};
          if (typeof gKey === "string" && gKey.startsWith("{") && gKey.endsWith("}")) {
            try {
              groupObj._id = JSON.parse(gKey);
            } catch {
              groupObj._id = gKey;
            }
          } else {
            groupObj._id = gKey;
          }
          
          for (const accKey of accumulators) {
            const accExpr = stage.$group[accKey];
            if (accExpr.$sum) {
              const sumVal = accExpr.$sum;
              if (sumVal === 1) {
                groupObj[accKey] = docs.length;
              } else if (typeof sumVal === "string" && sumVal.startsWith("$")) {
                const field = sumVal.substring(1);
                groupObj[accKey] = docs.reduce((acc, doc) => acc + (Number(getNestedValue(doc, field)) || 0), 0);
              } else if (typeof sumVal === "object" && sumVal.$cond) {
                const cond = sumVal.$cond;
                groupObj[accKey] = docs.reduce((acc, doc) => {
                  let matchesCond = false;
                  if (Array.isArray(cond)) {
                    const [expr, thenVal, elseVal] = cond;
                    if (expr.$eq) {
                      const [left, right] = expr.$eq;
                      const leftVal = left.startsWith("$") ? getNestedValue(doc, left.substring(1)) : left;
                      const rightVal = right.startsWith("$") ? getNestedValue(doc, right.substring(1)) : right;
                      matchesCond = leftVal === rightVal;
                    }
                    return acc + (matchesCond ? thenVal : elseVal);
                  }
                  return acc;
                }, 0);
              } else {
                groupObj[accKey] = docs.length;
              }
            } else if (accExpr.$avg) {
              const avgVal = accExpr.$avg;
              if (typeof avgVal === "string" && avgVal.startsWith("$")) {
                const field = avgVal.substring(1);
                const sum = docs.reduce((acc, doc) => acc + (Number(getNestedValue(doc, field)) || 0), 0);
                groupObj[accKey] = docs.length > 0 ? sum / docs.length : 0;
              }
            }
          }
          groupResults.push(groupObj);
        }
        results = groupResults;
      } else if (stage.$bucket) {
        const { groupBy, boundaries, default: defaultKey, output } = stage.$bucket;
        const bucketField = typeof groupBy === "string" && groupBy.startsWith("$") ? groupBy.substring(1) : null;
        
        const bucketResults: any[] = [];
        const bucketGroups = new Map<any, any[]>();
        
        for (const doc of results) {
          const val = bucketField ? Number(getNestedValue(doc, bucketField)) : NaN;
          let foundBucket = false;
          
          if (!isNaN(val)) {
            for (let i = 0; i < boundaries.length - 1; i++) {
              const lower = boundaries[i];
              const upper = boundaries[i+1];
              if (val >= lower && val < upper) {
                const bKey = lower;
                if (!bucketGroups.has(bKey)) {
                  bucketGroups.set(bKey, []);
                }
                bucketGroups.get(bKey)!.push(doc);
                foundBucket = true;
                break;
              }
            }
          }
          
          if (!foundBucket && defaultKey !== undefined) {
            if (!bucketGroups.has(defaultKey)) {
              bucketGroups.set(defaultKey, []);
            }
            bucketGroups.get(defaultKey)!.push(doc);
          }
        }
        
        for (let i = 0; i < boundaries.length - 1; i++) {
          const lower = boundaries[i];
          const docs = bucketGroups.get(lower) || [];
          
          const outObj: any = { _id: lower };
          if (output) {
            for (const outKey of Object.keys(output)) {
              const expr = output[outKey];
              if (expr.$sum) {
                if (expr.$sum === 1) {
                  outObj[outKey] = docs.length;
                } else {
                  outObj[outKey] = docs.length;
                }
              }
            }
          } else {
            outObj.count = docs.length;
          }
          bucketResults.push(outObj);
        }
        
        if (defaultKey !== undefined && bucketGroups.has(defaultKey)) {
          const docs = bucketGroups.get(defaultKey) || [];
          const outObj: any = { _id: defaultKey };
          if (output) {
            for (const outKey of Object.keys(output)) {
              const expr = output[outKey];
              if (expr.$sum === 1) {
                outObj[outKey] = docs.length;
              } else {
                outObj[outKey] = docs.length;
              }
            }
          } else {
            outObj.count = docs.length;
          }
          bucketResults.push(outObj);
        }
        
        results = bucketResults;
      } else if (stage.$sort) {
        results.sort((a: any, b: any) => {
          for (const k of Object.keys(stage.$sort)) {
            const dir = stage.$sort[k];
            const valA = a[k];
            const valB = b[k];
            if (valA < valB) return dir === -1 ? 1 : -1;
            if (valA > valB) return dir === -1 ? -1 : 1;
          }
          return 0;
        });
      } else if (stage.$limit) {
        results = results.slice(0, stage.$limit);
      } else if (stage.$skip) {
        results = results.slice(stage.$skip);
      } else if (stage.$addFields) {
        for (const field of Object.keys(stage.$addFields)) {
          const expr = stage.$addFields[field];
          for (const doc of results) {
            if (expr.$multiply) {
              const parts = expr.$multiply;
              const factors = parts.map((p: any) => {
                if (typeof p === "number") return p;
                if (typeof p === "string" && p.startsWith("$")) return getNestedValue(doc, p.substring(1));
                if (p.$floor && p.$floor.$divide) {
                  const [divLeft, divRight] = p.$floor.$divide;
                  const lVal = typeof divLeft === "string" && divLeft.startsWith("$") ? getNestedValue(doc, divLeft.substring(1)) : divLeft;
                  const rVal = typeof divRight === "string" && divRight.startsWith("$") ? getNestedValue(doc, divRight.substring(1)) : divRight;
                  return Math.floor(Number(lVal) / Number(rVal));
                }
                return 0;
              });
              doc[field] = factors.reduce((acc: number, f: number) => acc * f, 1);
            } else if (expr.$divide) {
              const [divLeft, divRight] = expr.$divide;
              const lVal = typeof divLeft === "string" && divLeft.startsWith("$") ? getNestedValue(doc, divLeft.substring(1)) : divLeft;
              const rVal = typeof divRight === "string" && divRight.startsWith("$") ? getNestedValue(doc, divRight.substring(1)) : divRight;
              doc[field] = Number(rVal) !== 0 ? Number(lVal) / Number(rVal) : 0;
            }
          }
        }
      } else if (stage.$lookup) {
        const { from, localField, foreignField, as } = stage.$lookup;
        const foreignModel = new FirestoreModel(from);
        const foreignDocs = await foreignModel.find({}).exec();
        for (const doc of results) {
          const lVal = getNestedValue(doc, localField);
          const matches = foreignDocs.filter((fd: any) => {
            const fVal = getNestedValue(fd, foreignField);
            return lVal !== undefined && fVal !== undefined && String(lVal) === String(fVal);
          });
          doc[as] = matches;
        }
      } else if (stage.$unwind) {
        const pathStr = typeof stage.$unwind === "string" ? stage.$unwind : stage.$unwind.path;
        const field = pathStr.startsWith("$") ? pathStr.substring(1) : pathStr;
        const newResults: any[] = [];
        for (const doc of results) {
          const arr = getNestedValue(doc, field);
          if (Array.isArray(arr) && arr.length > 0) {
            for (const item of arr) {
              newResults.push({ ...doc, [field]: item });
            }
          } else if (arr && !Array.isArray(arr)) {
            newResults.push(doc);
          } else if (stage.$unwind.preserveNullAndEmptyArrays) {
            newResults.push({ ...doc, [field]: null });
          }
        }
        results = newResults;
      } else if (stage.$count) {
        const countField = stage.$count;
        results = [{ [countField]: results.length }];
      }
    }
    return results;
  }
}

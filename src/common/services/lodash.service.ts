import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

@Injectable()
export class LodashService {
  // Method to omit keys from an object
  omitKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return _.omit(obj, keys) as Omit<T, K>;
  }

  // Method to pick specific keys from an object
  pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return _.pick(obj, keys) as Pick<T, K>;
  }

  // Method to merge multiple objects
  mergeObjects(...objects: object[]): object {
    return _.merge({}, ...objects);
  }

  // Method to clone an object
  clone<T>(obj: T): T {
    return _.cloneDeep(obj);
  }

  // Method to map values in an array or object
  map<T, U>(collection: T[], iteratee: (value: T) => U): U[] {
    return _.map(collection, iteratee);
  }

  // Method to find a value in an array
  find<T>(collection: T[], predicate: (value: T) => boolean): T | undefined {
    return _.find(collection, predicate);
  }

  // Method to filter an array based on a predicate
  filter<T>(collection: T[], predicate: (value: T) => boolean): T[] {
    return _.filter(collection, predicate);
  }

  // Add more utility methods as needed
}

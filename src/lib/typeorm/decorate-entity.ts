import { BaseEntity } from 'typeorm';
import { decorateEntityClass } from '../decorate-class'

export function decorateEntities(entityNames, {entityMetaDatas, entityDecorators, decorate, entityStore}) {
  return entityNames.reduce((acc, entityName) => {
    const metaData = entityMetaDatas[entityName];
    const { propertiesMap } = metaData;
    // create blank @Entity decorated class
    // todo: use composition using list of class decorators
    const entityClazz = class extends BaseEntity {};
    // decorate entity class further and add class to map
    acc[entityName] = decorateEntityClass(entityClazz, propertiesMap, entityDecorators, decorate)
    return acc;
  }, entityStore);  
}


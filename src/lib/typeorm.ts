import { BaseEntity } from 'typeorm';
import { validate } from 'class-validator';
import deepmerge from 'deepmerge';

const identity = (value, _: any) => value;

import {
  mapToClassValidators,
  decorators as xtraDecorators
} from './class-validator';

import * as classDecorators from 'class-validator/decorator/decorators';

// class decorator to add validate() method to a class
export const Validator = target => {
  target.prototype.validate = async opts => {
    return validate(this, opts);
  };
};

// extending BaseExtentity automatically adds save method as well
export const RepoSaver = ({ connection, entityName }) => target => {
  const name = entityName || target.constructor.name;
  const repository = connection.getRepository(name);
  target.prototype.save = async opts => {
    return repository.save(this, opts);
  };
  return target;
};

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const decorators = {
  ...xtraDecorators,
  ...classDecorators
};

export const decorate = (propertiesMap, { entityClass }) => {
  const propNames = Object.keys(propertiesMap);
  propNames.map(propName => {
    const propertyMap = propertiesMap[propName];
    const decoratorMap = mapToClassValidators(
      propertyMap.directives.constraints
    );
    const decoratorKeys = Object.keys(decoratorMap);
    decoratorKeys.map(decName => {
      const decorateArgs = decoratorMap[decName];
      const decorator = decorators[decName];
      const target = entityClass.prototype[propName];
      const decorateMember = decorator(...decorateArgs);
      decorateMember(target, propName);
    });
  });
};

export const buildEntityClassMap = (
  connection,
  entityStore = {},
  decorateFn = identity,
  opts: any = {}
) => {
  const merge = opts.merge || deepmerge;
  const entityDecorators = opts.classDecorators || [Validator];

  const entityMetaDatas = connection.entityMetaDatas.reduce((acc, metaData) => {
    const { targetName } = metaData;
    // targetName is the entity (class) name
    // merge metadata for entity
    acc[targetName] = merge({
      ...(acc[targetName] || {}),
      ...metaData
    });
  }, {});

  const entityNames = Object.keys(entityMetaDatas);

  return entityNames.reduce((acc, entityName) => {
    const metaData = entityMetaDatas[entityName];
    const { propertiesMap } = metaData;
    // create blank @Entity decorated class
    // todo: use composition using list of class decorators
    const entityClazz = class extends BaseEntity {};
    const decoratedEntityClass = pipe(...entityDecorators)(entityClazz);
    // decorate entity class further and add class to map
    acc[entityName] = decorateFn(propertiesMap, {
      entityClass: decoratedEntityClass
    });
    return acc;
  }, entityStore);
};

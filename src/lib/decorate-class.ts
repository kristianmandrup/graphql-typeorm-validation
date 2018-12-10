import * as classDecorators from 'class-validator/decorator/decorators';

import {
  mapToClassValidators,
  decorators as xtraDecorators
} from './class-validator';

const decorators = {
  ...xtraDecorators,
  ...classDecorators
};

export const decorateClass = (propertiesMap, { entityClass }) => {
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
      // See property decorators: https://netbasal.com/create-and-test-decorators-in-javascript-85e8d5cf879c
      const decorateMember = decorator(...decorateArgs);
      decorateMember(entityClass.prototype, propName);
    });
  });
};

export function decorateEntityClass(entityClazz, propertiesMap, entityDecorators, decorate) {
  const decoratedEntityClass = pipeEntityDecoratorsOnClass(entityClazz, entityDecorators)
  // decorate entity class further and add class to map
  return decorate(propertiesMap, {
    entityClass: decoratedEntityClass
  });  
}

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

export function pipeEntityDecoratorsOnClass(entityClazz, entityDecorators) {
  return pipe(...entityDecorators)(entityClazz);
}


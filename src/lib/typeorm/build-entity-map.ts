import deepmerge from 'deepmerge';
import { ClassValidator } from './ClassValidator'
import { decorateEntities } from './decorate-entity'

const identity = (value, _: any) => value;

export const buildEntityClassMap = (
  connection,
  entityStore = {},
  decorate = identity,
  opts: any = {}
) => {
  const merge = opts.merge || deepmerge;
  const entityDecorators = opts.classDecorators || [ClassValidator];

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
  return decorateEntities(entityNames, {entityMetaDatas, entityDecorators, decorate, entityStore})
};


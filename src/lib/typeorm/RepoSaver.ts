// extending BaseExtentity automatically adds save method as well
export const RepoSaver = ({ connection, entityName }) => target => {
  const name = entityName || target.constructor.name;
  const repository = connection.getRepository(name);
  target.prototype.save = async opts => {
    return repository.save(this, opts);
  };
  return target;
};

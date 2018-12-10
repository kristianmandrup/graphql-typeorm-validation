import { validate } from 'class-validator';

// class decorator to add validate() method to a class
export const ClassValidator = target => {
  target.prototype.validate = async opts => {
    return validate(this, opts);
  };
};

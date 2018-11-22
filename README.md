# graphql-typeorm-validation

Map GraphQL directive validations to typeorm entities

## TypeORM Entity validation

This library lets your wrap TypeORM `@Entity` classes with validation logic.

The validation constraints are extracted via [graphGenTypeorm](https://github.com/jjwtay/graphGenTypeorm) from a GraphQL type definition, defined using a `@constraints` directive.

`graphGenTypeorm` generates entity metadata used by typeorm to define the ORM for the entities.
This metadata also contains all the directives applied to each field, including `@constraints`

The function `buildEntityClassMap(connection)` can load this entity metadata from a given `connection`, extract the constraint metadata and apply it on each class property as [class-validator](https://github.com/typestack/class-validator) decorators.

In effect taking a typedef like:

```graphql
type Person {
  name: String! @constraints(minLength: 2, maxLength: 60)
}
```

And applying it via the typeorm connection "backdoor" to achieve the following entity (along with any DB related metadata)

```js
@Entity
class Person extends BaseEntity {
  @MinLength(2)
  @MaxLength(60)
  name: string;
}
```

When calling `buildEntityClassMap` you can pass a custom `decorator` function to apply custom validation logic as you see fit.

## Usage

```js
import { buildEntityClassMap } from 'graphql-constraint-directive/typeorm';

const entityClassMap = buildEntityClassMap(connection);
const { Post } = entityClassMap;
// ...
let postRepository = connection.getRepository('Post');

let post = new Post();
post.title = 'A new Post';
post.text = 'bla bla bla';
await validate(post, {
  // ... optional validation options
});
await postRepository.save(post);
```

This means that you can have your application generate GraphqL resolver logic to apply validation both on the input object (arguments) of a mutation and on the entity created to be saved in the DB. You can then add additional validation on the entity as you see fit.
This ensures that if you access the entities in other contexts, such as via a different API (f.ex REST), the validation defined in the GraphQL type definition still applies.

No more manual sync across your entire codebase!

The default decoration of `buildEntityClassMap` makes `async save()` and `async validate(opts)` available as instance methods on the Entity class, so that you can simplify it to:

```js
import { buildEntityClasses } from 'graphql-constraint-directive/typeorm';
const entityClassMap = buildEntityClassMap(connection);
const { Post } = entityClassMap;

let post = new Post();
post.title = 'A new Post';
post.text = 'bla bla bla';
const errors = await post.validate();
errors ? handleErrors(error) : await post.save();
```

## Resources

- [Generate entity classes via connection entities metadata](https://github.com/typeorm/typeorm/issues/3141)
- [Entity configuration via JSON Schema](https://github.com/typeorm/typeorm/issues/1818)

## License MIT

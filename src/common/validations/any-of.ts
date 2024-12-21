// import {
//   registerDecorator,
//   ValidationArguments,
//   ValidationOptions,
// } from 'class-validator';
//
// export function AnyOf(
//   properties: string[],
//   validationOptions?: ValidationOptions,
// ) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       name: 'AnyOf',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [properties],
//       options: validationOptions,
//       validator: {
//         validate(_value: any, args: ValidationArguments) {
//           const objectToValidate = args.object as Record<string, any>;
//           const requiredProperties = args.constraints[0] as string[];
//
//           // Check if at least one property is present
//           return requiredProperties.some(
//             (prop) =>
//               objectToValidate[prop] !== undefined &&
//               objectToValidate[prop] !== null,
//           );
//         },
//         defaultMessage(args: ValidationArguments) {
//           const properties = args.constraints[0].join(', ');
//           return `At least one of the following properties must be provided: ${properties}`;
//         },
//       },
//     });
//   };
// }

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class AnyOfConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const objectToValidate = args.object as Record<string, any>;
    const properties = args.constraints as string[];

    // Check if at least one of the properties is defined and not null/empty
    return properties.some(
      (property) =>
        objectToValidate[property] !== undefined &&
        objectToValidate[property] !== null,
    );
  }

  defaultMessage(args: ValidationArguments) {
    const properties = args.constraints.join(', ');
    return `At least one of the following properties must be provided: ${properties}`;
  }
}

export function AnyOf(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (target: new (...args: any[]) => object) {
    registerDecorator({
      name: 'AnyOf',
      target: target as any,
      propertyName: undefined,
      options: validationOptions,
      constraints: properties,
      validator: AnyOfConstraint,
    });
  };
}

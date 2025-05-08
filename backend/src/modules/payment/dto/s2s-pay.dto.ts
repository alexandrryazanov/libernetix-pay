import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Luhn algorithm to validate card
@ValidatorConstraint({ name: 'isCardNumber', async: false })
export class IsCardNumberConstraint implements ValidatorConstraintInterface {
  validate(cardNumber: string): boolean {
    if (!/^\d{13,19}$/.test(cardNumber)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  defaultMessage(): string {
    return 'cardNumber is invalid (failed Luhn check)';
  }
}

export class S2sPayDto {
  @IsString()
  orderId: string;

  @IsString()
  cardholderName: string;

  @IsString()
  @Validate(IsCardNumberConstraint)
  cardNumber: string;

  @IsString()
  @Matches(/^((0[1-9])|(1[0-2]))\/\d{2}$/, {
    message: 'Expiration date must be in the format MM/YY and valid',
  })
  expires: string;

  @IsNumberString()
  @MinLength(3)
  @MaxLength(3)
  cvc: string;

  @IsString()
  userAgent: string;

  @IsOptional()
  @IsString()
  language: string;

  @IsOptional()
  @IsNumber()
  utcOffset: number;

  @IsOptional()
  @IsInt()
  screenWidth: number;

  @IsOptional()
  @IsInt()
  screenHeight: number;
}

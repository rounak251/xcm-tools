import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ParaSpellError } from '@paraspell/sdk';

export const handleXcmApiError = (error: unknown): never => {
  if (error instanceof ParaSpellError) {
    throw new BadRequestException(error.message);
  }

  // Intentional NestJS HTTP exceptions (e.g. BadRequestException) are already
  // Errors; re-wrapping them would mask their status code as a 500. Pass through.
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }

  throw new InternalServerErrorException('An unknown error occurred');
};

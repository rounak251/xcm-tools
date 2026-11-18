import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ParaSpellError } from '@paraspell/sdk';
import { describe, expect, it } from 'vitest';

import { handleXcmApiError } from './error-handler.js';

describe('handleXcmApiError', () => {
  it('throws BadRequestException for ParaSpell errors', () => {
    const handleError = () =>
      handleXcmApiError(new ParaSpellError('SDK error'));

    expect(handleError).toThrow(BadRequestException);
    expect(handleError).toThrow('SDK error');
  });

  it('throws InternalServerErrorException for other errors', () => {
    const handleError = () => handleXcmApiError(new Error('Unexpected error'));

    expect(handleError).toThrow(InternalServerErrorException);
    expect(handleError).toThrow('Unexpected error');
  });

  it('re-throws existing NestJS HttpExceptions unchanged (no 500 masking)', () => {
    const original = new BadRequestException('SwapOptions are required');
    const handleError = () => handleXcmApiError(original);

    expect(handleError).toThrow(BadRequestException);
    expect(handleError).toThrow('SwapOptions are required');
    // the exact instance is preserved, so the 400 status code survives
    expect(handleError).toThrow(HttpException);
    try {
      handleError();
    } catch (e) {
      expect(e).toBe(original);
      expect((e as BadRequestException).getStatus()).toBe(400);
    }
  });

  it('preserves the status code of other HttpExceptions (e.g. 404)', () => {
    const handleError = () => handleXcmApiError(new NotFoundException('Nope'));

    expect(handleError).toThrow(NotFoundException);
    try {
      handleError();
    } catch (e) {
      expect((e as NotFoundException).getStatus()).toBe(404);
    }
  });

  it('uses a generic message for non-error values', () => {
    const handleError = () => handleXcmApiError('Unexpected value');

    expect(handleError).toThrow(InternalServerErrorException);
    expect(handleError).toThrow('An unknown error occurred');
  });
});

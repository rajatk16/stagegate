import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

import { ApiEnvelope } from '../../src/common/decorators/apiEnvelope.decorator';
import { RawResponse } from '../../src/common/decorators/rawResponse.decorator';
import { ApiException } from '../../src/common/exceptions/api.exception';
import { RequestContextService } from '../../src/common/services/requestContext.service';

class CreateTestDto {
  @ApiProperty({
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name!: string;
}

class TestResultDto {
  @ApiProperty()
  name!: string;
}

@Controller('test-fixture')
export class TestController {
  constructor(private readonly context: RequestContextService) {}

  @Get('success')
  @ApiEnvelope(TestResultDto)
  getSuccess(): TestResultDto {
    return {
      name: 'StageGate',
    };
  }

  @Post('validate')
  @ApiEnvelope(TestResultDto, {
    status: HttpStatus.CREATED,
  })
  validate(@Body() body: CreateTestDto): TestResultDto {
    return {
      name: body.name,
    };
  }

  @Get('context')
  getContext(): {
    requestId: string;
  } {
    return {
      requestId: this.context.require().requestId,
    };
  }

  @Get('raw')
  @RawResponse()
  getRaw(): {
    status: string;
  } {
    return {
      status: 'raw',
    };
  }

  @Get('empty')
  @HttpCode(HttpStatus.NO_CONTENT)
  getEmpty(): void {
    return;
  }

  @Get('conflict')
  getConflict(): never {
    throw new ApiException({
      status: HttpStatus.CONFLICT,
      code: 'TEST_CONFLICT',
      message: 'A test conflict occurred.',
    });
  }

  @Get('not-found')
  getNotFound(): never {
    throw new NotFoundException('Sensitive internal resource identifier');
  }

  @Get('failure')
  getFailure(): never {
    throw new Error('Sensitive database credentials');
  }
}

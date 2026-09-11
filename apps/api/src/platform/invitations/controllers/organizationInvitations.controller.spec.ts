import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, type TestingModule } from '@nestjs/testing';
import { InvitationService } from '../services';
import { OrganizationInvitationsController } from './organizationInvitations.controller';

describe('OrganizationInvitationsController', () => {
  let controller: OrganizationInvitationsController;
  const invitations = {
    create: jest.fn<InvitationService['create']>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationInvitationsController],
      providers: [
        {
          provide: InvitationService,
          useValue: invitations,
        },
      ],
    }).compile();

    controller = module.get<OrganizationInvitationsController>(
      OrganizationInvitationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Module } from '@nestjs/common';

import { CfpsModule } from '@/cfps';
import { EventsModule } from '@/events';
import { SubmissionsModule } from '@/submissions';
import { OrganizationsModule } from '@/organizations';

import { ReviewsController, ReviewerWorkQueueController } from './controllers';
import {
  ReviewPeriodRepository,
  ReviewRubricRepository,
  ReviewConflictRepository,
  ReviewAssignmentRepository,
  ReviewerEligibilityRepository,
} from './repositories';
import {
  ReviewerWorkQueueService,
  ReviewPeriodDomainService,
  ReviewRubricDomainService,
  ReviewConflictApplicationService,
  ReviewAssignmentApplicationService,
  ReviewConfigurationApplicationService,
  ReviewerEligibilityApplicationService,
} from './services';

@Module({
  imports: [CfpsModule, EventsModule, SubmissionsModule, OrganizationsModule],
  controllers: [ReviewerWorkQueueController, ReviewsController],
  exports: [
    ReviewPeriodRepository,
    ReviewRubricRepository,
    ReviewConflictRepository,
    ReviewerWorkQueueService,
    ReviewRubricDomainService,
    ReviewAssignmentRepository,
    ReviewerEligibilityRepository,
    ReviewConflictApplicationService,
    ReviewAssignmentApplicationService,
    ReviewConfigurationApplicationService,
    ReviewerEligibilityApplicationService,
  ],
  providers: [
    ReviewPeriodRepository,
    ReviewRubricRepository,
    ReviewConflictRepository,
    ReviewPeriodDomainService,
    ReviewRubricDomainService,
    ReviewAssignmentRepository,
    ReviewerEligibilityRepository,
    ReviewConflictApplicationService,
    ReviewAssignmentApplicationService,
    ReviewConfigurationApplicationService,
    ReviewerEligibilityApplicationService,
    ReviewerWorkQueueService,
  ],
})
export class ReviewsModule {}

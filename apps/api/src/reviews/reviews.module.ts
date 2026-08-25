import { Module } from '@nestjs/common';

import { CfpsModule } from '@/cfps';
import { EventsModule } from '@/events';
import { SubmissionsModule } from '@/submissions';
import { OrganizationsModule } from '@/organizations';

import {
  ReviewsController,
  ReviewerReviewsController,
  ReviewerWorkQueueController,
} from './controllers';
import {
  ReviewRepository,
  ReviewPeriodRepository,
  ReviewRubricRepository,
  ReviewConflictRepository,
  ReviewAssignmentRepository,
  ReviewerEligibilityRepository,
  ReviewSubmissionRevisionRepository,
} from './repositories';
import {
  ReviewDomainService,
  ReviewApplicationService,
  ReviewerWorkQueueService,
  ReviewPeriodDomainService,
  ReviewRubricDomainService,
  ReviewerProposalViewService,
  ReviewConflictApplicationService,
  ReviewAssignmentApplicationService,
  ReviewConfigurationApplicationService,
  ReviewerEligibilityApplicationService,
} from './services';

@Module({
  imports: [CfpsModule, EventsModule, SubmissionsModule, OrganizationsModule],
  controllers: [
    ReviewsController,
    ReviewerReviewsController,
    ReviewerWorkQueueController,
  ],
  exports: [
    ReviewRepository,
    ReviewDomainService,
    ReviewPeriodRepository,
    ReviewRubricRepository,
    ReviewConflictRepository,
    ReviewerWorkQueueService,
    ReviewApplicationService,
    ReviewPeriodDomainService,
    ReviewRubricDomainService,
    ReviewAssignmentRepository,
    ReviewerProposalViewService,
    ReviewerEligibilityRepository,
    ReviewConflictApplicationService,
    ReviewAssignmentApplicationService,
    ReviewSubmissionRevisionRepository,
    ReviewConfigurationApplicationService,
    ReviewerEligibilityApplicationService,
  ],
  providers: [
    ReviewRepository,
    ReviewDomainService,
    ReviewPeriodRepository,
    ReviewRubricRepository,
    ReviewConflictRepository,
    ReviewerWorkQueueService,
    ReviewApplicationService,
    ReviewPeriodDomainService,
    ReviewRubricDomainService,
    ReviewAssignmentRepository,
    ReviewerProposalViewService,
    ReviewerEligibilityRepository,
    ReviewConflictApplicationService,
    ReviewAssignmentApplicationService,
    ReviewSubmissionRevisionRepository,
    ReviewConfigurationApplicationService,
    ReviewerEligibilityApplicationService,
  ],
})
export class ReviewsModule {}

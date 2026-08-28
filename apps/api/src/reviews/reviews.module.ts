import { Module } from '@nestjs/common';

import { CfpsModule } from '@/cfps';
import { UsersModule } from '@/users';
import { EventsModule } from '@/events';
import { SubmissionsModule } from '@/submissions';
import { OrganizationsModule } from '@/organizations';

import {
  ReviewsController,
  ChairCoverageController,
  DecisionRoundsController,
  ChairScorecardsController,
  ReviewerReviewsController,
  ChairProposalViewController,
  ReviewerWorkQueueController,
} from './controllers';
import {
  ReviewRepository,
  ReviewPeriodRepository,
  ReviewRubricRepository,
  DecisionRoundRepository,
  ReviewConflictRepository,
  ProposalDecisionRepository,
  ReviewAssignmentRepository,
  ReviewerWorkloadRepository,
  ReviewerEligibilityRepository,
  ProposalReviewScorecardRepository,
  ProposalDecisionRevisionRepository,
  ReviewSubmissionRevisionRepository,
} from './repositories';
import {
  ReviewDomainService,
  ReviewApplicationService,
  ReviewerWorkQueueService,
  ReviewPeriodDomainService,
  ReviewRubricDomainService,
  DecisionRoundDomainService,
  ReviewerProposalViewService,
  ReviewScorecardDomainService,
  ChairCoverageApplicationService,
  DecisionRoundApplicationService,
  ChairScorecardApplicationService,
  ReviewConflictApplicationService,
  ReviewerWorkloadProjectionService,
  ReviewAssignmentApplicationService,
  ChairProposalViewApplicationService,
  ReviewConfigurationApplicationService,
  ReviewerEligibilityApplicationService,
  ProposalReviewScorecardProjectionService,
} from './services';

@Module({
  imports: [
    CfpsModule,
    UsersModule,
    EventsModule,
    SubmissionsModule,
    OrganizationsModule,
  ],
  controllers: [
    ReviewsController,
    ChairCoverageController,
    DecisionRoundsController,
    ChairScorecardsController,
    ReviewerReviewsController,
    ChairProposalViewController,
    ReviewerWorkQueueController,
  ],
  providers: [
    ReviewRepository,
    ReviewDomainService,
    ReviewPeriodRepository,
    ReviewRubricRepository,
    DecisionRoundRepository,
    ReviewConflictRepository,
    ReviewerWorkQueueService,
    ReviewApplicationService,
    ReviewPeriodDomainService,
    ReviewRubricDomainService,
    DecisionRoundDomainService,
    ProposalDecisionRepository,
    ReviewAssignmentRepository,
    ReviewerWorkloadRepository,
    ReviewerProposalViewService,
    ReviewScorecardDomainService,
    ReviewerEligibilityRepository,
    ChairCoverageApplicationService,
    DecisionRoundApplicationService,
    ChairScorecardApplicationService,
    ReviewConflictApplicationService,
    ProposalReviewScorecardRepository,
    ReviewerWorkloadProjectionService,
    ProposalDecisionRevisionRepository,
    ReviewAssignmentApplicationService,
    ReviewSubmissionRevisionRepository,
    ChairProposalViewApplicationService,
    ReviewConfigurationApplicationService,
    ReviewerEligibilityApplicationService,
    ProposalReviewScorecardProjectionService,
  ],
})
export class ReviewsModule {}

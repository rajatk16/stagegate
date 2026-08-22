import { Injectable } from '@nestjs/common';

import { toIso } from '@/common';
import { Event } from '@/events';
import { Proposal, ProposalRepository, ProposalStatus } from '@/submissions';

import { ReviewerWorkQueueQueryDto } from '../dtos';
import { ReviewAssignmentRepository } from '../repositories';

@Injectable()
export class ReviewerWorkQueueService {
  constructor(
    private readonly proposalRepository: ProposalRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
  ) {}

  async getWorkQueue(
    event: Event,
    reviewerUserId: string,
    options: ReviewerWorkQueueQueryDto,
  ) {
    const assignmentPage =
      await this.reviewAssignmentRepository.findReviewerWorkQueuePage(
        event.id,
        reviewerUserId,
        options,
      );

    const proposals = await this.proposalRepository.findByIds(
      assignmentPage.items.map((assignment) => assignment.proposalId),
    );

    const proposalById = new Map<string, Proposal>(
      proposals.map((proposal) => [proposal.id, proposal]),
    );

    const items = assignmentPage.items.flatMap((assignment) => {
      const proposal = proposalById.get(assignment.proposalId);

      if (
        !proposal ||
        proposal.eventId !== event.id ||
        proposal.cfpId !== assignment.cfpId ||
        proposal.status !== ProposalStatus.SUBMITTED
      ) {
        return [];
      }

      return [
        {
          assignmentId: assignment.id,
          reviewPeriodId: assignment.reviewPeriodId,
          assignmentStatus: assignment.status,
          assignedAt: toIso(assignment.assignedAt)!,
          dueAt: toIso(assignment.dueAt),
          proposal: {
            id: proposal.id,
            title: proposal.title,
            abstract: proposal.abstract,
            description: proposal.description,
            format: proposal.format,
            durationMinutes: proposal.durationMinutes,
            language: proposal.language,
          },
        },
      ];
    });

    return {
      items,
      nextCursor: assignmentPage.nextCursor,
    };
  }
}

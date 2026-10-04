import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ApiException } from '../../common';
import { getOrganizationLogoPath } from '../utils';
import { DiagnosticError } from '../../observalibility';
import { OrganizationRepository } from '../repositories';
import { FirebaseService } from '../../firebase/services';
import { OrganizationScope, OrganizationWithMembership } from '../types';

export type UploadedOrganizationLogo = {
  buffer: Buffer;
  size: number;
};

const invalidLogo = () =>
  new ApiException(
    HttpStatus.BAD_REQUEST,
    'ORGANIZATION_LOGO_INVALID',
    'Use a valid non-animated PNG, JPEG, or WebP image.',
  );

@Injectable()
export class OrganizationLogoService {
  private readonly logger = new Logger(OrganizationLogoService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async upload(
    scope: OrganizationScope,
    file: UploadedOrganizationLogo | undefined,
  ): Promise<OrganizationWithMembership> {
    if (!file?.buffer?.length) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ORGANIZATION_LOGO_REQUIRED',
        'Choose a logo file.',
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new ApiException(
        HttpStatus.PAYLOAD_TOO_LARGE,
        'ORGANIZATION_LOGO_TOO_LARGE',
        'Use an image no larger than 2 MiB.',
      );
    }

    let image: Buffer;

    try {
      const pipeline = sharp(file.buffer, {
        limitInputPixels: 16_000_000,
        animated: false,
      });

      const metadata = await pipeline.metadata();

      if (
        !['png', 'jpeg', 'webp'].includes(metadata.format ?? '') ||
        (metadata.pages ?? 1) !== 1
      ) {
        throw invalidLogo();
      }

      image = await pipeline
        .rotate()
        .resize({
          width: 512,
          height: 512,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw invalidLogo();
    }

    const version = randomUUID();
    const path = getOrganizationLogoPath(scope.organizationId, version);

    await this.firebaseService.storage
      .bucket()
      .file(path)
      .save(image, {
        resumable: false,
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'private, no-store',
        },
      });

    const updated = await this.organizationRepository.replaceLogo(
      scope,
      version,
    );

    await this.deleteRetiredLogo(updated.previousLogoPath);

    return updated;
  }

  async remove(scope: OrganizationScope): Promise<OrganizationWithMembership> {
    const updated = await this.organizationRepository.replaceLogo(scope, null);

    await this.deleteRetiredLogo(updated.previousLogoPath);

    return updated;
  }

  async read(scope: OrganizationScope): Promise<Buffer> {
    const { logoVersion, logoStoragePath } = scope.organization;

    if (!logoVersion || !logoStoragePath) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'ORGANIZATION_LOGO_NOT_FOUND',
        'Organization logo not found.',
      );
    }

    if (
      logoStoragePath !==
      getOrganizationLogoPath(scope.organizationId, logoVersion)
    ) {
      throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
    }

    const [contents] = await this.firebaseService.storage
      .bucket()
      .file(logoStoragePath)
      .download();

    return contents;
  }

  private async deleteRetiredLogo(path: string | null): Promise<void> {
    if (!path) return;

    try {
      await this.firebaseService.storage.bucket().file(path).delete({
        ignoreNotFound: true,
      });
    } catch {
      this.logger.warn({
        event: 'organization.logo.cleanup.failed',
      });
    }
  }
}

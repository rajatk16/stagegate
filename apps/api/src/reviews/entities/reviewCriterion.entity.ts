export class ReviewCriterion {
  id: string;
  label: string;
  description: string | null;
  weight: number;
  minimumScore: number;
  maximumScore: number;
  displayOrder: number;
  required: boolean;
}

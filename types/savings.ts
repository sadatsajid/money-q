export interface SavingsFormData {
  name: string;
  type: string;
  targetAmount: string;
  targetDate: string;
  monthlyContribution: string;
  autoDistributePercent: string;
}

export interface DistributeFormData {
  [bucketId: string]: string;
}


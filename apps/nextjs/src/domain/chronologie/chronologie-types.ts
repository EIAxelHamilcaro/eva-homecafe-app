export interface IChronologieEntryProps {
  title: string;
  startDate: string | null;
  endDate: string | null;
  color: number;
  position: number;
  createdAt: Date;
  updatedAt: Date | null;
}

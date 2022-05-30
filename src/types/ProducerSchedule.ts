export interface ProducerSchedule {
  active: {
    version: string;
    producers: Producer[];
  };
  pending: null;
  proposed: null;
}

interface Producer {
  producer_name: string;
  authority: unknown;
}

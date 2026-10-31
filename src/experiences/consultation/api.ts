export type Astrologer = {
  id: string;
  name: string;
  specialty: string;
};

export async function getAstrologers(): Promise<Astrologer[]> {
  await Promise.resolve();
  return [
    { id: 'anaya', name: 'Anaya Rao', specialty: 'Natal charts' },
    { id: 'dev', name: 'Dev Mehta', specialty: 'Transit readings' },
  ];
}
 
export function calculateSuggestedEquipment(peopleCount: number) {
  // Tents: 1 tent (50-seater) per 50 people
  const suggestedTents = Math.ceil(peopleCount / 50);

  // Chairs: 1 chair per person
  const suggestedChairs = peopleCount;

  // Tables: 1 table per 10 people (round tables usually seat 10)
  const suggestedTables = Math.ceil(peopleCount / 10);

  // Cutlery/Crockery: people count + 10% buffer
  const buffer = 1.1;
  const suggestedPlates = Math.ceil(peopleCount * buffer);
  const suggestedSpoons = Math.ceil(peopleCount * buffer);
  const suggestedKnives = Math.ceil(peopleCount * buffer);
  const suggestedForks = Math.ceil(peopleCount * buffer);

  return {
    suggestedTents,
    suggestedChairs,
    suggestedTables,
    suggestedPlates,
    suggestedSpoons,
    suggestedKnives,
    suggestedForks,
  };
}

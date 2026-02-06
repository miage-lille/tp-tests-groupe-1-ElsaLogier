// Tests unitaires

import { User } from 'src/users/entities/user.entity';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';
import { ChangeSeats } from './change-seats';
import { Webinar } from '../entities/webinar.entity';

describe('Feature : Change seats', () => {
  // Initialisation de nos tests, boilerplates...
  let repository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  beforeEach(() => {
    repository = new InMemoryWebinarRepository();
    useCase = new ChangeSeats(repository);

    repository.create(
      new Webinar({
        id: 'w1',
        organizerId: '1',
        seats: 10,
        title: "Mieux vivre avec l'IA",
        startDate: new Date('2024-01-10T10:00:00.000Z'),
        endDate: new Date('2024-01-10T11:00:00.000Z'),
      }),
    );
  });

  describe('Scenario: Happy path', () => {
    // Code commun à notre scénario : payload...
    it('should change the number of seats for a webinar', async () => {
      // Vérification de la règle métier, condition testée...
      const payload = {
        webinarId: 'w1',
        user: new User({
          id: '1',
          email: 'a.truc@gmail.com',
          password: 'des trucs',
        }),
        seats: 20,
      };

      await useCase.execute(payload);

      const webinar = await repository.findById('w1');
      expect(webinar).toBeTruthy();
      expect(webinar?.props.seats).toEqual(20);
    });
  });

  describe('Scenario: bad-ending', () => {
    it('should not work if current user is not the organizer', async () => {
      const payload = {
        webinarId: 'w1',
        user: new User({
          id: '2',
          email: 'b.truc@gmail.com',
          password: 'des trucs',
        }),
        seats: 20,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'User is not allowed to update this webinar',
      );
    });

    it('should not work with inferior number of seats', async () => {
      const payload = {
        webinarId: 'w1',
        user: new User({
          id: '1',
          email: 'a.truc@gmail.com',
          password: 'des trucs',
        }),
        seats: 1,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot reduce the number of seats',
      );
    });

    it('should not work with too much seats', async () => {
      const payload = {
        webinarId: 'w1',
        user: new User({
          id: '1',
          email: 'a.truc@gmail.com',
          password: 'des trucs',
        }),
        seats: 1000000,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar must have at most 1000 seats',
      );
    });
  });
});

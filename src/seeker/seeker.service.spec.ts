import { Test, TestingModule } from '@nestjs/testing';
import { SeekerService } from './seeker.service';

describe('SeekerService', () => {
  let service: SeekerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeekerService],
    }).compile();

    service = module.get<SeekerService>(SeekerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

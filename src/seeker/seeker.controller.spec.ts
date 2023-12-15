import { Test, TestingModule } from '@nestjs/testing';
import { SeekerController } from './seeker.controller';

describe('SeekerController', () => {
  let controller: SeekerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeekerController],
    }).compile();

    controller = module.get<SeekerController>(SeekerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

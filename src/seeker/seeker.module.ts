import { Module } from '@nestjs/common';
import { SeekerController } from './seeker.controller';
import { SeekerService } from './seeker.service';

@Module({
  controllers: [SeekerController],
  providers: [SeekerService]
})
export class SeekerModule {}

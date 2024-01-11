import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService, private readonly authService: AuthService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('dsep/search')
  getContentFromIcar(@Body() body: any) {
    console.log("search api calling")
    return this.appService.handleSearch(body);
  }

  @Post('dsep/select')
  selectCourse(@Body() body: any) {
    console.log("select api calling")
    return this.appService.handleSelect(body);
  }

  @Post('dsep/init')
  initCourse(@Body() body: any) {
    console.log("init api calling")
    return this.appService.handleInit(body);
  }

  @Post('dsep/confirm')
  confirmCourse(@Body() body: any) {
    console.log("confirm api calling")
    return this.appService.handleConfirm(body);
  }

}

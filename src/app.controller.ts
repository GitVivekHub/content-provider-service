import { Controller, Get, Post, UseGuards, Body, Render, Res, Req, Param, Request, Response } from '@nestjs/common';
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

  //dsep
  @Post('dsep/search')
  getContentFromIcar(@Body() body: any) {
    console.log("search api calling")
    return this.appService.handleSearch(body);
    //return this.appService.getCoursesFromFln(body);
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

  @Post('dsep/rating')
  giveRating(@Body() body: any) {
    console.log("rating api calling")
    return this.appService.handleRating(body);
  }

  //mobility
  @Post('mobility/search')
  getContentFromIcar1(@Body() body: any) {
    console.log("search api calling")
    return this.appService.handleSearch(body);
  }

  @Post('mobility/select')
  selectCourse1(@Body() body: any) {
    console.log("select api calling")
    return this.appService.handleSelect(body);
  }

  @Post('mobility/init')
  initCourse1(@Body() body: any) {
    console.log("init api calling")
    return this.appService.handleInit(body);
  }

  @Post('mobility/confirm')
  confirmCourse1(@Body() body: any) {
    console.log("confirm api calling")
    return this.appService.handleConfirm(body);
  }

  @Post('mobility/rating')
  giveRating1(@Body() body: any) {
    console.log("rating api calling")
    return this.appService.handleRating(body);
  }

  @Get('feedback/:id')
  @Render('feedback') 
  getFeedbackForm(@Param('id') id: string) {
    return {id};
  }

  @Post('/submit-feedback/:id')
   submitFeedback(@Body('description') description: string,@Param('id') id: string, @Request() req: any) {
    console.log("description", description)
    console.log("id", id)

    const referer = req.get('Referer');
    console.log("Referer", referer)

    return this.appService.handleSubmit(description, id);

    // Check if the referer is not empty and belongs to your allowed domain
    // if (referer && referer.includes('vistaar.tekdinext.com')) {
    //     // Allow access to the feedback form
    //     return this.appService.handleSubmit(description, id);
        
    // } else {
    //     // Deny access if not loaded within the iframe
    //     res.status(403).send('Access denied. This page can only be loaded within an iframe.');
    // }

  }

}

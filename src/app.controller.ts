import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Render,
  Res,
  Req,
  Param,
  Request,
  Response,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AppService } from "./app.service";
import { AuthService } from "./auth/auth.service";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Controller("")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly httpService: HttpService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  //dsep
  @Post("dsep/search")
  getContentFromIcar(@Body() body: any) {
    console.log("search api calling");
    return this.appService.handleSearch(body);
    //return this.appService.getCoursesFromFln(body);
  }

  @Post("dsep/select")
  selectCourse(@Body() body: any) {
    console.log("select api calling");
    return this.appService.handleSelect(body);
  }

  @Post("dsep/init")
  initCourse(@Body() body: any) {
    console.log("init api calling");
    return this.appService.handleInit(body);
  }

  @Post("dsep/confirm")
  confirmCourse(@Body() body: any) {
    console.log("confirm api calling");
    return this.appService.handleConfirm(body);
  }

  @Post("dsep/rating")
  giveRating(@Body() body: any) {
    console.log("rating api calling");
    return this.appService.handleRating(body);
  }

  //mobility
  @Post("mobility/search")
  getContentFromIcar1(@Body() body: any) {
    console.log("search api calling");
    if (
      body?.message?.intent?.category?.descriptor?.name == "knowledge-advisory"
    ) {
      return this.appService.searchForIntentQuery(body);
    } else if (
      body?.message?.intent?.category?.descriptor?.code.toLowerCase() ==
        "schemes-agri" ||
      body?.message?.intent?.category?.descriptor?.name.toLowerCase() ==
        "schemes-agri"
    ) {
      console.log("Inside pm kisan search");
      return this.appService.handlePmKisanSearch(body);
    } else if (
      body?.message?.intent?.category?.descriptor?.code.toLowerCase() ==
        "icar-schemes" ||
      body?.message?.intent?.category?.descriptor?.name.toLowerCase() ==
        "icar-schemes"
    ) {
      console.log("Inside Icar search");
      return this.appService.handleSearch(body);
    }
  }

  @Post("mobility/select")
  selectCourse1(@Body() body: any) {
    console.log("select api calling");
    return this.appService.handleSelect(body);
  }

  @Post("mobility/init")
  async initCourse1(@Body() body: any) {
    console.log("init api calling");
    if (
      body?.message?.order?.provider?.id?.toLowerCase() == "schemes-agri" &&
      body?.message?.order?.items?.[0]?.id?.toLowerCase() == "pmfby"
    ) {
      console.log("INSIDE PMFBY INIT...");
      return this.appService.handlePmfbyInit(body);
    } else if (body?.message?.order?.provider?.id === "shc-discovery") {
      try {
        // Fetch soil health data

        let soilHeallthCardResponse =
          await this.appService.fetchAndMapSoilHealthCard(body);

        // Pass the first item to handleStatusForSHC for mapping
        return await this.appService.handleStatusForSHC(
          soilHeallthCardResponse,
          body
        );
      } catch (error) {
        throw new HttpException(
          `Failed to process soil health card: ${error.message}`,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } else if (body?.message?.order) {
      console.log("Inside pmkisan init...");
      return this.appService.handlePmkisanInit(body);
    } else {
      return this.appService.handleInit(body);
    }
  }

  @Post("mobility/confirm")
  confirmCourse1(@Body() body: any) {
    console.log("confirm api calling");
    return this.appService.handleConfirm(body);
  }

  @Post("mobility/rating")
  giveRating1(@Body() body: any) {
    console.log("rating api calling");
    return this.appService.handleRating(body);
  }

  @Post("mobility/status")
  async handleStatus(@Body() body: any) {
    console.log("status api calling");

    return this.appService.handleStatus(body);
  }

  @Get("feedback/:id")
  @Render("feedback")
  getFeedbackForm(@Param("id") id: string) {
    return { id };
  }

  @Post("/submit-feedback/:id")
  submitFeedback(
    @Body("description") description: string,
    @Param("id") id: string,
    @Request() req: any
  ) {
    console.log("description", description);
    console.log("id", id);

    const referer = req.get("Referer");
    console.log("Referer", referer);

    //return this.appService.handleSubmit(description, id);

    // Check if the referer is not empty and belongs to your allowed domain
    if (
      (referer && referer.includes("https://vistaar.tekdinext.com/")) ||
      referer.includes("https://oan.tekdinext.com/")
    ) {
      // Allow access to the feedback form
      return this.appService.handleSubmit(description, id);
    } else {
      // Deny access if not loaded within the iframe
      // res.status(403).send('Access denied. This page can only be loaded within an iframe.');
      throw new HttpException(
        "Access denied. This page can only be loaded within an iframe.",
        HttpStatus.FORBIDDEN
      );
    }
  }
}

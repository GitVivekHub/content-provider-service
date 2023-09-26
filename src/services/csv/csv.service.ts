import { Injectable } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';


@Injectable()
export class CsvService {
    async createCsvFile(data: any[], headers: string[], fileName: string): Promise<void> {
        const csvWriter = createObjectCsvWriter({
          path: fileName,
          header: headers.map(header => ({ id: header, title: header })),
        });
    
        await csvWriter.writeRecords(data);
      }
}

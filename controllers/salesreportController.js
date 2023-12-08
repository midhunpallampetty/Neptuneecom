const Order = require('../models/order'); // Assuming you have a model named 'Order'
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const ExcelJS = require('exceljs');

class SalesReportController {
    constructor() {
      this.generatePDF = this.generatePDF.bind(this);
      this.generateDailyReport = this.generateDailyReport.bind(this);
      this.generateMonthlyReport = this.generateMonthlyReport.bind(this);
      this.generateYearlyReport = this.generateYearlyReport.bind(this);
    }
  
  
  
  
  

    async generateDailyReport(req, res) {
        try {
          const date = new Date(); // Current date
          const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
          // Calculate the start and end dates for the week
          const startDate = new Date(date);
          startDate.setDate(date.getDate() - currentDay); // Go back to Sunday of the current week
          startDate.setHours(0, 0, 0, 0); // Set time to midnight
    
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7); // Go forward to the next Sunday
          endDate.setHours(0, 0, 0, 0); // Set time to midnight
    
          // Create an array of day names
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
          // Fetch order counts for each day of the week
          const weeklyOrderCounts = await Promise.all(
            Array.from({ length: 7 }, (_, day) => {
              const dayStartDate = new Date(startDate);
              dayStartDate.setDate(startDate.getDate() + day);
    
              const dayEndDate = new Date(dayStartDate);
              dayEndDate.setDate(dayStartDate.getDate() + 1);
    
              return Order.countDocuments({
                orderDate: { $gte: dayStartDate, $lt: dayEndDate }
              });
            })
          );
    
          // Create content for the PDF
          const pdfContent = weeklyOrderCounts.map((count, index) => `${dayNames[index]}: ${count}`);
    
          // Generate PDF
          const logoPath = ('public/imgs/logo.png');

          this.generatePDF(res, 'Weekly Sales Report', pdfContent,logoPath);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
  
    async generateMonthlyReport(req, res) {
        try {
          const date = new Date(); // Current date
          const currentMonth = date.getMonth();
          const currentYear = date.getFullYear();
      
          const startDate = new Date(currentYear, 0, 1); // Start from the beginning of the year
          const endDate = new Date(currentYear, currentMonth + 1, 0); // Set the day to 0 to get the last day of the previous month
      
          // Fetch order counts for each month
          const monthlyOrderCounts = await Promise.all(
            Array.from({ length: 12 }, (_, month) => {
              const monthStartDate = new Date(currentYear, month, 1);
              const monthEndDate = new Date(currentYear, month + 1, 0);
      
              return Order.countDocuments({
                orderDate: { $gte: monthStartDate, $lt: monthEndDate }
              });
            })
          );
      
          console.log('Test', monthlyOrderCounts);
      
          // Assuming month names are needed, you can use a function to get the month name
          const monthNames = Array.from({ length: 12 }, (_, month) =>
            (new Intl.DateTimeFormat('en-US', { month: 'long' })).format(new Date(currentYear, month, 1))
          );
      
          const monthlyReportContent = monthlyOrderCounts.map((count, index) => `${monthNames[index]}: ${count}`);
          const logoPath = ('public/imgs/logo.png');
          this.generatePDF(res, 'Monthly Sales Report', monthlyReportContent,logoPath);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
      
      
      

  async generateYearlyReport(req, res) {
    try {
      const date = new Date(); // Current date
      const currentYear = date.getFullYear();

      // Creating an array of years starting from 2016 up to the current year
      const years = Array.from({ length: currentYear - 2015 }, (_, index) => 2016 + index);

      // Fetch order counts for each year
      const yearlyOrderCounts = await Promise.all(
        years.map(async (year) => {
          const startDate = new Date(year, 0, 1);
          const endDate = new Date(year + 1, 0, 1);

          const orderCount = await Order.countDocuments({
            orderDate: { $gte: startDate, $lt: endDate }
          });

          return `${year}: ${orderCount}`;
        })
      );

      const logoPath = ('public/imgs/logo.png'); // Adjust the path to your logo
      this.generatePDF(res, 'Neptune Music Company -Yearly Sales Report', yearlyOrderCounts, logoPath);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  
  async applyOpacityToLogo(logoBuffer, opacity) {
    try {
      const image = await Jimp.read(logoBuffer);
      image.opacity(opacity);
      return image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
      console.error('Error applying opacity to logo:', error);
      return logoBuffer;
    }
  }

  async generatePDF(res, title, content, logoPath) {
    const doc = new PDFDocument();
  
    doc.pipe(res);
  
    // Include the company logo
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
  
      // Set opacity to 30%
      const opacity = 0.1;
  
      const processedLogoBuffer = await this.applyOpacityToLogo(logoBuffer, opacity);
  
      // Calculate the center position for the logo
      const logoWidth = 300; // Adjust the width of the small logo
      const logoHeight = 300; // Adjust the height of the small logo
  
      // Repeat the small logo across the entire page
      for (let y = 0; y < doc.page.height; y += logoHeight + 10) {
        for (let x = 0; x < doc.page.width; x += logoWidth + 10) {
          doc.image(processedLogoBuffer, x, y, { width: logoWidth });
        }
      }
    }
  
    // Set title and content with improved styling
    doc.font('Helvetica-Bold').fontSize(24).text(title, { align: 'center', margin: 20, underline: true });
  
    // Add content to the PDF with improved styling
    content.forEach((line) => {
      doc.font('Times-Roman').fontSize(18).text(line, { align: 'left', margin: 10 });
    });
  

  
    // Generate a conclusion paragraph
    const conclusion = `In the current financial period, the company experienced gains and losses. Despite challenges, the company remains resilient and optimistic about future opportunities. Thanks to the company employees and partner companies for the remarkable gains. We appreciate your continued support and look forward to your presence in our future growth. - Team Neptune`;
  
    doc.font('Times-Roman').fontSize(12).text(conclusion, { align: 'left', margin: 20 });
  
    // Add a footer with the current date
    const currentDate = new Date().toLocaleDateString();
    doc.fontSize(12).text(`Generated on: ${currentDate}`, { align: 'right', margin: 20 });
  
    doc.end();
  }
  



  


}

module.exports = new SalesReportController();

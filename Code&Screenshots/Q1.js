<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parking charge</title>
</head>
<body>
    <script>
        const fs = require('fs');
        const { parse } = require('csv-parse');
        const { stringify } = require('csv-stringify');

        function calculate_charges(duration_hours) {
            if (duration_hours <= 0) {
                return "Error: Duration must be positive";
            }
            let total_charge = 0;
            let remaining_hours = duration_hours;
            while (remaining_hours > 0) {
                const current_period_hours = Math.min(remaining_hours, 24);
                let period_charge = 0;
                if (current_period_hours <= 3) {
                    period_charge = 2.00;
                } else {
                    const additional_hours = Math.ceil(current_period_hours - 3); 
                    period_charge = 2.00 + additional_hours * 0.50;
                }
                period_charge = Math.min(period_charge, 10.00);
                total_charge += period_charge;
                remaining_hours -= current_period_hours;
            }
            return Math.min(total_charge, 30.00);
        }
        async function processParkingData() {
            const inputFilePath = 'yesterday.csv';
            const outputFilePath = 'charges_report.csv';
            const processedRecords = [];
            const customersChargedMax = new Set();
            let totalReceipts = 0;
            let longestStayHours = 0;
            let longestStayCustomerIds = [];
            if (!fs.existsSync(inputFilePath)) {
                console.error(`Error: Input file "${inputFilePath}" not found.`);
                return;
            }
            try {
                const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
                const records = await new Promise((resolve, reject) => {
                    parse(fileContent, { columns: true, trim: true }, (err, output) => {
                        if (err) reject(err);
                        resolve(output);
                    });
                });
                for (const record of records) {
                  const { customer_id, entry_timestamp, exit_timestamp } = record;
                  const entryTime = new Date(entry_timestamp);
                  const exitTime = new Date(exit_timestamp);
                  let durationHours = (exitTime - entryTime) / (1000 * 60 * 60); 
                  let charge = 0;
                  let errorFlag = '';
                  let roundedDuration = 0;
                  if (exitTime <= entryTime) {
                    errorFlag = 'Error: Exit time is before or same as entry time';
                    durationHours = 0;
                  } else {
                      roundedDuration = Math.ceil(durationHours);
                      charge = calculate_charges(durationHours);
                      if (charge === 10.00 && durationHours > 3) { 
                        customersChargedMax.add(customer_id);
                       }
                    totalReceipts += charge;
                    if (roundedDuration > longestStayHours) {
                        longestStayHours = roundedDuration;
                        longestStayCustomerIds = [customer_id];
                    } else if (roundedDuration === longestStayHours) {
                        longestStayCustomerIds.push(customer_id);
                    }
                }
                processedRecords.push({
                    customer_id,
                    duration_hours: roundedDuration,
                    charge: typeof charge === 'number' ? `$${charge.toFixed(2)}` : charge,
                    error_flag: errorFlag
                });
                }
                stringify(processedRecords, { header: true, columns: csvHeaders }, (err, output) => {
                if (err) throw err;
                fs.writeFileSync(outputFilePath, output, 'utf-8');
                console.log(`Successfully wrote the report to ${outputFilePath}`);
                });
                console.log('\n--- Summary Statistics ---');
                console.log(`Total Receipts: $${totalReceipts.toFixed(2)}`);
                console.log(`Number of customers charged the daily maximum: ${customersChargedMax.size}`);
                console.log(`Average charge: $${(totalReceipts / processedRecords.length).toFixed(2)}`);
                console.log(`Longest stay(s) (${longestStayHours} hours): ${longestStayCustomerIds.join(', ')}`);
                } catch (error) {
                console.error('An error occurred during file processing:', error);
                }
                }
                processParkingData();
    </script>
</body>
</html>
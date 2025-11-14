<?php

function lineSum(string $filename, int $lineNumber): int {

    if (!file_exists($filename) || !is_readable($filename)) {
        trigger_error("Error: File '{$filename}' not found or unreadable.", E_USER_WARNING);
        return 0;
    }

    $fileHandle = fopen($filename, 'r');
    if (!$fileHandle) {
        trigger_error("Error: Could not open file '{$filename}' for reading.", E_USER_WARNING);
        return 0;
    }

    $currentLineNum = 0;
    $sum = 0;


    while (($line = fgets($fileHandle)) !== false) {
        $currentLineNum++;
        $trimmedLine = trim($line);
        if (empty($trimmedLine) || str_starts_with($trimmedLine, '#')) {
            continue;
        }

        if ($currentLineNum === $lineNumber) {

            $tokens = preg_split('/\s+/', $trimmedLine);
    
            foreach ($tokens as $token) {


                if (filter_var($token, FILTER_VALIDATE_INT) !== false) {
                    $sum += (int)$token;
                }
            }
            

            break;
        }
    }

    fclose($fileHandle);

    if ($currentLineNum < $lineNumber) {

        trigger_error("Error: Requested line number {$lineNumber} is beyond the end of the file.", E_USER_WARNING);
    }
    
    return $sum;
}


$filename = "sums.txt";
$fileContents = "# header\n5\n15 10\n20 25\n50\n200\n50 60\n75 100\nnon int 500\n";
file_put_contents($filename, $fileContents);

echo "--- Testing lineSum function ---\n\n";


$sum1 = lineSum($filename, 2);
echo "Line 2 sum: {$sum1} (Expected: 25)\n";


$sum2 = lineSum($filename, 5);
echo "Line 5 sum: {$sum2} (Expected: 200)\n";


$sum3 = lineSum($filename, 8);
echo "Line 8 sum: {$sum3} (Expected: 110)\n";


$sum4 = lineSum($filename, 9);
echo "Line 9 sum: {$sum4} (Expected: 500)\n";


$sum5 = lineSum("nonexistent.txt", 1);
echo "Non-existent file sum: {$sum5} (Expected: 0)\n"; 


$sum6 = lineSum($filename, 20);
echo "Line 20 sum: {$sum6} (Expected: 0)\n"; /

?>


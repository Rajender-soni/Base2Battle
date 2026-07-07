import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const companySheetsPath = path.join(__dirname, '..', 'public', 'company-sheets');

function getCompanyData() {
    const companies = [];
    const companyFolders = fs.readdirSync(companySheetsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const companyName of companyFolders) {
        const csvFiles = [
            '1. Thirty Days.csv',
            '2. Three Months.csv',
            '3. Six Months.csv',
            '4. More Than Six Months.csv',
            '5. All.csv'
        ];
        
        const allProblems = new Set(); // Track unique problem titles
        let filesFound = 0;
        
        for (const csvFile of csvFiles) {
            const csvPath = path.join(companySheetsPath, companyName, csvFile);
            
            if (fs.existsSync(csvPath)) {
                try {
                    const csvContent = fs.readFileSync(csvPath, 'utf-8');
                    const lines = csvContent.split('\n');
                    
                    // Parse CSV and extract unique problem titles
                    if (lines.length > 1) {
                        filesFound++;
                        const headers = lines[0].split(',');
                        const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title'));
                        
                        if (titleIndex !== -1) {
                            for (let i = 1; i < lines.length; i++) {
                                const line = lines[i].trim();
                                if (line) {
                                    // Simple CSV parsing (might not handle all edge cases)
                                    const parts = line.split(',');
                                    if (parts[titleIndex] && parts[titleIndex].trim()) {
                                        allProblems.add(parts[titleIndex].trim());
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error reading ${csvFile} for ${companyName}:`, error.message);
                }
            }
        }
        
        if (filesFound > 0 && allProblems.size > 0) {
            companies.push({
                name: companyName,
                problems: allProblems.size,
                slug: companyName
            });
        }
    }

    // Sort by problem count descending
    companies.sort((a, b) => b.problems - a.problems);

    return companies;
}

const companies = getCompanyData();

console.log(`Found ${companies.length} companies`);
console.log(`\nTop 10 companies by problem count:`);
companies.slice(0, 10).forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}: ${c.problems} problems`);
});

// Generate the JavaScript array format
const jsArrayCode = `// Auto-generated company data\nconst companiesData = ${JSON.stringify(companies, null, 4)};\n\nexport default companiesData;`;

const outputPath = path.join(__dirname, '..', 'src', 'data', 'companiesData.js');

// Create data directory if it doesn't exist
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, jsArrayCode, 'utf-8');

console.log(`\nCompany data written to: ${outputPath}`);
console.log(`Total companies: ${companies.length}`);
console.log(`Total problems: ${companies.reduce((sum, c) => sum + c.problems, 0)}`);

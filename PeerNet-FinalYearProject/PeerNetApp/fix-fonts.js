const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(screensDir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(screensDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix missing comma after fontSize if there is a fontFamily immediately following
        content = content.replace(/fontSize:\s*(\d+) \s*fontFamily:/g, `fontSize: $1, fontFamily:`);

        // Fix duplicate fontFamily
        content = content.replace(/fontFamily:\s*'Poppins-Regular',\s*fontFamily:\s*'Poppins-\w+'/g, (match) => {
            return match.split(',')[1].trim(); // keep the second one
        });

        fs.writeFileSync(filePath, content);
        console.log(`Fixed syntax in ${file}`);
    }
});

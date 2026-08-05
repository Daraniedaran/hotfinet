const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(screensDir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(screensDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace fontWeights with explicit fontFamilies to prevent Android fallback bugs
        content = content.replace(/fontWeight:\s*'900'/g, `fontFamily: 'Poppins-Black'`);
        content = content.replace(/fontWeight:\s*'800'/g, `fontFamily: 'Poppins-Bold'`);
        content = content.replace(/fontWeight:\s*'700'/g, `fontFamily: 'Poppins-Bold'`);
        content = content.replace(/fontWeight:\s*'600'/g, `fontFamily: 'Poppins-SemiBold'`);
        content = content.replace(/fontWeight:\s*'500'/g, `fontFamily: 'Poppins-Medium'`);
        content = content.replace(/fontWeight:\s*'normal'/g, `fontFamily: 'Poppins-Regular'`);

        // Identify any style that has colors/fonts but needs a regular font family
        // A simple heuristic: inject 'Poppins-Regular' into any StyleSheet line defining fontSize but not fontFamily.
        const lines = content.split('\n');
        const newLines = lines.map(line => {
            if (line.includes('fontSize:') && !line.includes('fontFamily:')) {
                // Appends fontFamily next to fontSize
                return line.replace(/(fontSize:\s*\d+,?)/, `$1 fontFamily: 'Poppins-Regular',`);
            }
            return line;
        });

        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log(`Updated fonts in ${file}`);
    }
});

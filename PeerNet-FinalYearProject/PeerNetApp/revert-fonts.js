const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
const files = fs.readdirSync(screensDir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(screensDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Revert explicit font-weights from custom Poppins styles
        content = content.replace(/fontFamily:\s*'Poppins-Black'/g, `fontWeight: '900'`);
        content = content.replace(/fontFamily:\s*'Poppins-Bold'/g, `fontWeight: '800'`);
        content = content.replace(/fontFamily:\s*'Poppins-SemiBold'/g, `fontWeight: '600'`);
        content = content.replace(/fontFamily:\s*'Poppins-Medium'/g, `fontWeight: '500'`);
        content = content.replace(/,\s*fontFamily:\s*'Poppins-Regular'\s*,/g, ',');
        content = content.replace(/,\s*fontFamily:\s*'Poppins-Regular'/g, '');
        content = content.replace(/fontFamily:\s*'Poppins-Regular',?\s*/g, '');

        fs.writeFileSync(filePath, content);
        console.log(`Reverted fonts in ${file}`);
    }
});

const navFile = path.join(__dirname, 'src', 'navigation', 'AppNavigator.js');
let navContent = fs.readFileSync(navFile, 'utf8');
navContent = navContent.replace(/fontFamily:\s*'Poppins-Black'/g, `fontWeight: '900'`);
navContent = navContent.replace(/fontFamily:\s*'Poppins-Bold'/g, `fontWeight: '800'`);
navContent = navContent.replace(/fontFamily:\s*'Poppins-SemiBold'/g, `fontWeight: '600'`);
navContent = navContent.replace(/fontFamily:\s*'Poppins-Medium'/g, `fontWeight: '500'`);
navContent = navContent.replace(/,\s*fontFamily:\s*'Poppins-Regular'\s*,/g, ',');
navContent = navContent.replace(/,\s*fontFamily:\s*'Poppins-Regular'/g, '');
navContent = navContent.replace(/fontFamily:\s*'Poppins-Regular',?\s*/g, '');
fs.writeFileSync(navFile, navContent);
console.log('Reverted fonts in AppNavigator.js');

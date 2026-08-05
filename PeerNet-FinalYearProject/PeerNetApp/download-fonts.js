const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = [
    { name: 'Poppins-Regular.ttf', url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf' },
    { name: 'Poppins-Medium.ttf', url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Medium.ttf' },
    { name: 'Poppins-SemiBold.ttf', url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf' },
    { name: 'Poppins-Bold.ttf', url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf' },
    { name: 'Poppins-Black.ttf', url: 'https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Black.ttf' }
];

const destDir = path.join(__dirname, 'assets', 'fonts');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fonts.forEach(font => {
    const destPath = path.join(destDir, font.name);
    const file = fs.createWriteStream(destPath);
    https.get(font.url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => console.log('Downloaded: ' + font.name));
        });
    }).on('error', function (err) {
        fs.unlink(destPath);
        console.error('Error downloading ' + font.name + ': ' + err.message);
    });
});

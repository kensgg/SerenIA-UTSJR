const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = content;
            
            // Fix readability (darker texts and slightly larger fonts)
            modified = modified.replace(/text-gray-400/g, 'text-gray-600');
            modified = modified.replace(/text-\[9px\]/g, 'text-[11px]');
            modified = modified.replace(/text-\[10px\]/g, 'text-[12px]');
            
            // Fix responsiveness (table scrolling, grid adjustments)
            modified = modified.replace(/grid grid-cols-1 lg:grid-cols-12/g, 'flex flex-col xl:grid xl:grid-cols-12');
            modified = modified.replace(/w-full text-left/g, 'w-full min-w-[800px] text-left');
            
            if (content !== modified) {
                fs.writeFileSync(fullPath, modified, 'utf-8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceInFiles('./frontend/src');

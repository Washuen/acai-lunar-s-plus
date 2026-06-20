const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'CHECKLIST_FINAL_BLOCO_3_0.md');
console.log(fs.readFileSync(file, 'utf-8'));

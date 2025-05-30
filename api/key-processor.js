const fs = require('fs');
const path = require('path');

const keysPath = path.join(__dirname, '../data/keys.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(keysPath))) {
    fs.mkdirSync(path.dirname(keysPath), { recursive: true });
}

// Initialize keys file if not exists
if (!fs.existsSync(keysPath)) {
    fs.writeFileSync(keysPath, '[]');
}

// Read keys
const keys = JSON.parse(fs.readFileSync(keysPath));

// Process action
const actionType = process.env.ACTION_TYPE;
const keyValue = process.env.KEY_VALUE;

switch (actionType) {
    case 'create-key':
        const newKey = {
            value: `kiet_${Math.random().toString().slice(2, 12)}`,
            created: new Date().toISOString(),
            active: true
        };
        keys.push(newKey);
        console.log(`::set-output name=new_key::${newKey.value}`);
        break;
        
    case 'delete-key':
        const index = keys.findIndex(k => k.value === keyValue);
        if (index !== -1) {
            keys.splice(index, 1);
        }
        break;
        
    case 'validate-key':
        const isValid = keys.some(k => k.value === keyValue && k.active);
        console.log(`::set-output name=is_valid::${isValid}`);
        break;
}

// Save changes
fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
console.log('::set-output name=changes_made::true');

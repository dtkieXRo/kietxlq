const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const keysPath = path.join(__dirname, '../data/keys.json');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(path.dirname(keysPath))) {
  fs.mkdirSync(path.dirname(keysPath), { recursive: true });
}

// Khởi tạo file keys.json nếu chưa tồn tại
if (!fs.existsSync(keysPath)) {
  fs.writeFileSync(keysPath, '[]', 'utf-8');
}

const keys = JSON.parse(fs.readFileSync(keysPath, 'utf-8'));

const actionType = process.env.ACTION_TYPE;
const keyValue = process.env.KEY_VALUE;

// Xử lý các action khác nhau
switch (actionType) {
  case 'create-key':
    const newKey = {
      value: `kiet_${Math.random().toString().slice(2, 12)}`,
      created: new Date().toISOString(),
      active: true,
      creator: 'system'
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

// Lưu thay đổi
fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2), 'utf-8');
console.log('::set-output name=changes_made::true');

const fs = require('fs');
function r(p) {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/>\$(?=\{)/g, '>৳');
  c = c.replace(/ \$(?=\{)/g, ' ৳');
  c = c.replace(/-\$(?=\{)/g, '-৳');
  c = c.replace(/>\$([0-9]+\.[0-9]+)/g, '>৳$1');
  c = c.replace(/\$([0-9]+)/g, '৳$1');
  c = c.replace(/return `\$\$\{price.toFixed\(2\)\}`/g, 'return `৳${price.toFixed(2)}`'); // For products-data-table
  fs.writeFileSync(p, c);
}
[
  'app/page.tsx', 
  'app/shop/page.tsx', 
  'components/product-purchase-client.tsx', 
  'app/cart/page.tsx', 
  'app/checkout/page.tsx', 
  'components/products-data-table.tsx',
  'app/admin/orders/page.tsx',
  'app/profile/page.tsx'
].forEach(r);

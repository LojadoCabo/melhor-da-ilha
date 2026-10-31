import AdmZip from 'adm-zip';
import path from 'path';

const zip = new AdmZip();
const distPath = path.resolve('dist');

zip.addLocalFolder(distPath);
zip.writeZip('site_v2.zip');
console.log('Zip created successfully: site_v2.zip');

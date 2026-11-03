const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'certs');
const privateKeyPem = fs.readFileSync(path.join(certsDir, 'private_key.key'), 'utf8');
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

// Look for .cer file in certs dir or Downloads
let cerPath = path.join(certsDir, 'distribution.cer');
if (!fs.existsSync(cerPath)) {
  const files = fs.readdirSync(certsDir).filter(f => f.endsWith('.cer'));
  if (files.length > 0) {
    cerPath = path.join(certsDir, files[0]);
  } else {
    console.error('Please place the downloaded .cer file in:', certsDir);
    process.exit(1);
  }
}

console.log('Reading certificate from:', cerPath);
const cerBuffer = fs.readFileSync(cerPath);
let cert;
try {
  // Try DER format first (Apple default)
  const asn1 = forge.asn1.fromDer(cerBuffer.toString('binary'));
  cert = forge.pki.certificateFromAsn1(asn1);
} catch (e) {
  // Fallback to PEM
  cert = forge.pki.certificateFromPem(cerBuffer.toString('utf8'));
}

console.log('Generating PKCS#12 (.p12) container...');
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, [cert], 'viscera123', {
  friendlyName: 'Viscera Distribution Certificate',
  algorithm: '3des'
});

const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Path = path.join(certsDir, 'viscera_dist.p12');
fs.writeFileSync(p12Path, p12Der, 'binary');

console.log('SUCCESS! .p12 generated at: ' + p12Path);
console.log('Password for .p12 is: viscera123');


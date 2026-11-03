const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating 2048-bit RSA key pair...');
const keys = forge.pki.rsa.generateKeyPair(2048);

const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
fs.writeFileSync(path.join(certsDir, 'private_key.key'), privateKeyPem);

console.log('Creating Certificate Signing Request (CSR)...');
const csr = forge.pki.createCertificationRequest();
csr.publicKey = keys.publicKey;
csr.setSubject([
  { name: 'commonName', value: 'Ashok Rathod' },
  { name: 'countryName', value: 'IN' },
  { shortName: 'ST', value: 'Gujarat' },
  { name: 'localityName', value: 'Ahmedabad' },
  { name: 'organizationName', value: 'Viscera' },
  { shortName: 'OU', value: 'Viscera App' },
  { name: 'emailAddress', value: 'developer@viscera.app' }
]);

// Sign CSR with private key
csr.sign(keys.privateKey, forge.md.sha256.create());

const csrPem = forge.pki.certificationRequestToPem(csr);
const csrPath = path.join(certsDir, 'CertificateSigningRequest.certSigningRequest');
fs.writeFileSync(csrPath, csrPem);

console.log('CSR generated successfully at: ' + csrPath);


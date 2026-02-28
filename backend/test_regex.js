
function validateTaxId(taxId) {
    const regex = /^\d{7}\/[A-Za-z]\/[A-Za-z]\/[A-Za-z]\/\d{3}$/;
    return regex.test(taxId);
}

const testCases = [
    '1234567/A/A/M/000',
    '1234567/a/a/m/000',
    '1839246/Y/A/M/000',
    '0001832/G/N/C/000'
];

testCases.forEach(t => console.log(`${t}: ${validateTaxId(t)}`));

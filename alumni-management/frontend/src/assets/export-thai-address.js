const thAddress = require('thai-address-database/lib/index.js');
const fs = require('fs');

// วนลูปตัวอักษรไทยทุกตัวเพื่อรวมข้อมูลจังหวัด
const chars = [
  'ก','ข','ค','ง','จ','ฉ','ช','ซ','ฌ','ญ','ฎ','ฏ','ฐ','ฑ','ฒ','ณ','ด','ต','ถ','ท','ธ','น','บ','ป','ผ','ฝ','พ','ฟ','ภ','ม','ย','ร','ฤ','ล','ฦ','ว','ศ','ษ','ส','ห','ฬ','อ','ฮ'
];
let flatData = [];
chars.forEach(char => {
  flatData.push(...thAddress.searchAddressByProvince(char));
});

const provinces = Array.from(new Set(flatData.map(item => item.province)));
const result = { provinces: [] };
provinces.forEach(provinceName => {
  const amphoes = Array.from(new Set(flatData.filter(item => item.province === provinceName).map(item => item.amphoe)));
  const amphoeArr = amphoes.map(amphoeName => {
    const districts = flatData.filter(item => item.province === provinceName && item.amphoe === amphoeName)
      .map(item => ({ name: item.district, zipcode: item.zipcode }));
    return { name: amphoeName, districts };
  });
  result.provinces.push({ name: provinceName, amphoes: amphoeArr });
});

fs.writeFileSync('./thai-address-full.json', JSON.stringify(result, null, 2));
console.log('Exported thai-address-full.json complete!');

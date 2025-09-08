const fs = require('fs');
const db = require('thai-address-database/database/db.json');
// ฟังก์ชัน preprocess (แบบเต็ม) จาก thai-address-database
function preprocess(data) {
  var lookup = [];
  var words = [];
  var expanded = [];
  var useLookup = false;
  var t;
  if (data.lookup && data.words) {
    // compact with dictionary and lookup
    useLookup = true;
    lookup = data.lookup.split('|');
    words = data.words.split('|');
    data = data.data;
  }
  t = function (text) {
    function repl(m) {
      var ch = m.charCodeAt(0);
      return words[ch < 97 ? ch - 65 : 26 + ch - 97];
    }
    if (!useLookup) {
      return text;
    }
    if (typeof text === 'number') {
      text = lookup[text];
    }
    return text.replace(/[A-Z]/ig, repl);
  };
  if (!data[0].length) {
    // non-compacted database
    return data;
  }
  // decompacted database in hierarchical form of:
  // [["province",[["amphur",[["district",["zip"...]]...]]...]]...]
  data.map(function (provinces) {
    var i = 1;
    if (provinces.length === 3) {
      // geographic database
      i = 2;
    }
    provinces[i].map(function (amphoes) {
      amphoes[i].map(function (districts) {
        districts[i] = districts[i] instanceof Array ? districts[i] : [districts[i]];
        districts[i].map(function (zipcode) {
          var entry = {
            district: t(districts[0]),
            amphoe: t(amphoes[0]),
            province: t(provinces[0]),
            zipcode: zipcode
          };
          if (i === 2) {
            // geographic database
            entry.district_code = districts[1] || false;
            entry.amphoe_code = amphoes[1] || false;
            entry.province_code = provinces[1] || false;
          }
          expanded.push(entry);
        });
      });
    });
  });
  return expanded;
}

const flatData = preprocess(db);
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

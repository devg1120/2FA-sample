// work on node v10.15.3

const DIGIT = 6;
const TIME_STEP = 30;

/**
 * Calculate TOTP value defined in [RFC6238](https://tools.ietf.org/html/rfc6238)
 *
 * @param {Buffer} key  shared secret between client and server
 * @param {Date} date   date to calculate totp value.
 *
 * @return {string} 6-digit decimal TOTP value
 */
function totp(key, date) {
  // count TIME_STEP from base Unix Time
  const counter = Math.floor(date.getTime() / 1000 / TIME_STEP);

  return hotp(key, counter);
}

/**
 * Calculate HOTP value defined in [RFC4226](https://tools.ietf.org/html/rfc4226).
 *
 * @param {Buffer} key shared secret between client and server
 * @param {number} counter counter value
 *
 * @return {string} 6-digit decimal HOTP value
 */
function hotp(key, counter) {
  // pack counter to 8-byte buffer in big-endian
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2**32), 0);
  buf.writeUInt32BE(counter, 4);

  const val = trunc(hmacsha1(key, buf));
  return val.toString().padStart(DIGIT, '0');
}

/**
 * Convert 20-byte binary string to a number less than 10**digit.
 * defined in [RFC4226 §5.3](https://tools.ietf.org/html/rfc4226#section-5.3)
 *
 * @param {Buffer} data 20-byte binary string.
 *
 * @return {number} calculated number that is less than 10**digit.
 */
function trunc(data) {
  const offset = data[data.length-1] & 0x0f; // 0 <= offset <= 15

  // get last 31bits of data[offset]...data[offset+3];
  const code = data.readUInt32BE(offset) & 0x7fffffff;

  return code % 10**DIGIT;
}

const crypto = require('crypto');
/**
 * Calculate HMAC-SHA-1 value defined in [RFC2104](https://tools.ietf.org/html/rfc2104).
 *
 * @param {Buffer} key      secret key. (up to 64Bytes)
 * @param {Buffer} message  stream data to calc HMAC.
 *
 * @return {Buffer} 20-byte binary string.
 */
function hmacsha1(key, message) {
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(message);
  return hmac.digest();
}


const base32table = {
  'A': 0, 'J': 9, 'S': 18, '3': 27,
  'B': 1, 'K': 10, 'T': 19, '4': 28,
  'C': 2, 'L': 11, 'U': 20, '5': 29,
  'D': 3, 'M': 12, 'V': 21, '6': 30,
  'E': 4, 'N': 13, 'W': 22, '7': 31,
  'F': 5, 'O': 14, 'X': 23,
  'G': 6, 'P': 15, 'Y': 24,
  'H': 7, 'Q': 16, 'Z': 25,
  'I': 8, 'R': 17, '2': 26,
};

/**
 * decode base32 string to Buffer
 *
 * @param {string} str input string
 *
 * @return {Buffer}
 */
function base32decode(str) {
  // ignore char not used in base32
  str = str.toUpperCase().replace(/[^A-Z234567]/g, '');
  // make length be a multiple of 8, padding 0 (='A')
  str = str.padEnd(Math.ceil(str.length / 8) * 8, 'A');

  // array of numbers in 0..31
  const data = Array.from(str).map((value) => base32table[value]);
  const buf = Buffer.alloc(data.length / 8 * 5);
  for (let i=0, j=0; i < data.length; i+=8, j+=5) {
    buf[j] = data[i+0] << 3 | data[i+1] >> 2;
    let tmp = 0;
    for (let shift=30, k=1; shift >= 0; shift-=5, k++) {
      tmp |= data[i+k] << shift;
    }
    buf.writeUInt32BE(tmp >>> 0, j + 1);
  }

  return buf;
}


const readline = require('readline');

rl = readline.createInterface(process.stdin, process.stdout);

rl.question('Input Secret Key: ', (answer) => {
  const key = base32decode(answer);
  rl.close();

  setInterval(()=>{
    const code = totp(key, new Date);
    const current = Math.floor((Date.now() / 1000) % TIME_STEP);
    const gauge = '='.repeat(current) + '-'.repeat(TIME_STEP - current);
    process.stdout.write(`\r${code} [${gauge}]`);
  }, 500);
});

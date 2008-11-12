/*
 * The JavaScript implementation of the Secure Hash Algorithm 1
 *
 *   Copyright (c) 2008  Takanori Ishikawa  <takanori.ishikawa@gmail.com>
 *   Modified, 2008, by Anant Narayanan <anant@kix.in>
 *
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions
 *   are met:
 * 
 *   1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *
 *   3. Neither the name of the authors nor the names of its contributors
 *      may be used to endorse or promote products derived from this
 *      software without specific prior written permission.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *   A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 *   OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 *   SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *   TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var SHA1 = function() {
  
  /* int32 -> hexdigits string (e.g. 0x123 -> '00000123') */
  function _strfhex32(i32) {
    i32 &= 0xffffffff;
    if (i32 < 0) {
      i32 += 0x100000000;
    }
    var hex = Number(i32).toString(16);
    if (hex.length < 8) {
      hex = "00000000".substr(0, 8 - hex.length) + hex;
    }
    return hex;
  }
 
  /* Returns Number(32bit unsigned integer) array size to fit for blocks (512-bit strings) */
  function _padding_size(nbits) {
    var n = nbits + 1 + 64;
    return 512 * Math.ceil(n / 512) / 32;
  }

  /* 8bit string -> uint32[] */
  function _word_array(m) {
    var nchar = m.length;
    var size = _padding_size(nchar * 8);
    var words = new Array(size);
    for (var i = 0, j = 0; i < nchar; ) {
      words[j++] = ((m.charCodeAt(i++) & 0xff) << 24) | 
                   ((m.charCodeAt(i++) & 0xff) << 16) | 
                   ((m.charCodeAt(i++) & 0xff) << 8)  | 
                   ((m.charCodeAt(i++) & 0xff));
    }
    while (j < size) {
      words[j++] = 0;
    }
    return words;
  }

  function _write_nbits(words, length, nbits) {
    if (nbits > 0xffffffff) {
      var lo = nbits & 0xffffffff;
      if (lo < 0) {
        lo += 0x100000000;
      }
      words[length - 1] = lo;
      words[length - 2] = (nbits - lo) / 0x100000000;
    } else {
      words[length - 1] = nbits;
      words[length - 2] = 0x0;
    }
    return words;
  }

  function _padding(words, nbits) {
    var i = Math.floor(nbits / 32);

    words[i] |= (1 << (((i + 1) * 32) - nbits - 1));
    _write_nbits(words, _padding_size(nbits), nbits);
    return words;
  }

  function _digest(words) {
    var i = 0, t = 0;
    var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

    while (i < words.length) {
      var W = new Array(80);

      /* (a) */
      for (t = 0;  t < 16; t++) {
        W[t] = words[i++];
      }

      /* (b) */
      for (t = 16; t < 80; t++) {
        var w = W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16];
        W[t] = (w << 1) | (w >>> 31);
      }

      /* (c) */
      var A = H[0], B = H[1], C = H[2], D = H[3], E = H[4];

      /* (d) TEMP = S5(A) + ft(B,C,D) + E + Wt + Kt;
         E = D; D = C; C = S30(B); B = A; A = TEMP; */
      for (t = 0; t < 80; t++) {
        var tmp = ((A << 5) | (A >>> 27)) + E + W[t];
        if (t >=  0 && t <= 19) {
          tmp += ((B & C) | ((~B) & D)) + 0x5a827999;
        } else if (t >= 20 && t <= 39) {
          tmp += (B ^ C ^ D) + 0x6ed9eba1;
        } else if (t >= 40 && t <= 59) {
          tmp += ((B & C) | (B & D) | (C & D)) + 0x8f1bbcdc;
        } else if (t >= 60 && t <= 79) {
          tmp += (B ^ C ^ D) + 0xca62c1d6;
        }

        E = D; D = C; C = ((B << 30) | (B >>> 2)); B = A; A = tmp;
      }

      /* (e) H0 = H0 + A, H1 = H1 + B, H2 = H2 + C, H3 = H3 + D, H4 = H4 + E. */
      H[0] = (H[0] + A) & 0xffffffff;
      H[1] = (H[1] + B) & 0xffffffff;
      H[2] = (H[2] + C) & 0xffffffff;
      H[3] = (H[3] + D) & 0xffffffff;
      H[4] = (H[4] + E) & 0xffffffff;
      if (H[0] < 0) {
        H[0] += 0x100000000;
      }
      if (H[1] < 0) {
        H[1] += 0x100000000;
      }
      if (H[2] < 0) {
        H[2] += 0x100000000;
      }
      if (H[3] < 0) {
        H[3] += 0x100000000;
      }
      if (H[4] < 0) {
        H[4] += 0x100000000;
      }
    }

    return H;
  }

 return {
   digest: function(msg) {
     var nbits = msg.length * 8;
     var words = _padding(_word_array(msg), nbits);
     var diges = _digest(words);
     for (var i = 0; i < diges.length; i++) {
       diges[i] = _strfhex32(diges[i]);
     }
     return diges.join("");
   }
 };
 
}();

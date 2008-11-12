// Cipher name, Base64 input, textarea input
var ciphers = [ ['RC4', true, false], ['RC4a',true, false],
                ['AESe',true, false], ['AESc',true, false],
                ['SRPe',true, false], ['SRPc',true, false],
                ['TFSe',true, false], ['TFSc',true, false],
                ['CSR', false,true ], ['SWP', true, false],
                ['RSA', true, true ] ];

var input = [true, null, 0, ''];
var fNames = [];
var fName;
var keys = [];
var savedKeys;

var cats;
var curCat = null;
var curAct = null;
var curTxt;
var tabAct = 'A';
var changed = false;

var curSpanObj = null;
var curSpanNr = null;
var fullScr = false;
var topEd = false;
var topX = [];
var topY = [];
var topS = [];
var topE = [];
var topFocus = null;
var empty='&lt;..empty..&gt;';

var stdOk = true;
var useJava = false;
var clrOnLoad = true;
var btnInDivOk;
var inpFileOk;

var cmds=[];
var cmdFail;
var cmdFStat = 'if (e) alert(e); cmds=[]; ';
var bData;
var sData;
var i;
var j;
var tot;
var prgr = null;
var key;
var lenInd = true;
var showKeys;

var xbmImg = "'#define fig_width 32\\n'\n"
 +"+'#define fig_height 37\\n'\n"
 +"+'static char fig_bits[] = {\\n'\n"
 +( '000000040000C10700F0E10700F9720600BFC00700FFD50700FF1F0700FF2F0700FEA30300FFA502'
   +'00FE070100FE930200FF470000FE430100FC2B0100FE430100FE270000FC0700007C1D0000E00E00'
   +'00800500000000000000020000000040000002400000022004000220280002309801000DE002A20A'
   +'200DE214400BF20A807E08050093FE0300BE930000C00F0000400300' )
    .replace(/../g,'0x$&, ').replace(/.{24}/g,"+'$&'\n")
 +"+' };'";

var b64Img1 = ''
 +'/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAQDAwQDAwQEBAQFBQQFBwsHBwYGBw4KCggLEA4R\n'
 +'ERAOEA8SFBoWEhMYEw8QFh8XGBsbHR0dERYgIh8cIhocHRz/2wBDAQUFBQcGBw0HBw0cEhAS\n'
 +'HBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBz/wAAR\n'
 +'CAA2ADcDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAAQFBgcIAwEC/8QAPxAAAQMB\n'
 +'BQMFCREAAAAAAAAABAADBQYBAhMUIwckMxESFTRUJTFDRFJTY4LRFiIyQlFhYnFzdIOSo7Gy\n'
 +'s/D/xAAZAQEAAwEBAAAAAAAAAAAAAAAEAAMFAQL/xAAoEQACAQIEAwkAAAAAAAAAAAAAAxMC\n'
 +'EgEFIiMEERUUITFBQkNSU4H/2gAMAwEAAhEDEQA/ANaMsrrhKOUvVHSW5mbvIDqUJspjCV7R\n'
 +'G0UMlsvEi4PjDGImas6zjKJjukpLNebwmlA6B2q+6qo5TGgCoiPH7T/auNaIVuFv4KQSLL73\n'
 +'B3dOq4vLpWQWRENYMYa3P4NvG53J6qFJJBnHdHd+a1CqiJKVtByLAc0U9JFC8dWh04F+hiLA\n'
 +'AlRSbMiU8GVu+Pqaysal9qrMCNgmC7wQ+sJWaRaKxDVF+7T3s4MLG9oSCOLwdoovZyAMv/vz\n'
 +'qkZevqujZHGysAQR1jVExcFPMPta2g1HMiWPRdL5izn6tsfwU2aXWWRGpRGcmNg+LpUmGnS5\n'
 +'R6FFemBRR5DwjTSyhXO3GoZKaKDDlMuPHv4bmEkN4qNd4Q2Q66wyhYId261M1P3x7ZQrHuWW\n'
 +'3bdb5EIfVcfrOREPl6XwZrR6wRicJL4gRnM751cftK5VFQIQZJT0PP8ASGvqJezIsxsdkzIs\n'
 +'U/MLFaxflqNHbHlkSamJoUx4rL5d9hv0WCrVZENZ1o3rHolVQm08IMbBZi8v+Ml7O3eLe0Xh\n'
 +'cv8AdlntbmXtrJLGuyjvLQerOp3pqVZeFlBx/Bu+CVLPUC+HmnnoArL8TLApezV1dTxPceAl\n'
 +'cv50nQ/moa7tQqDM4OaFHy7/ANqkJ6t610gtwi5cVNDyQj/RZVmOxy4aF9F7VaheMY7qfFtQ\n'
 +'txXa7cL6aef6I3DyfKmL5JXMcFF1/F7ttiUu0RURHWJ69e+py97EITVJX8cCwjVyEsc4jltv\n'
 +'rW+1O1OmuASQpAAjDRXlXr9vJ+yELwwhpWmKikJyncwXa3YV5dzvLL0/Tr7ckVh3mLNf6SEJ\n'
 +'jPAIoabkYTn73v2e95NqEIVYs//Z\n';

var b64Img2 = ''
 +'R0lGODlhAQADAJEAAAAA+PgAAPj4+HQAZSH5BAgAAAAALAAAAAABAAMAAAICjFAAIf4AOw==';

var exmpl = 'Main\x1B'
+'<H2>Encryption tool<\/H2>\n'
+'<P style="margin-bottom:0"><B>Features:<\/B><\/P>\n'
+'<UL style="margin-top:0; margin-left:0; padding-left:1em">\n'
+'<LI>Strong encrypting techniques: RC4, AES, Serpent, Twofish and RSA.<\/LI>\n'
+'<LI>Allows all HTML mark-up.<\/LI>\n'
+'<LI>Inclusion of binary data possible using (e.g.) Base64 encoding.<\/LI>\n'
+'<LI>Data saved in plain HTML file allowing e.g. synchronisation between PDA and desktop computer,\n'
+'e-mailing of file and publicising on web for world-wide access to your data.<\/LI>\n'
+'<LI>Open source, allowing personal enhancements.<\/LI>\n'
+'<\/UL>\n'
+'<DIV style="text-align:right; margin-top:2em">\n'
+'Michiel van Everdingen<BR>\n'
+'July 2005\n'
+'<\/DIV>'
+'\x1BExamples\x1B'
+'<H2>Examples:<\/H2><TABLE border=1>\n'
+'<TR><TD>Plain HTML<\/TD>\n'
+'<TD><B>bold<\/B>; <I>italic<\/I>; <A href="http://www.w3c.org">link<\/A><\/TD><\/TR>\n'
+'<TR><TD>Plain password<\/TD><TD>secret<\/TD><\/TR>\n'
+'<TR><TD>Hidden password<\/TD>\n'
+'<TD><SPAN style="color:black; background-color:black">secret<\/SPAN><\/TD><\/TR>\n'
+'<TR><TD><INPUT type="button" onclick="alert(\'secret\');" value="Show password"><\/TD>\n'
+'<TD>&nbsp;<\/TD><\/TR>\n'
+'<TR><TD>Colours<\/TD>\n'
+'<TD><SELECT onchange="document.bgColor=this.options[this.selectedIndex].value">\n'
+'<OPTION value="white">white<\/OPTION>\n'
+'<OPTION value="lightPink">lightPink<\/OPTION>\n'
+'<OPTION value="lightYellow">lightYellow<\/OPTION>\n'
+'<OPTION value="lightGreen">lightGreen<\/OPTION>\n'
+'<OPTION value="lightBlue">lightBlue<\/OPTION>\n'
+'<\/SELECT><\/TD><\/TR>\n'
+'<TR><TD>Figure; external, not encrypted<\/TD>\n'
+'<TD><A href="http://validator.w3.org/check?uri=referer">\n'
+'<IMG src="http://www.w3.org/Icons/valid-html401" alt="Valid HTML 4.01" height="31" width="88"><\/A>\n'
+'<\/TD><\/TR>\n'
+'<TR><TD>Figure; embedded, via data:-protocol<\/TD>\n'
+'<TD><IMG src="data:image/gif;base64,\n'+b64Img1+'" width=55 height=54 alt="windmill"><\/TD><\/TR>\n'
+'<TR><TD>Figure; embedded, via b64:-protocol emulation<\/TD>\n'
+'<TD><IMG src="b64:\n'+b64Img2+'" width=40 height=26 alt="dutchFlag"><\/TD><\/TR>\n'
+'<TR><TD>Figure; embedded, XBM format<\/TD>\n'
+'<TD><IMG src="javascript:'+xbmImg+'" alt="tulip" width=32 height=37><\/TD><\/TR>\n'
+'<\/TABLE>'
+'\x1BCopyright\x1B'
+'<P>\n'
+'JavaScript Encryption Program<BR>\n'
+'Copyright &copy; 2004 - 2005 Michiel van Everdingen\n'
+'<\/P><P>\n'
+'This program is free software; you can redistribute it and/or modify it under the terms of the\n'
+'<A href="http://www.gnu.org/copyleft/gpl.html">GNU General Public License<\/A> as published by the\n'
+'Free Software Foundation; either version 2 of the License, or (at your option) any later version.\n'
+'<\/P><P>\n'
+'This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even\n'
+'the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General\n'
+'Public License for more details.\n'
+'<\/P><P>\n'
+'You should have received a copy of the GNU General Public License along with this program; if not,\n'
+'write to the Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.\n'
+'<\/P><P>\n'
+'Michiel van Everdingen<BR>\n'
+'Meerstraat 36<BR>\n'
+'1411 BH Naarden<BR>\n'
+'The Netherlands<BR>\n'
+'Email: <A href="mailto:MAvanEverdingen@zonnet.nl">MAvanEverdingen@zonnet.nl<\/A>\n'
+'<\/P>';


// Math

var wMax = 0xFFFFFFFF;
function rotb(b,n){ return ( b<<n | b>>>( 8-n) ) & 0xFF; }
function rotw(w,n){ return ( w<<n | w>>>(32-n) ) & wMax; }
function getW(a,i){ return a[i]|a[i+1]<<8|a[i+2]<<16|a[i+3]<<24; }
function setW(a,i,w){ a.splice(i,4,w&0xFF,(w>>>8)&0xFF,(w>>>16)&0xFF,(w>>>24)&0xFF); }
function setWInv(a,i,w){ a.splice(i,4,(w>>>24)&0xFF,(w>>>16)&0xFF,(w>>>8)&0xFF,w&0xFF); }
function getB(x,n){ return (x>>>(n*8))&0xFF; }

function getNrBits(i){ var n=0; while (i>0){ n++; i>>>=1; } return n; }
function getMask(n){ return (1<<n)-1; }

var bMax=0xFFFF;
var bMaxBits=getNrBits(bMax);

function bGetNrBits(a){ return (a.length-1)*bMaxBits+getNrBits(a[a.length-1]); }

function bPlusIs( a, b, shift ){
  var i;
  if (!shift) shift=0;
  var n = Math.max(a.length, b.length+shift);
  var c = 0;
  for ( i=0; i<n; i++ ){
    c += (a[i]?a[i]:0) + (b[i-shift]?b[i-shift]:0);
    a[i] = c&bMax;
    c >>>= bMaxBits;
  }
  if (c) a[i]=c;
  return a;
}

function bMinIs(a,b){
  var n = Math.max(a.length, b.length);
  var c = 0;
  var i;
  for ( i=0; i<n; i++ ){
    c += (a[i]?a[i]:0) - (b[i]?b[i]:0);
    a[i] = c&bMax;
    c >>= bMaxBits;
  }
  if (c) a[i]=c;
  while (a[a.length-1]==0&&a.length>1) a.pop();
  return a;
}

function bShlIs(a,n){
  if (a==0) return;
  var c = 0;
  var i;
  while (n>=bMaxBits){ a.splice(0,0,0); n-=bMaxBits; }
  for ( i=0; i<a.length; i++ ){
    var t = a[i];
    a[i] = ( t<<n | c ) & bMax;
    c = t>>>(bMaxBits-n);
  }
  if (c) a[i]=c;
  return a;
}

function bShrIs(a,n){
  var c = 0;
  while (n>=bMaxBits){ a.splice(0,1); n-=bMaxBits; }
  for ( var i=a.length-1; i>=0; i-- ){
    var t = a[i];
    a[i] = t>>>n | c;
    c = (t<<(bMaxBits-n)) & bMax;
  }
  while (a[a.length-1]==0&&a.length>1) a.pop();
  return a;
}

function bCmp(a,b){
  var al=a.length;
  var bl=b.length;
  if ( al>bl ) return 1;
  if ( al<bl ) return -1;
  for ( var i=al-1; i>=0; i-- )
    if (a[i]>b[i]) return 1;
    else if (a[i]<b[i]) return -1;
  return 0;
}

function sbMul(i,a){
  var r=[0];
  var c = 0;
  var n = 0;
  while ( n<a.length ){
    c+=i*a[n];
    r[n++]=c&bMax;
    c >>>= bMaxBits;
  }
  if (c) r[n]=c;
  return r;
}

function bMul(a,b){
  var r=[0];
  for ( var n=0; n<b.length; n++ ) bPlusIs( r, sbMul( b[n], a ), n );
  return r;
}

function bDiv(a,b){
  var q=[0];
  var r=a.slice(0);
  var n=1+bGetNrBits(a)-bGetNrBits(b);
  if ( n<1 ) return [[0],a];
  bShlIs(b,n);
  for (var i=0;i<n;i++){
    bShrIs(b,1);
    bShlIs(q,1);
    if (bCmp(r,b)>=0){
      q[0]|=1;
      bMinIs(r,b);
    }
  }
  return [q,r];
}


var bSeeds = [(new Date()).getTime()&bMax, 1];
var bSeedsRIdx=0;
var bSeedsWIdx=1;

function bSetSeed(){
  bSeeds[bSeedsWIdx] = (bSeeds[bSeedsWIdx]<<8) | ((new Date()).getTime()&0xFF);
  if (bSeeds[bSeedsWIdx]>bMax){
    bSeeds[bSeedsWIdx] &= bMax;
    bSeeds[++bSeedsWIdx]=1;
  }
}

function bRnd(a, bits, ones){
  var n = Math.ceil(bits/bMaxBits);
  var hMask = bMax>>>(n*bMaxBits-bits);
  var i;

  for (i=0; i<n; i++){
    a[i]=(Math.floor((bMax+1)*Math.random())+bSeeds[bSeedsRIdx])&bMax;
    bSeedsRIdx = (bSeedsRIdx+1)%bSeeds.length;
  }
  a.length=i; a[--i] &= hMask;
  hMask = (hMask+1)>>>1;
  while (ones && ones-->0){ a[i]|=hMask; hMask>>>=1; if (hMask==0){ hMask=(bMax+1)>>>1; i--; } }
  while (a[a.length-1]==0&&a.length>1) a.pop();
}

function bFromBytes(a){
  var k=a.length;
  var r=[0];
  while (k>0){ bShlIs(r,8); r[0]|=a[--k]; }
  return r;
}

function bToBytes(a){
  var b=a.slice(0);
  var r=[];
  while (b.length>1||b[0]!=0){ r[r.length]=b[0]&0xFF; bShrIs(b,8); }
  return r;
}

function bFromJBI(jbi){
  var s = jbi.toString(8);
  var r = [0];
  for (var i=0; i<s.length(); i++){ bShlIs(r,3); r[0]+=s.charAt(i)-48; }
  return r;
}

function bToJBI(b){
  var s = '';
  do{
    s = (b[0]&7)+s;
    bShrIs( b, 3 );
  }while (b.length>1||b[0]>0);
  return new java.math.BigInteger(s,8);
}


// Ciphers

function getCipher(name){
  var i=0;
  while(ciphers[i][0]!=name) i++;
  return ciphers[i];
}

function insLen(len, bits){
  var n=(bits+7)>>>3;
  while (bits<n*8){ len=((len&0xFF)<<bits)|len; bits*=2; }
  while (n-->0) bData.unshift( (len>>>(n*8))&0xFF );
}

function getLen(bits){
  var n = (bits+7)>>>3;
  var r=0;
  for (var i=0; i<n; i++) r += bData.shift()<<(i*8);
  return r&getMask(bits);
}

function unExpChar(c){
  return "unexpected character '"+String.fromCharCode(c)+"' (code 0x"+c.toString(16)+").";
}


// UTF-8

var utf8sets = [0x800,0x10000,0x110000];

function utf8Encrypt(){
  if (i==0) { prgr='UTF-8'; bData=[]; tot=sData.length; j=0; }
  var z = Math.min(i+100,tot);
  while (i<z) {
    var c = sData.charCodeAt(i++);
    if (c<0x80){ bData[j++]=c; continue; }
    var k=0; while(k<utf8sets.length && c>=utf8sets[k]) k++;
    if (k>=utf8sets.length) throw( "UTF-8: "+unExpChar(c) );
    for (var n=j+k+1;n>j;n--){ bData[n]=0x80|(c&0x3F); c>>>=6; }
    bData[j]=c+((0xFF<<(6-k))&0xFF);
    j += k+2;
  }
}

function utf8Decrypt(){
  if (i==0){ prgr='UTF-8'; sData=""; tot=bData.length; }
  var z=Math.min(i+100,tot);
  while (i<z){
    var c = bData[i++];
    var e = '0x'+c.toString(16);
    var k=0; while(c&0x80){ c=(c<<1)&0xFF; k++; }
    c >>= k;
    if (k==1||k>4) throw('UTF-8: invalid first byte '+e+'.');
    for (var n=1;n<k;n++){
      var d = bData[i++];
      e+=',0x'+d.toString(16);
      if (d<0x80||d>0xBF) break;
      c=(c<<6)+(d&0x3F);
    }
    if ( (k==2&&c<0x80) || (k>2&&c<utf8sets[k-3]) ) throw("UTF-8: invalid sequence "+e+'.');
    sData+=String.fromCharCode(c);
  }
}


// JavaScript String

function jStrDecrypt(){
  if (i==0){ prgr='Object'; sData="\n'"; tot=bData.length; }
  var z=Math.min(i+50,tot);
  while (i<z){
    var b = bData[i++];
    if ( b<16 ) sData += '\\x0'+b.toString(16);
    else if ( b<32||b==34||(b>36&&b<40)||b==60||b==92||(b>126&&b<161) ) sData += '\\x'+b.toString(16);
    else sData += String.fromCharCode(b);
  }
  sData += (z<tot?"'\n+'":"'");
}


// Base64

function b64Encrypt(){
  if (i==0) { prgr='Base64'; sData=""; tot=bData.length; }
  var z=Math.min(i+100,tot);
  while (i<z){
    var x = [ bData[i]>>2, (bData[i]&3)<<4, 64, 64 ];
    if (++i<bData.length){x[1]+=(bData[i]&240)>>4;x[2]=(bData[i]&15)<<2;}
    if (++i<bData.length){x[2]+=(bData[i]&192)>>6;x[3]=bData[i]&63;}
    for ( j in x ){
      var y=x[j];
      sData += String.fromCharCode(y<26?65+y:y<52?71+y:y<62?y-4:y<63?43:y<64?47:61);
    }
    i++;
  }
}

function b64Decrypt(){
  var x = new Array(4);
  var z = i+100;
  if (i==0){ prgr='Base64'; j=0; tot=sData.length; bData=[]; }
  while(i<z){
    for (var k=0;k<4;k++){
      var c=0; while (c<33&&i<tot){ c=sData.charCodeAt(i++); }
      if (c<33){
        if (k!=0) throw( "Base64: unexpected #chars." );
        return;
      }
      x[k] = c==43?62:c==47?63:c==61?64:c>47&&c<58?c+4:c>64&&c<91?c-65:c>96&&c<123?c-71:-1;
      if (x[k]<0||(x[k]==64&&k<2)) throw( "Base64: "+unExpChar(c)
        +"\nAllowed characters:\n['A'-'Z'], ['a'-'z'], ['0'-'9'], '+', '-' and '='."  );
    }
    bData[j++] = (x[0]<<2)+(x[1]>>4);
    if (x[2]<64) bData[j++] = ((x[1]&15)<<4)+(x[2]>>2);
    if (x[3]<64) bData[j++] = ((x[2]&3)<<6)+x[3];
  }
}

function setKey(p, b64){
  var tmp = bData;
  if (b64){
    sData=p.replace(/\s/g,'');
    if (sData.length%4==1) sData+='A';
    while (sData.length%4) sData+='=';
  }
  else sData=p;
  i=tot=0;
  do{ if (b64) b64Decrypt(); else utf8Encrypt(); } while (i<tot);
  key = bData;
  bData = tmp;
}

function bytesToB64(b){
  bData=b;
  i=tot=0;
  do{ b64Encrypt(); } while (i<tot);
  return sData.replace(/(.{40})/g,'$1\n');
}


// Caesar

function csrEncrypt(){
  if (i==0) {
    prgr='Caesar';
    if (key.length<1) return;
    tot=bData.length;
  }
  var z = Math.min(i+100,tot);
  while (i<z) { bData[i]=(bData[i]+key[i%key.length])%256; i++; }
}

function csrDecrypt(){
  if (i==0) {
    prgr='Caesar';
    if (key.length<1) return;
    tot=bData.length;
  }
  var z = Math.min(i+100,tot);
  while (i<z) { bData[i]=(256+bData[i]-key[i%key.length])%256; i++; }
}


// Swap

function swpEncrypt(){
  if (i==0) {
    prgr='Swap';
    tot=2*bData.length-1;
    if (tot<0) return;
    i=1; j=0;
  }
  var z = Math.min(i+100,tot);
  while (i<z){
    if (i>0 && i<bData.length-1){
      var s = i+bData[i-1]%(bData.length-i);
      var t=bData[i]; bData[i]=bData[s]; bData[s]=t;
    }
    else if (key.length<1) i=tot;
    else{
      var k = i+1-bData.length;
      j = (j<<8|key[k%key.length]) % 7741441;
      bData[k]=(bData[k]+j)&0xFF;
    }
    i++;
  }
}

function swpDecrypt(){
  if (i==0) {
    prgr='Swap';
    if (key.length<1) i=bData.length;
    tot=2*bData.length-1;
    j=0;
  }
  var z = Math.min(i+100,tot);
  while (i<z){
    if (i<bData.length){
      j = (j<<8|key[i%key.length]) % 7741441;
      bData[i]=(0x1000+bData[i]-j)&0xFF;
    }
    else if (i<2*bData.length-2){
      var k = 2*bData.length-i-2;
      var s = k+bData[k-1]%(bData.length-k);
      var t=bData[k]; bData[k]=bData[s]; bData[s]=t;
    }
    i++;
  }
}


// RC4

var rc4State = new Array(256);
var rc4x;
var rc4y;

function rc4Init(){
  var k = 0;
  for (j=0; j<256; j++) rc4State[j] = j;
  for (j=0; j<256; j++){
    k = (k+rc4State[j]+key[j%key.length]) % 256;
    var t = rc4State[j]; rc4State[j]=rc4State[k]; rc4State[k]=t;
  }
  rc4x = 0;
  rc4y = 0;
}

function rc4GetPsRnd(){
  rc4x = (rc4x + 1) % 256;
  rc4y = (rc4y + rc4State[rc4x]) % 256;
  var t=rc4State[rc4x]; rc4State[rc4x]=rc4State[rc4y]; rc4State[rc4y]=t;
  return rc4State[ (rc4State[rc4x]+rc4State[rc4y])%256 ];
}

function rc4Encrypt(){
  if (tot==0){
    prgr = 'RC4';
    if (key.length<1) return;
    rc4Init();
    tot = bData.length;
  } else {
    var z = Math.min(i+100,tot);
    while(i<z) bData[i++] ^= rc4GetPsRnd();
  }
}

function rc4Decrypt() { rc4Encrypt(); }


function rc4aEncrypt(){
  if (tot==0){
    prgr = 'RC4a';
    if (key.length<1) return;
    j = (new Date()).getTime();
    while (i<4){ key.unshift(j&0xFF); bData.unshift(j&0xFF); j>>>=8; i++; }
    rc4Init();
    for (j=0;j<256;j++) rc4GetPsRnd();
    tot = bData.length;
  }
  else rc4Encrypt();
}

function rc4aDecrypt() {
  if (tot==0){
    prgr = 'RC4a';
    if (key.length<1) return;
    key = bData.splice(0,4).concat(key);
    rc4Init();
    for (j=0;j<256;j++) rc4GetPsRnd();
    tot = bData.length;
  }
  else rc4Encrypt();
}


// AES

var aesNk;
var aesNr;

var aesPows;
var aesLogs;
var aesSBox;
var aesSBoxInv;
var aesRco;
var aesFtable;
var aesRtable;
var aesFi;
var aesRi;
var aesFkey;
var aesRkey;

function aesMult(x, y){ return (x&&y) ? aesPows[(aesLogs[x]+aesLogs[y])%255]:0; }

function aesPackBlock() {
  return [ getW(bData,i), getW(bData,i+4), getW(bData,i+8), getW(bData,i+12) ];
}

function aesUnpackBlock(packed){
  for ( var j=0; j<4; j++,i+=4) setW( bData, i, packed[j] );
}

function aesXTime(p){
  p <<= 1;
  return p&0x100 ? p^0x11B : p;
}

function aesSubByte(w){
  return aesSBox[getB(w,0)] | aesSBox[getB(w,1)]<<8 | aesSBox[getB(w,2)]<<16 | aesSBox[getB(w,3)]<<24;
}

function aesProduct(w1,w2){
  return aesMult(getB(w1,0),getB(w2,0)) ^ aesMult(getB(w1,1),getB(w2,1))
       ^ aesMult(getB(w1,2),getB(w2,2)) ^ aesMult(getB(w1,3),getB(w2,3));
}

function aesInvMixCol(x){
  return aesProduct(0x090d0b0e,x)     | aesProduct(0x0d0b0e09,x)<<8 |
         aesProduct(0x0b0e090d,x)<<16 | aesProduct(0x0e090d0b,x)<<24;
}

function aesByteSub(x){
  var y=aesPows[255-aesLogs[x]];
  x=y;  x=rotb(x,1);
  y^=x; x=rotb(x,1);
  y^=x; x=rotb(x,1);
  y^=x; x=rotb(x,1);
  return x^y^0x63;
}

function aesGenTables(){
  var i,y;
  aesPows = [ 1,3 ];
  aesLogs = [ 0,0,null,1 ];
  aesSBox = new Array(256);
  aesSBoxInv = new Array(256);
  aesFtable = new Array(256);
  aesRtable = new Array(256);
  aesRco = new Array(30);

  for ( i=2; i<256; i++){
    aesPows[i]=aesPows[i-1]^aesXTime( aesPows[i-1] );
    aesLogs[aesPows[i]]=i;
  }

  aesSBox[0]=0x63;
  aesSBoxInv[0x63]=0;
  for ( i=1; i<256; i++){
    y=aesByteSub(i);
    aesSBox[i]=y; aesSBoxInv[y]=i;
  }

  for (i=0,y=1; i<30; i++){ aesRco[i]=y; y=aesXTime(y); }

  for ( i=0; i<256; i++){
    y = aesSBox[i];
    aesFtable[i] = aesXTime(y) | y<<8 | y<<16 | (y^aesXTime(y))<<24;
    y = aesSBoxInv[i];
    aesRtable[i]= aesMult(14,y) | aesMult(9,y)<<8 |
                  aesMult(13,y)<<16 | aesMult(11,y)<<24;
  }
}

var bDataSave;

function aesInit(){
  key=key.slice(0,32);
  var i,k,m;
  var j = 0;
  var l = key.length;

  while ( l!=16 && l!=24 && l!=32 ) key[l++]=key[j++];
  aesGenTables();

  aesNk = key.length >>> 2;
  aesNr = 6 + aesNk;

  var N=4*(aesNr+1);

  aesFi = new Array(12);
  aesRi = new Array(12);
  aesFkey = new Array(N);
  aesRkey = new Array(N);

  for (m=j=0;j<4;j++,m+=3){
    aesFi[m]=(j+1)%4;
    aesFi[m+1]=(j+2)%4;
    aesFi[m+2]=(j+3)%4;
    aesRi[m]=(4+j-1)%4;
    aesRi[m+1]=(4+j-2)%4;
    aesRi[m+2]=(4+j-3)%4;
  }

  for (i=j=0;i<aesNk;i++,j+=4) aesFkey[i]=getW(key,j);

  for (k=0,j=aesNk;j<N;j+=aesNk,k++){
    aesFkey[j]=aesFkey[j-aesNk]^aesSubByte(rotw(aesFkey[j-1], 24))^aesRco[k];
    if (aesNk<=6)
      for (i=1;i<aesNk && (i+j)<N;i++) aesFkey[i+j]=aesFkey[i+j-aesNk]^aesFkey[i+j-1];
    else{
      for (i=1;i<4 &&(i+j)<N;i++) aesFkey[i+j]=aesFkey[i+j-aesNk]^aesFkey[i+j-1];
      if ((j+4)<N) aesFkey[j+4]=aesFkey[j+4-aesNk]^aesSubByte(aesFkey[j+3]);
      for (i=5;i<aesNk && (i+j)<N;i++) aesFkey[i+j]=aesFkey[i+j-aesNk]^aesFkey[i+j-1];
    }
  }

  for (j=0;j<4;j++) aesRkey[j+N-4]=aesFkey[j];
  for (i=4;i<N-4;i+=4){
    k=N-4-i;
    for (j=0;j<4;j++) aesRkey[k+j]=aesInvMixCol(aesFkey[i+j]);
  }
  for (j=N-4;j<N;j++) aesRkey[j-N+4]=aesFkey[j];
}

function aesClose(){
  aesPows=aesLogs=aesSBox=aesSBoxInv=aesRco=null;
  aesFtable=aesRtable=aesFi=aesRi=aesFkey=aesRkey=null;
}

function aesRounds( block, key, table, inc, box ){
  var tmp = new Array( 4 );
  var i,j,m,r;

  for ( r=0; r<4; r++ ) block[r]^=key[r];
  for ( i=1; i<aesNr; i++ ){
    for (j=m=0;j<4;j++,m+=3){
      tmp[j]=key[r++]^table[block[j]&0xFF]^
             rotw(table[(block[inc[m]]>>>8)&0xFF], 8)^
             rotw(table[(block[inc[m+1]]>>>16)&0xFF], 16)^
             rotw(table[(block[inc[m+2]]>>>24)&0xFF], 24);
    }
    var t=block; block=tmp; tmp=t;
  }

  for (j=m=0;j<4;j++,m+=3)
    tmp[j]=key[r++]^box[block[j]&0xFF]^
           rotw(box[(block[inc[m  ]]>>> 8)&0xFF], 8)^
           rotw(box[(block[inc[m+1]]>>>16)&0xFF],16)^
           rotw(box[(block[inc[m+2]]>>>24)&0xFF],24);
  return tmp;
}

function aesEncrypt(){
  aesUnpackBlock( aesRounds(aesPackBlock(), aesFkey, aesFtable, aesFi, aesSBox ) );
}

function aesDecrypt(){
  aesUnpackBlock( aesRounds(aesPackBlock(), aesRkey, aesRtable, aesRi, aesSBoxInv ) );
}


// Serpent

var srpKey=[];

function srpK(r,a,b,c,d,i){
  r[a]^=srpKey[4*i]; r[b]^=srpKey[4*i+1]; r[c]^=srpKey[4*i+2]; r[d]^=srpKey[4*i+3];
}

function srpLK(r,a,b,c,d,e,i){
  r[a]=rotw(r[a],13);r[c]=rotw(r[c],3);r[b]^=r[a];r[e]=(r[a]<<3)&wMax;
  r[d]^=r[c];r[b]^=r[c];r[b]=rotw(r[b],1);r[d]^=r[e];r[d]=rotw(r[d],7);r[e]=r[b];
  r[a]^=r[b];r[e]=(r[e]<<7)&wMax;r[c]^=r[d];r[a]^=r[d];r[c]^=r[e];r[d]^=srpKey[4*i+3];
  r[b]^=srpKey[4*i+1];r[a]=rotw(r[a],5);r[c]=rotw(r[c],22);r[a]^=srpKey[4*i+0];r[c]^=srpKey[4*i+2];
}

function srpKL(r,a,b,c,d,e,i){
  r[a]^=srpKey[4*i+0];r[b]^=srpKey[4*i+1];r[c]^=srpKey[4*i+2];r[d]^=srpKey[4*i+3];
  r[a]=rotw(r[a],27);r[c]=rotw(r[c],10);r[e]=r[b];r[c]^=r[d];r[a]^=r[d];r[e]=(r[e]<<7)&wMax;
  r[a]^=r[b];r[b]=rotw(r[b],31);r[c]^=r[e];r[d]=rotw(r[d],25);r[e]=(r[a]<<3)&wMax;
  r[b]^=r[a];r[d]^=r[e];r[a]=rotw(r[a],19);r[b]^=r[c];r[d]^=r[c];r[c]=rotw(r[c],29);
}

var srpS=[
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x3];r[x3]|=r[x0];r[x0]^=r[x4];r[x4]^=r[x2];r[x4]=~r[x4];r[x3]^=r[x1];
  r[x1]&=r[x0];r[x1]^=r[x4];r[x2]^=r[x0];r[x0]^=r[x3];r[x4]|=r[x0];r[x0]^=r[x2];
  r[x2]&=r[x1];r[x3]^=r[x2];r[x1]=~r[x1];r[x2]^=r[x4];r[x1]^=r[x2];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x1];r[x1]^=r[x0];r[x0]^=r[x3];r[x3]=~r[x3];r[x4]&=r[x1];r[x0]|=r[x1];
  r[x3]^=r[x2];r[x0]^=r[x3];r[x1]^=r[x3];r[x3]^=r[x4];r[x1]|=r[x4];r[x4]^=r[x2];
  r[x2]&=r[x0];r[x2]^=r[x1];r[x1]|=r[x0];r[x0]=~r[x0];r[x0]^=r[x2];r[x4]^=r[x1];
},
function(r,x0,x1,x2,x3,x4){
  r[x3]=~r[x3];r[x1]^=r[x0];r[x4]=r[x0];r[x0]&=r[x2];r[x0]^=r[x3];r[x3]|=r[x4];
  r[x2]^=r[x1];r[x3]^=r[x1];r[x1]&=r[x0];r[x0]^=r[x2];r[x2]&=r[x3];r[x3]|=r[x1];
  r[x0]=~r[x0];r[x3]^=r[x0];r[x4]^=r[x0];r[x0]^=r[x2];r[x1]|=r[x2];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x1];r[x1]^=r[x3];r[x3]|=r[x0];r[x4]&=r[x0];r[x0]^=r[x2];r[x2]^=r[x1];r[x1]&=r[x3];
  r[x2]^=r[x3];r[x0]|=r[x4];r[x4]^=r[x3];r[x1]^=r[x0];r[x0]&=r[x3];r[x3]&=r[x4];
  r[x3]^=r[x2];r[x4]|=r[x1];r[x2]&=r[x1];r[x4]^=r[x3];r[x0]^=r[x3];r[x3]^=r[x2];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x3];r[x3]&=r[x0];r[x0]^=r[x4];r[x3]^=r[x2];r[x2]|=r[x4];r[x0]^=r[x1];
  r[x4]^=r[x3];r[x2]|=r[x0];r[x2]^=r[x1];r[x1]&=r[x0];r[x1]^=r[x4];r[x4]&=r[x2];
  r[x2]^=r[x3];r[x4]^=r[x0];r[x3]|=r[x1];r[x1]=~r[x1];r[x3]^=r[x0];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x1];r[x1]|=r[x0];r[x2]^=r[x1];r[x3]=~r[x3];r[x4]^=r[x0];r[x0]^=r[x2];
  r[x1]&=r[x4];r[x4]|=r[x3];r[x4]^=r[x0];r[x0]&=r[x3];r[x1]^=r[x3];r[x3]^=r[x2];
  r[x0]^=r[x1];r[x2]&=r[x4];r[x1]^=r[x2];r[x2]&=r[x0];r[x3]^=r[x2];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x1];r[x3]^=r[x0];r[x1]^=r[x2];r[x2]^=r[x0];r[x0]&=r[x3];r[x1]|=r[x3];
  r[x4]=~r[x4];r[x0]^=r[x1];r[x1]^=r[x2];r[x3]^=r[x4];r[x4]^=r[x0];r[x2]&=r[x0];
  r[x4]^=r[x1];r[x2]^=r[x3];r[x3]&=r[x1];r[x3]^=r[x0];r[x1]^=r[x2];
},
function(r,x0,x1,x2,x3,x4){
  r[x1]=~r[x1];r[x4]=r[x1];r[x0]=~r[x0];r[x1]&=r[x2];r[x1]^=r[x3];r[x3]|=r[x4];r[x4]^=r[x2];
  r[x2]^=r[x3];r[x3]^=r[x0];r[x0]|=r[x1];r[x2]&=r[x0];r[x0]^=r[x4];r[x4]^=r[x3];
  r[x3]&=r[x0];r[x4]^=r[x1];r[x2]^=r[x4];r[x3]^=r[x1];r[x4]|=r[x0];r[x4]^=r[x1];
}];

var srpSI=[
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x3];r[x1]^=r[x0];r[x3]|=r[x1];r[x4]^=r[x1];r[x0]=~r[x0];r[x2]^=r[x3];
  r[x3]^=r[x0];r[x0]&=r[x1];r[x0]^=r[x2];r[x2]&=r[x3];r[x3]^=r[x4];r[x2]^=r[x3];
  r[x1]^=r[x3];r[x3]&=r[x0];r[x1]^=r[x0];r[x0]^=r[x2];r[x4]^=r[x3];
},
function(r,x0,x1,x2,x3,x4){
  r[x1]^=r[x3];r[x4]=r[x0];r[x0]^=r[x2];r[x2]=~r[x2];r[x4]|=r[x1];r[x4]^=r[x3];
  r[x3]&=r[x1];r[x1]^=r[x2];r[x2]&=r[x4];r[x4]^=r[x1];r[x1]|=r[x3];r[x3]^=r[x0];
  r[x2]^=r[x0];r[x0]|=r[x4];r[x2]^=r[x4];r[x1]^=r[x0];r[x4]^=r[x1];
},
function(r,x0,x1,x2,x3,x4){
  r[x2]^=r[x1];r[x4]=r[x3];r[x3]=~r[x3];r[x3]|=r[x2];r[x2]^=r[x4];r[x4]^=r[x0];
  r[x3]^=r[x1];r[x1]|=r[x2];r[x2]^=r[x0];r[x1]^=r[x4];r[x4]|=r[x3];r[x2]^=r[x3];
  r[x4]^=r[x2];r[x2]&=r[x1];r[x2]^=r[x3];r[x3]^=r[x4];r[x4]^=r[x0];
},
function(r,x0,x1,x2,x3,x4){
  r[x2]^=r[x1];r[x4]=r[x1];r[x1]&=r[x2];r[x1]^=r[x0];r[x0]|=r[x4];r[x4]^=r[x3];
  r[x0]^=r[x3];r[x3]|=r[x1];r[x1]^=r[x2];r[x1]^=r[x3];r[x0]^=r[x2];r[x2]^=r[x3];
  r[x3]&=r[x1];r[x1]^=r[x0];r[x0]&=r[x2];r[x4]^=r[x3];r[x3]^=r[x0];r[x0]^=r[x1];
},
function(r,x0,x1,x2,x3,x4){
  r[x2]^=r[x3];r[x4]=r[x0];r[x0]&=r[x1];r[x0]^=r[x2];r[x2]|=r[x3];r[x4]=~r[x4];
  r[x1]^=r[x0];r[x0]^=r[x2];r[x2]&=r[x4];r[x2]^=r[x0];r[x0]|=r[x4];r[x0]^=r[x3];
  r[x3]&=r[x2];r[x4]^=r[x3];r[x3]^=r[x1];r[x1]&=r[x0];r[x4]^=r[x1];r[x0]^=r[x3];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x1];r[x1]|=r[x2];r[x2]^=r[x4];r[x1]^=r[x3];r[x3]&=r[x4];r[x2]^=r[x3];r[x3]|=r[x0];
  r[x0]=~r[x0];r[x3]^=r[x2];r[x2]|=r[x0];r[x4]^=r[x1];r[x2]^=r[x4];r[x4]&=r[x0];r[x0]^=r[x1];
  r[x1]^=r[x3];r[x0]&=r[x2];r[x2]^=r[x3];r[x0]^=r[x2];r[x2]^=r[x4];r[x4]^=r[x3];
},
function(r,x0,x1,x2,x3,x4){
  r[x0]^=r[x2];r[x4]=r[x0];r[x0]&=r[x3];r[x2]^=r[x3];r[x0]^=r[x2];r[x3]^=r[x1];
  r[x2]|=r[x4];r[x2]^=r[x3];r[x3]&=r[x0];r[x0]=~r[x0];r[x3]^=r[x1];r[x1]&=r[x2];
  r[x4]^=r[x0];r[x3]^=r[x4];r[x4]^=r[x2];r[x0]^=r[x1];r[x2]^=r[x0];
},
function(r,x0,x1,x2,x3,x4){
  r[x4]=r[x3];r[x3]&=r[x0];r[x0]^=r[x2];r[x2]|=r[x4];r[x4]^=r[x1];r[x0]=~r[x0];r[x1]|=r[x3];
  r[x4]^=r[x0];r[x0]&=r[x2];r[x0]^=r[x1];r[x1]&=r[x2];r[x3]^=r[x2];r[x4]^=r[x3];
  r[x2]&=r[x3];r[x3]|=r[x0];r[x1]^=r[x4];r[x3]^=r[x4];r[x4]&=r[x0];r[x4]^=r[x2];
}];

var srpKc=[7788,63716,84032,7891,78949,25146,28835,67288,84032,40055,7361,1940,77639,27525,24193,75702,
  7361,35413,83150,82383,58619,48468,18242,66861,83150,69667,7788,31552,40054,23222,52496,57565,7788,63716];
var srpEc=[44255,61867,45034,52496,73087,56255,43827,41448,18242,1939,18581,56255,64584,31097,26469,
  77728,77639,4216,64585,31097,66861,78949,58006,59943,49676,78950,5512,78949,27525,52496,18670,76143];
var srpDc=[44255,60896,28835,1837,1057,4216,18242,77301,47399,53992,1939,1940,66420,39172,78950,
  45917,82383,7450,67288,26469,83149,57565,66419,47400,58006,44254,18581,18228,33048,45034,66508,7449];

function srpInit()
{
  var i,j,m,n;
  function keyIt(a,b,c,d,i){ srpKey[i]=r[b]=rotw(srpKey[a]^r[b]^r[c]^r[d]^0x9e3779b9^i,11); }
  function keyLoad(a,b,c,d,i){ r[a]=srpKey[i]; r[b]=srpKey[i+1]; r[c]=srpKey[i+2]; r[d]=srpKey[i+3]; }
  function keyStore(a,b,c,d,i){ srpKey[i]=r[a]; srpKey[i+1]=r[b]; srpKey[i+2]=r[c]; srpKey[i+3]=r[d]; }

  key.reverse();
  key[key.length]=1; while (key.length<32) key[key.length]=0;
  for (i=0; i<8; i++){
    srpKey[i] = (key[4*i+0] & 0xff)       | (key[4*i+1] & 0xff) <<  8 |
    (key[4*i+2] & 0xff) << 16 | (key[4*i+3] & 0xff) << 24;
  }

  var r = [srpKey[3],srpKey[4],srpKey[5],srpKey[6],srpKey[7]];

  i=0; j=0;
  while (keyIt(j++,0,4,2,i++),keyIt(j++,1,0,3,i++),i<132){
    keyIt(j++,2,1,4,i++); if (i==8){j=0;}
    keyIt(j++,3,2,0,i++); keyIt(j++,4,3,1,i++);
  }

  i=128; j=3; n=0;
  while(m=srpKc[n++],srpS[j++%8](r,m%5,m%7,m%11,m%13,m%17),m=srpKc[n],keyStore(m%5,m%7,m%11,m%13,i),i>0){
    i-=4; keyLoad(m%5,m%7,m%11,m%13,i);
  }
}

function srpClose(){
  srpKey=[];
}

function srpEncrypt()
{
  var blk = bData.slice(i,i+16); blk.reverse();
  var r=[getW(blk,0),getW(blk,4),getW(blk,8),getW(blk,12)];

  srpK(r,0,1,2,3,0);
  var n=0, m=srpEc[n];
  while (srpS[n%8](r,m%5,m%7,m%11,m%13,m%17),n<31){ m=srpEc[++n]; srpLK(r,m%5,m%7,m%11,m%13,m%17,n); }
  srpK(r,0,1,2,3,32);

  for (var j=3; j>=0; j--,i+=4) setWInv(bData,i,r[j]);
}

function srpDecrypt()
{
  var blk = bData.slice(i,i+16); blk.reverse();
  var r=[getW(blk,0),getW(blk,4),getW(blk,8),getW(blk,12)];

  srpK(r,0,1,2,3,32);
  var n=0, m=srpDc[n];
  while (srpSI[7-n%8](r,m%5,m%7,m%11,m%13,m%17),n<31){ m=srpDc[++n]; srpKL(r,m%5,m%7,m%11,m%13,m%17,32-n); }
  srpK(r,2,3,1,4,0);

  setWInv(bData,i,r[4]); setWInv(bData,i+4,r[1]); setWInv(bData,i+8,r[3]); setWInv(bData,i+12,r[2]);
  i+=16;
}


// Twofish

var tfsKey=[];
var tfsM=[[],[],[],[]];

function tfsInit()
{
  var  i, a, b, c, d, meKey=[], moKey=[], inKey=[];
  var kLen;
  var sKey=[];
  var  f01, f5b, fef;

  var q0=[[8,1,7,13,6,15,3,2,0,11,5,9,14,12,10,4],[2,8,11,13,15,7,6,14,3,1,9,4,0,10,12,5]];
  var q1=[[14,12,11,8,1,2,3,5,15,4,10,6,7,0,9,13],[1,14,2,11,4,12,3,7,6,13,10,5,15,9,0,8]];
  var q2=[[11,10,5,14,6,13,9,0,12,8,15,3,2,4,7,1],[4,12,7,5,1,6,9,10,0,14,13,8,2,11,3,15]];
  var q3=[[13,7,15,4,1,2,6,14,9,11,3,0,8,5,12,10],[11,9,5,1,12,3,13,14,6,4,7,15,2,0,8,10]];
  var ror4=[0,8,1,9,2,10,3,11,4,12,5,13,6,14,7,15];
  var ashx=[0,9,2,11,4,13,6,15,8,1,10,3,12,5,14,7];
  var q=[[],[]];
  var m=[[],[],[],[]];

  function ffm5b(x){ return x^(x>>2)^[0,90,180,238][x&3]; }
  function ffmEf(x){ return x^(x>>1)^(x>>2)^[0,238,180,90][x&3]; }

  function mdsRem(p,q){
    var i,t,u;
    for(i=0; i<8; i++){
      t = q>>>24;
      q = ((q<<8)&wMax) | p>>>24;
      p = (p<<8)&wMax;
      u = t<<1; if (t&128){ u^=333; }
      q ^= t^(u<<16);
      u ^= t>>>1; if (t&1){ u^=166; }
      q ^= u<<24 | u<<8;
    }
    return q;
  }

  function qp(n,x){
    var a,b,c,d;
    a=x>>4; b=x&15;
    c=q0[n][a^b]; d=q1[n][ror4[b]^ashx[a]];
    return q3[n][ror4[d]^ashx[c]]<<4 | q2[n][c^d];
  }

  function hFun(x,key){
    var a=getB(x,0), b=getB(x,1), c=getB(x,2), d=getB(x,3);
    switch(kLen){
    case 4:
      a = q[1][a]^getB(key[3],0);
      b = q[0][b]^getB(key[3],1);
      c = q[0][c]^getB(key[3],2);
      d = q[1][d]^getB(key[3],3);
    case 3:
      a = q[1][a]^getB(key[2],0);
      b = q[1][b]^getB(key[2],1);
      c = q[0][c]^getB(key[2],2);
      d = q[0][d]^getB(key[2],3);
    case 2:
      a = q[0][q[0][a]^getB(key[1],0)]^getB(key[0],0);
      b = q[0][q[1][b]^getB(key[1],1)]^getB(key[0],1);
      c = q[1][q[0][c]^getB(key[1],2)]^getB(key[0],2);
      d = q[1][q[1][d]^getB(key[1],3)]^getB(key[0],3);
    }
    return m[0][a]^m[1][b]^m[2][c]^m[3][d];
  }

  key=key.slice(0,32); i=key.length;
  while ( i!=16 && i!=24 && i!=32 ) key[i++]=0;

  for (i=0; i<key.length; i+=4){ inKey[i>>2]=getW(key,i); }
  for (i=0; i<256; i++){ q[0][i]=qp(0,i); q[1][i]=qp(1,i); }
  for (i=0; i<256; i++){
    f01 = q[1][i]; f5b = ffm5b(f01); fef = ffmEf(f01);
    m[0][i] = f01 + (f5b<<8) + (fef<<16) + (fef<<24);
    m[2][i] = f5b + (fef<<8) + (f01<<16) + (fef<<24);
    f01 = q[0][i]; f5b = ffm5b(f01); fef = ffmEf(f01);
    m[1][i] = fef + (fef<<8) + (f5b<<16) + (f01<<24);
    m[3][i] = f5b + (f01<<8) + (fef<<16) + (f5b<<24);
  }

  kLen = inKey.length/2;
  for (i=0; i<kLen; i++){
    a = inKey[i+i];   meKey[i] = a;
    b = inKey[i+i+1]; moKey[i] = b;
    sKey[kLen-i-1] = mdsRem(a,b);
  }
  for (i=0; i<40; i+=2){
    a=0x1010101*i; b=a+0x1010101;
    a=hFun(a,meKey);
    b=rotw(hFun(b,moKey),8);
    tfsKey[i]=(a+b)&wMax;
    tfsKey[i+1]=rotw(a+2*b,9);
  }
  for (i=0; i<256; i++){
    a=b=c=d=i;
    switch(kLen){
    case 4:
      a = q[1][a]^getB(sKey[3],0);
      b = q[0][b]^getB(sKey[3],1);
      c = q[0][c]^getB(sKey[3],2);
      d = q[1][d]^getB(sKey[3],3);
    case 3:
      a = q[1][a]^getB(sKey[2],0);
      b = q[1][b]^getB(sKey[2],1);
      c = q[0][c]^getB(sKey[2],2);
      d = q[0][d]^getB(sKey[2],3);
    case 2:
      tfsM[0][i] = m[0][q[0][q[0][a]^getB(sKey[1],0)]^getB(sKey[0],0)];
      tfsM[1][i] = m[1][q[0][q[1][b]^getB(sKey[1],1)]^getB(sKey[0],1)];
      tfsM[2][i] = m[2][q[1][q[0][c]^getB(sKey[1],2)]^getB(sKey[0],2)];
      tfsM[3][i] = m[3][q[1][q[1][d]^getB(sKey[1],3)]^getB(sKey[0],3)];
    }
  }
}

function tfsG0(x){ return tfsM[0][getB(x,0)]^tfsM[1][getB(x,1)]^tfsM[2][getB(x,2)]^tfsM[3][getB(x,3)]; }
function tfsG1(x){ return tfsM[0][getB(x,3)]^tfsM[1][getB(x,0)]^tfsM[2][getB(x,1)]^tfsM[3][getB(x,2)]; }

function tfsFrnd(r,blk){
  var a=tfsG0(blk[0]); var b=tfsG1(blk[1]);
  blk[2] = rotw( blk[2]^(a+b+tfsKey[4*r+8])&wMax, 31 );
  blk[3] = rotw(blk[3],1) ^ (a+2*b+tfsKey[4*r+9])&wMax;
  a=tfsG0(blk[2]); b=tfsG1(blk[3]);
  blk[0] = rotw( blk[0]^(a+b+tfsKey[4*r+10])&wMax, 31 );
  blk[1] = rotw(blk[1],1) ^ (a+2*b+tfsKey[4*r+11])&wMax;
}

function tfsIrnd(i,blk){
  var a=tfsG0(blk[0]); var b=tfsG1(blk[1]);
  blk[2] = rotw(blk[2],1) ^ (a+b+tfsKey[4*i+10])&wMax;
  blk[3] = rotw( blk[3]^(a+2*b+tfsKey[4*i+11])&wMax, 31 );
  a=tfsG0(blk[2]); b=tfsG1(blk[3]);
  blk[0] = rotw(blk[0],1) ^ (a+b+tfsKey[4*i+8])&wMax;
  blk[1] = rotw( blk[1]^(a+2*b+tfsKey[4*i+9])&wMax, 31 );
}

function tfsClose(){
  tfsKey=[];
  tfsM=[[],[],[],[]];
}

function tfsEncrypt(){
  var blk=[getW(bData,i)^tfsKey[0], getW(bData,i+4)^tfsKey[1], getW(bData,i+8)^tfsKey[2], getW(bData,i+12)^tfsKey[3]];
  for (var j=0;j<8;j++){ tfsFrnd(j,blk); }
  setW(bData,i   ,blk[2]^tfsKey[4]);
  setW(bData,i+ 4,blk[3]^tfsKey[5]);
  setW(bData,i+ 8,blk[0]^tfsKey[6]);
  setW(bData,i+12,blk[1]^tfsKey[7]);
  i+=16;
}

function tfsDecrypt(){
  var blk=[getW(bData,i)^tfsKey[4], getW(bData,i+4)^tfsKey[5], getW(bData,i+8)^tfsKey[6], getW(bData,i+12)^tfsKey[7]];
  for (var j=7;j>=0;j--){ tfsIrnd(j,blk); }
  setW(bData,i   ,blk[2]^tfsKey[0]);
  setW(bData,i+ 4,blk[3]^tfsKey[1]);
  setW(bData,i+ 8,blk[0]^tfsKey[2]);
  setW(bData,i+12,blk[1]^tfsKey[3]);
  i+=16;
}


// Blockcipher

function blcEncrypt(name, cbc, init, enc, close){
  if (tot==0){
    prgr = name;
    if (key.length<1) return;
    if (lenInd) insLen( bData.length%16, 4 );
    if (cbc) for (i=0; i<16; i++) bData.unshift( Math.floor(Math.random()*256) );
    while( bData.length%16!=0 ) bData.push(0);
    tot = bData.length;
    init();
  }else{
    if (cbc) for (j=i; j<i+16; j++) bData[j] ^= bData[j-16];
    enc();
  }
  if (i>=tot) close();
}

function blcDecrypt(name, cbc, init, dec, close){
  if (tot==0){
    prgr = name;
    if (key.length<1) return;
    if (cbc){ i=16; }
    tot = bData.length;
    if ( (tot%16) || tot<i ) throw name+': Incorrect length.';
    init();
  }else{
    if (cbc) i=tot-i;
    dec();
    if (cbc){
      for (j=i-16; j<i; j++) bData[j] ^= bData[j-16];
      i = tot+32-i;
    }
  }
  if (i>=tot){
    close();
    if (cbc) bData.splice(0,16);
    if (lenInd){
      var ol = bData.length;
      var k = getLen(getNrBits(15));
      while((k+ol-bData.length)%16!=0) bData.pop();
    }
    else{
      while(bData[bData.length-1]==0) bData.pop();
    }
  }
}

function aeseEncrypt(){ blcEncrypt('AESe',0,aesInit,aesEncrypt,aesClose); }
function aeseDecrypt(){ blcDecrypt('AESe',0,aesInit,aesDecrypt,aesClose); }
function aescEncrypt(){ blcEncrypt('AESc',1,aesInit,aesEncrypt,aesClose); }
function aescDecrypt(){ blcDecrypt('AESc',1,aesInit,aesDecrypt,aesClose); }
function srpeEncrypt(){ blcEncrypt('SRPe',0,srpInit,srpEncrypt,srpClose); }
function srpeDecrypt(){ blcDecrypt('SRPe',0,srpInit,srpDecrypt,srpClose); }
function srpcEncrypt(){ blcEncrypt('SRPc',1,srpInit,srpEncrypt,srpClose); }
function srpcDecrypt(){ blcDecrypt('SRPc',1,srpInit,srpDecrypt,srpClose); }
function tfseEncrypt(){ blcEncrypt('TFSe',0,tfsInit,tfsEncrypt,tfsClose); }
function tfseDecrypt(){ blcDecrypt('TFSe',0,tfsInit,tfsDecrypt,tfsClose); }
function tfscEncrypt(){ blcEncrypt('TFSc',1,tfsInit,tfsEncrypt,tfsClose); }
function tfscDecrypt(){ blcDecrypt('TFSc',1,tfsInit,tfsDecrypt,tfsClose); }


// RSA

var rsaPrimeDivs;
var rsaTestPrimes;
var rsaPrimes;
var rsaPhi;
var rsaPhi2;
var rsaExp;
var rsaExp2;
var rsaPubExp;
var rsaPrivExp;
var rsaMod;
var rsaNbits;
var rsaBlockIn;
var rsaBlockIn2;
var rsaBlockOut;
var rsaMaxi;

function rsaPrimeInit(bits){
  prgr='Prime Init';
  var prims = ['DQ==', 'Z8M=', '47g1FQcDUeg=', 'qyCjjiLKHlom/1lRyXOrf412BCZ0FgKW87wYHNIQw8k='];
  rsaPrimeDivs=[];
  rsaTestPrimes=[];

  var q;
  for ( var p=2; p<500; p++ ){
    for (var d=0; d<rsaPrimeDivs.length&&(q=rsaPrimeDivs[d][0])<=Math.sqrt(p); d++)
      if (p%q==0){ p++; d=-1; }
    if (getNrBits(p)<bits && p<bMax) rsaPrimeDivs[rsaPrimeDivs.length]=[p];
    else break;
  }

  for (p=0; p<prims.length; p++){
    sData=prims[p];
    i=tot=0; do{ b64Decrypt(); } while (i<tot);
    var prime=bFromBytes(bData);
    if ( bGetNrBits(prime) >= bits ) break;
    rsaTestPrimes[p]=prime;
  }

  if (rsaTestPrimes.length>0){
    aesGenTables();
    bData = aesSBox;
    aesClose();
    p = bData.length;
    q = 3 * ( bits + bGetNrBits(rsaTestPrimes[rsaTestPrimes.length-1]) );
    while (p<q){ bData[p] = bData[bData[p-256]]; p++; }
  }
}

function rsaClose(){
  rsaPrimeDivs=rsaTestPrimes=rsaPrimes=rsaPhi=rsaPhi2=null;
  rsaExp=rsaExp2=rsaPubExp=rsaPrivExp=rsaMod=null;
  rsaBlockIn=rsaBlockIn2=rsaBlockOut=null;
}

function rsaGetPrime(nrPrime, bits, nrTry, nrTest){
  var prime=rsaPrimes[nrPrime];
  var k;
  if (i==0){
    if (nrTry==0){ prgr='Search Prime '+(nrPrime+1)
      +': try <INPUT id="nrTry" type="text" size=3 value="1" readonly>'
      +', test <INPUT id="nrTest" type="text" size=1 value="1" readonly>';
    }
    else try{
      getEl(frBottom,'nrTry').value=nrTry+1;
      getEl(frBottom,'nrTest').value=nrTest+1;
    }catch(e){}
  }

  if (nrTest==0){
    if (i==0){
      bRnd(prime,bits,1); prime[0] |= 1;
      tot=rsaPrimeDivs.length;
      if (tot==0) return;
    }
    var q = bDiv(prime,rsaPrimeDivs[i++]);
    if ( q[1].length==1 && q[1][0]==0 ){
      i=0;
      cmds.splice(0,1,'rsaGetPrime('+nrPrime+','+bits+','+(nrTry+1)+',0);');
      return;
    }

  }else{

    if (i==0){
      rsaExp2=[0];
      tot=rsaNbits*3;
      j=0;
      rsaBlockIn2=null;
    }
    if ( rsaExp2.length==1 && rsaExp2[0]==0 ){
      if (j==0){
        if ( rsaBlockIn2!=null && bCmp(rsaBlockOut,rsaBlockIn2)!=0 ){
          i=tot;
          cmds.splice(1,0,'rsaGetPrime('+nrPrime+','+bits+','+(nrTry+1)+',0);');
          return;
        }
        rsaBlockIn = rsaGetBlock(rsaNbits-1);
        rsaBlockIn2 = rsaBlockIn.slice(0);
        rsaExp2 = rsaPubExp.slice(0);
        j=1;
        if (i!=0) i+=rsaNbits-1-i%(rsaNbits-1);
      }else{
        rsaBlockIn = rsaBlockOut;
        rsaExp2 = rsaPrivExp.slice(0);
        j=0;
      }
      rsaBlockOut = [1];
    }
    rsaCrypt();
    i++; if (i%(rsaNbits-1)==0) i--;
  }
  if (i>=tot && nrTest<rsaTestPrimes.length){
    if (nrTest==0) bSetSeed();
    rsaMod = bMul(prime, rsaTestPrimes[nrTest]);
    rsaNbits=bGetNrBits(rsaMod);
    rsaPhi = bMul( bMinIs(prime.slice(0),[1]), bMinIs(rsaTestPrimes[nrTest].slice(0),[1]) );
    try{ getEl(frBottom,'nrTest').value=(nrTest+2)+'i'; }catch(e){}
    cmds.splice(1,0,'rsaGetPubExp();', 'rsaGetPrivExp();',
      'rsaGetPrime('+nrPrime+','+bits+','+nrTry+','+(nrTest+1)+');');
  }
}

function rsaGetPubExp(){
  if (tot==0) rsaPubExp=[0xFFFF];
  if (i==0){
    bPlusIs(rsaPubExp,[2]);
    if ( bCmp(rsaPubExp,rsaMod)>=0 ) rsaPubExp=[3];
    rsaExp = rsaPubExp.slice(0);
    rsaPhi2 = rsaPhi.slice(0);
    tot=bGetNrBits(rsaExp)+1;
  }
  var q = bDiv(rsaPhi2,rsaExp);
  rsaPhi2 = rsaExp;
  rsaExp = q[1];
  i=tot-bGetNrBits(rsaExp);
  if ( i==tot && ((rsaPhi2.length>1)||(rsaPhi2[0]!=1)) ) i=0;
}

function rsaGetPrivExp(){
  if (i==0){
    rsaExp2 = rsaPubExp.slice(0);
    rsaPhi2 = rsaPhi.slice(0);
    rsaPrivExp = [1];
    rsaExp = [0];
    tot=bGetNrBits(rsaExp2)+1;
  }
  var q = bDiv(rsaPhi2,rsaExp2);
  bPlusIs( rsaExp, bMul(q[0],rsaPrivExp) );
  rsaPhi2 = rsaExp2;
  rsaExp2 = q[1];
  i=tot-bGetNrBits(rsaExp2);
  if (i==tot) return;

  q = bDiv(rsaPhi2,rsaExp2);
  bPlusIs( rsaPrivExp, bMul(q[0],rsaExp) );
  rsaPhi2 = rsaExp2;
  rsaExp2 = q[1];
  i=tot-bGetNrBits(rsaExp2);
  if (i==tot) rsaPrivExp = bMinIs(rsaPhi,rsaExp);
}

var secRnd;
var secRndBits=0;

function rsaGetKeys(){
  bSetSeed();
  var nBits = parseInt(getEl(frTop,'nBits').value);
  while (isNaN(nBits)||nBits<5)
    nBits = parseInt( prompt('Give the number of bits for the modulus (at least 5)',50) );
  getEl(frTop,'nBits').value = nBits;
  var sn = 2*Math.ceil(Math.sqrt(nBits))-bGetNrBits(bSeeds);
  if (sn>31){
    alert( 'Need '+ (sn>>>3) +' more seeds for random generator.' );
    bSetSeed(); return;
  }
  var n = nBits>>>1;
  var m = (1+nBits)>>>1;
  rsaPrimes = [[],[]];
  getEl(frTop,'useJava').disabled = true;
  getEl(frTop,'nBits').disabled = true;
  getEl(frTop,'getKeys').disabled = true;

  if (useJava){
    if (secRndBits < nBits){
      secRnd = new java.security.SecureRandom();
      secRnd.setSeed( bToJBI(bSeeds).toByteArray() );
      secRndBits = nBits;
    }
    cmds.push( 'prgr="Searching primes";',
     'rsaPrimes[0]=java.math.BigInteger.probablePrime('+n+',secRnd);',
     'do{rsaPrimes[1]=java.math.BigInteger.probablePrime('+m+',secRnd);}'
       +'while(rsaPrimes[1].equals(rsaPrimes[0]));',
     'prgr="Calculating keys";',
     'rsaMod=rsaPrimes[0].multiply(rsaPrimes[1]);',
     'rsaPhi=(rsaPrimes[0].subtract(java.math.BigInteger.ONE))'
       +'.multiply(rsaPrimes[1].subtract(java.math.BigInteger.ONE));',
     'rsaPubExp=new java.math.BigInteger("10001",16);',
     'if (rsaPubExp.compareTo(rsaMod)>=0) rsaPubExp=new java.math.BigInteger("3");',
     'while (rsaPhi.gcd(rsaPubExp).intValue()>1) rsaPubExp=rsaPubExp.add(new java.math.BigInteger("2"));',
     'rsaPrivExp=bFromJBI(rsaPubExp.modInverse(rsaPhi));',
     'rsaPubExp=bFromJBI(rsaPubExp); rsaMod=bFromJBI(rsaMod);' );
  } else {
    cmds.push('rsaPrimeInit('+n+');', 'rsaGetPrime(0,'+n+',0,0);',
     'rsaPrimeInit('+m+');', 'rsaGetPrime(1,'+m+',0,0);',
     'if (bCmp(rsaPrimes[0],rsaPrimes[1])==0) cmds.unshift("","rsaGetPrime(1,'+m+',0,0);");',
     'rsaMod = bMul(rsaPrimes[0], rsaPrimes[1]); '
      +'bMinIs(rsaPrimes[0],[1]); bMinIs(rsaPrimes[1],[1]); rsaPhi = bMul(rsaPrimes[0], rsaPrimes[1]);',
     'prgr="Calculate public key";',
     'rsaGetPubExp();',
     'prgr="Calculate private key";',
     'rsaGetPrivExp();' );
  }
  cmds.push('var a=bToBytes(rsaPubExp); a.splice(0,0,a.length&0xFF,a.length>>8); '
      +'a=a.concat(bToBytes(rsaMod)); getEl(frTop, "rsaPubKey").value=bytesToB64(a); '
      +'a=bToBytes(rsaPrivExp); a.splice(0,0,a.length&0xFF,a.length>>8); a=a.concat(bToBytes(rsaMod)); '
      +'getEl(frTop, "rsaPrivKey").value=bytesToB64(a); rsaClose(); makeBottomNrm(); '
      +'getEl(frTop,"useJava").disabled=getEl(frTop,"nBits").disabled=getEl(frTop,"getKeys").disabled=false;');

  cmdFail = new Function( 'e', cmdFStat+'rsaClose(); makeBottomNrm(); '
   +'getEl(frTop,"useJava").disabled=getEl(frTop,"nBits").disabled=getEl(frTop,"getKeys").disabled=false;' );

  i=tot=0;
  doCmds();
}

function rsaCrypt(){
  if ( rsaExp2[0]&1 ) rsaBlockOut = bDiv( bMul(rsaBlockOut,rsaBlockIn), rsaMod )[1];
  rsaBlockIn = bDiv( bMul(rsaBlockIn,rsaBlockIn), rsaMod )[1];
  bShrIs(rsaExp2,1);
}

function rsaInit(){
  var err = 'RSA key: invalid format';
  prgr = 'RSA';
  if (key.length<2) throw(err);
  var expLen=key[0]+256*key[1];
  var modLen=key.length-2-expLen;
  if (modLen<1 || expLen<1) throw(err);
  rsaExp = bFromBytes( key.slice(2, 2+expLen) );
  rsaMod = bFromBytes( key.slice(2+expLen) );
  rsaNbits = bGetNrBits(rsaMod);
  if (useJava){ rsaExp=bToJBI(rsaExp); rsaMod=bToJBI(rsaMod); }
}

function rsaGetBlock(nrBits){
  var k=i+nrBits;
  var block=[0];
  while ((k%8!=0)&&(k>i)){ k--; bShlIs(block,1); block[0]|=(bData[k>>>3]>>(k%8))&1; }
  while (k>i+7){ k-=8; bShlIs(block,8); block[0]|=bData[k>>>3]; }
  while (k>i){ k--; bShlIs(block,1); block[0]|=(bData[k>>>3]>>(k%8))&1; }
  return block;
}

function rsaSetBlock(nrBits, block){
  if (bGetNrBits(block)>nrBits) throw('RSA: invalid key/data combination.');
  var k=0;
  var m=1<<(j%8);
  while ((j%8!=0)&&(k<nrBits)){ bData[j>>>3]|=m*(block[0]&1); bShrIs(block,1); j++; k++; m<<=1; }
  while (k<nrBits-7){ bData[j>>>3]=block[0]&0xFF; bShrIs(block,8); j+=8; k+=8; }
  if (j%8==0) bData[j>>>3]=0;
  m=1; while (k<nrBits){ bData[j>>>3]|=m*(block[0]&1); bShrIs(block,1); j++; k++; m<<=1; }
}

function rsaEncrypt(){
  if (i==0){
    rsaInit();
    if (lenInd){
      var mod=(rsaNbits+13)>>>3;
      insLen( bData.length%mod, getNrBits(mod-1) );
    }
    tot = bData.length*8;
    if ( tot%(rsaNbits-1)>0 ) tot+=rsaNbits-1-tot%(rsaNbits-1);
    bData.splice(0,0,0);
    i=8; tot+=8; j=0;
    while (bData.length*8<tot) bData.push(0);
    rsaExp2=[0];
  }

  if (useJava){
    rsaMaxi=i+rsaNbits-2;
    rsaBlockOut = bFromJBI( bToJBI(rsaGetBlock(rsaNbits-1)).modPow(rsaExp,rsaMod) );
  }
  else {
    if ( rsaExp2.length==1 && rsaExp2[0]==0 ){
      rsaBlockIn = rsaGetBlock(rsaNbits-1);
      rsaMaxi=i+rsaNbits-2;
      rsaBlockOut = [1];
      rsaExp2 = rsaExp.slice(0);
    }
    rsaCrypt();
    if (i<rsaMaxi) i++;
  }

  if ( rsaExp2.length==1 && rsaExp2[0]==0 ){
    rsaSetBlock(rsaNbits, rsaBlockOut);
    i=rsaMaxi+1;
    if (j>i-8){ bData.splice((j+7)>>>3,0,0); i+=8; tot+=8; }
    if (i>=tot){ bData.length=(j+7)>>>3; rsaClose(); }
  }
}

function rsaDecrypt(){
  if (i==0){
    rsaInit();
    bData.splice(0,0,0);
    j=0; i=8; tot=bData.length*8;
    rsaExp2=[0];
  }

  if (useJava){
    rsaSetBlock( rsaNbits-1, bFromJBI(bToJBI(rsaGetBlock(rsaNbits)).modPow(rsaExp,rsaMod)) );
    i += rsaNbits;
    if (tot-i<rsaNbits) i=tot;
  }
  else {
    if ( rsaExp2.length==1 && rsaExp2[0]==0 ){
      rsaBlockIn = rsaGetBlock(rsaNbits);
      rsaMaxi = i+rsaNbits-1;
      rsaBlockOut=[1];
      rsaExp2=rsaExp.slice(0);
    }
    rsaCrypt();
    if (i<rsaMaxi) i++;
    if ( rsaExp2.length==1 && rsaExp2[0]==0 ){
      rsaSetBlock(rsaNbits-1, rsaBlockOut);
      i=rsaMaxi+1;
      if (tot-i<rsaNbits) i=tot;
    }
  }

  if (i>=tot){
    bData.length = (j+7)>>>3;
    if (lenInd){
      var mod=(rsaNbits+13)>>>3;
      var r=getLen(getNrBits(mod-1));
      if (r>=mod) throw('invalid RSA data.');
      while (bData.length%mod!=r) bData.pop();
    }
    else{
      while(bData[bData.length-1]==0) bData.pop();
    }
    rsaClose();
  }
}
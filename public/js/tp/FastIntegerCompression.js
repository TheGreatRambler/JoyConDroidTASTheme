(function(){function h(){}h.computeCompressedSizeInBytes=function(d){for(var f=d.length,e=0,b=0;b<f;b++){var a=d[b];e+=128>a?1:16384>a?2:2097152>a?3:268435456>a?4:5}return e};h.compress=function(d){for(var f=d.length,e=new ArrayBuffer(h.computeCompressedSizeInBytes(d)),b=new Int8Array(e),a=0,g=0;g<f;g++){var c=d[g];128>c?b[a++]=c:16384>c?(b[a++]=c&127|128,b[a++]=c>>>7):2097152>c?(b[a++]=c&127|128,b[a++]=c>>>7&127|128,b[a++]=c>>>14):268435456>c?(b[a++]=c&127|128,b[a++]=c>>>7&127|128,b[a++]=c>>>14&
127|128,b[a++]=c>>>21):(b[a++]=c&127|128,b[a++]=c>>>7&127|128,b[a++]=c>>>14&127|128,b[a++]=c>>>21&127|128,b[a++]=c>>>28)}return e};h.computeHowManyIntegers=function(d){for(var f=(new Int8Array(d)).length,e=0,b=0;b<f;b++)e+=d[b]>>>7;return f-e};h.uncompress=function(d){var f=[];d=new Int8Array(d);for(var e=d.length,b=0;e>b;){var a=d[b++],g=a&127;0<=a||(a=d[b++],g|=(a&127)<<7,0<=a||(a=d[b++],g|=(a&127)<<14,0<=a||(a=d[b++],g|=(a&127)<<21,0<=a||(a=d[b++],g|=a<<28))));f.push(g)}return f};window.FastIntegerCompression=
h})();

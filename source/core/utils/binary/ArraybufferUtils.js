"use strict";

/**
 * ArraybufferUtils contains methods to convert from and to ArrayBuffer binary format
 * 
 * @class ArraybufferUtils
 * @module BinaryUtils
 * @static
 */
function ArraybufferUtils(){}

/**
 * Create arraybuffer from binary string
 *
 * @method fromBinaryString
 * @param {string} str
 * @return {Arraybuffer} data
 */
ArraybufferUtils.fromBinaryString = function(str)
{
	var length = str.length;
	var arraybuffer = new ArrayBuffer(length);
	var view = new Uint8Array(arraybuffer);

	for(var i = 0; i < length; i++)
	{
		view[i] = str.charCodeAt(i);
	}

	return arraybuffer;
};

/**
 * Create arraybuffer from base64 string
 *
 * @method fromBase64
 * @param {string} base64
 * @return {Arraybuffer} data
 */
ArraybufferUtils.fromBase64 = function(str)
{
	var encoding = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var length = str.length / 4 * 3;
	var arraybuffer = new ArrayBuffer(length);
	var view = new Uint8Array(arraybuffer);

	var a, b, c, d;

	for(var i = 0, j = 0; i < length; i += 3)
	{
		a = encoding.indexOf(str.charAt(j++));
		b = encoding.indexOf(str.charAt(j++));
		c = encoding.indexOf(str.charAt(j++));
		d = encoding.indexOf(str.charAt(j++));

		view[i] = (a << 2) | (b >> 4);
		if(c !== 64)
		{
			view[i+1] = ((b & 15) << 4) | (c >> 2);
		}
		if(d !== 64)
		{
			view[i+2] = ((c & 3) << 6) | d;
		}
	}

	return arraybuffer;
};

/**
 * Create arraybuffer from Nodejs buffer
 *
 * @method fromBuffer
 * @param {Buffer} buffer
 * @return {Arraybuffer} data
 */
ArraybufferUtils.fromBuffer = function(buffer)
{
	var array = new ArrayBuffer(buffer.length);
	var view = new Uint8Array(array);

	for(var i = 0; i < buffer.length; i++)
	{
		view[i] = buffer[i];
	}

	return array;

	//Faster but the results is failing the "instanceof ArrayBuffer" test
	//return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

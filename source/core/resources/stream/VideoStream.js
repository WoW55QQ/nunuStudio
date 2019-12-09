"use strict";

/**
 * Video stream resource, used to load streamable video files.
 * 
 * @class VideoStream
 * @extends {Video}
 * @module Resources
 * @param {string} url URL to video file.
 * @param {string} encoding Image encoding, required for ArrayBuffer data.
 */
function VideoStream(url)
{
	Video.call(this);

	this.format = "url";
	this.encoding = FileSystem.getFileExtension(url);
	this.data = url;
}

VideoStream.prototype = Object.create(Video.prototype);
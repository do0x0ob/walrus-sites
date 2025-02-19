// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest } from "next/server";
import { getSubdomainAndPath } from "@lib/domain_parsing";
import { config } from "./configuration_loader";
import crypto from 'crypto';
import logger from "@lib/logger";

/**
* Check if the request is for an HTML page.
* Used to avoid tracking requests for static assets like images, css, etc.
* i.e. Use this to only track page views.
* @param {NextRequest} request - The request object.
* @returns {Boolean} - True if the request is for an HTML page, false otherwise.
*/
export function isHtmlPage(request: NextRequest): Boolean {
    // This is to avoid tracking requests for static assets like images, css, etc.
    // Cuts down costs since we are tracking less events.
    logger.info({ message: "Checking if request is for an HTML page" });
    logger.info({ nextUrl: request.nextUrl.toString() });
    const parsedUrl = getSubdomainAndPath(
        request.nextUrl,
        Number(config.portalDomainNameLength)
    );
    logger.info({ parsedUrlIsHtml: parsedUrl });

    logger.info({ contentType: request.headers.get('content-type') });
    const contentTypeIsHtml = request.headers.get('content-type')?.startsWith('text/html')
    // Used as fallback when content type is undefined.
    logger.info({ contentTypeIsHtml: contentTypeIsHtml });
    const pathEndsWithHTML = parsedUrl?.path?.endsWith('.html')
    logger.info({ pathEndsWithHTML: pathEndsWithHTML });

    return contentTypeIsHtml ?? !!pathEndsWithHTML;
}


/**
* Extract custom event properties from the request.
* @param {NextRequest} request - The request object.
* @returns {CustomEventProperties} - The extracted custom event properties.
*/
export function extractCustomEventProperties(request: NextRequest): CustomEventProperties {
	const parsedUrl = getSubdomainAndPath(
        request.nextUrl,
        Number(config.portalDomainNameLength)
    );

    return {
        originalUrl: request.headers.get("x-original-url") || "Unknown",
        subdomain: parsedUrl?.subdomain
    };
}

/**
* Generate a hash of a string.
* @param {string} input - The input string to hash.
* @returns {string} - The resulting first N characters of the hash.
*/
export function generateHash(input: string, n = 10 ): string {
	return crypto.createHash('sha256').update(input).digest('hex').substring(0, n);
}

// As of this writing, vercel pro plan supports at most 2 custom event props.
type CustomEventProperties = {
    originalUrl: string;
    subdomain?: string;
};

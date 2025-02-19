// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    console.log("middleware request", JSON.stringify(Object.assign({}, request), null, 2));
    const urlOriginal = extractUrlFrom(request)
    console.log("urlOriginal", urlOriginal);
    const alreadyAtRoot = request.nextUrl.pathname === '/'
    // Bypass middleware for walrus-sites-sw.js
    if (request.nextUrl.pathname.endsWith('walrus-sites-sw.js')) {
        return NextResponse.next()
    }
    console.log("alreadyAtRoot", alreadyAtRoot);
    if (alreadyAtRoot) {
        const response = NextResponse.next()
        response.headers.set('x-original-url', urlOriginal)
        return response
    }
    console.log("redirecting to root");
    const urlRedirect = new URL('/', request.url)
    const response = NextResponse.rewrite(urlRedirect)
    response.headers.set('x-original-url', urlOriginal)
    return response
}

export const config = {
    matcher: '/(.*)',
}

function extractUrlFrom(request: NextRequest): string {
    const hostname = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
    if (!hostname) {
        throw new Error('No hostname found in request header')
    }
    return `${request.nextUrl.protocol}//${hostname}${request.nextUrl.pathname}`
}

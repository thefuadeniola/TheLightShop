import axios from "axios";
import * as cheerio from "cheerio";
import { extractPrice } from "../utils";
import { extractCurrency } from "../utils";
import { extractDescription } from "../utils";

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;

    //BrightData proxy configuration
    /*     curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_692d2e2f-zone-unblocker:z900jgkq0kqs -k https://lumtest.com/myip.json */
    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const port = 22225
    const session_id = (1000000 * Math.random()) | 0
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnathorized: false
    }

    try {
        // Fetch the product page
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data)

        const title = $('#productTitle').text().trim()

        const originalPrice = extractPrice(
            $('a.size.base .a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.apexPriceToPay span.a-offscreen'),
            $('.a-price.a-text-price span.a-offscreen')

        );

        const currentPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.priceToPay span.a-offscreen')
        );

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

        const images = $('#imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}'

        const imageUrls = Object.keys(JSON.parse(images))

        const currency = extractCurrency($('.a-price-symbol'))

        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, '');

        const description = extractDescription($)

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            originalPrice: Number(originalPrice) || Number(currentPrice),
            currentPrice: Number(currentPrice) || Number(originalPrice),
            discountRate: Number(discountRate),
            priceHistory: [],
            reviewsCount: 765,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice),
            averagePrice: Number(originalPrice) || Number(currentPrice),
            category: ''
        }

        return data

    } catch (error: any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}
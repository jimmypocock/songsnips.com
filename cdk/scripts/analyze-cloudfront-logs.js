#!/usr/bin/env ts-node
"use strict";
/**
 * CloudFront Log Analyzer
 *
 * This script analyzes CloudFront logs stored in S3 to identify potential attack patterns.
 * Run this when you receive alerts to investigate further.
 *
 * Usage:
 *   npx ts-node scripts/analyze-cloudfront-logs.ts --bucket your-logs-bucket --prefix cloudfront/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.printAnalysisReport = exports.analyzeCloudFrontLogs = void 0;
const AWS = require("aws-sdk");
const readline = require("readline");
const zlib = require("zlib");
const s3 = new AWS.S3();
async function analyzeCloudFrontLogs(bucket, prefix, hoursBack = 24) {
    const result = {
        topIPs: new Map(),
        topPaths: new Map(),
        errorPaths: new Map(),
        bandwidthByIP: new Map(),
        suspiciousPatterns: [],
        totalRequests: 0,
        totalBandwidth: 0,
        cacheHitRate: 0,
    };
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    let cacheHits = 0;
    // List objects in the bucket
    const objects = await s3.listObjectsV2({
        Bucket: bucket,
        Prefix: prefix,
    }).promise();
    if (!objects.Contents) {
        console.log('No log files found');
        return result;
    }
    // Process each log file
    for (const object of objects.Contents) {
        if (!object.Key || !object.Key.endsWith('.gz'))
            continue;
        const logStream = s3.getObject({
            Bucket: bucket,
            Key: object.Key,
        }).createReadStream();
        const gunzip = zlib.createGunzip();
        const lines = readline.createInterface({
            input: logStream.pipe(gunzip),
            crlfDelay: Infinity,
        });
        for await (const line of lines) {
            if (line.startsWith('#'))
                continue; // Skip comment lines
            const fields = line.split('\t');
            if (fields.length < 15)
                continue;
            const entry = {
                date: fields[0],
                time: fields[1],
                edge_location: fields[2],
                bytes: parseInt(fields[3], 10),
                client_ip: fields[4],
                method: fields[5],
                host: fields[6],
                uri: fields[7],
                status: parseInt(fields[8], 10),
                referer: fields[9],
                user_agent: fields[10],
                query_string: fields[11],
                cookie: fields[12],
                result_type: fields[13],
                request_id: fields[14],
            };
            // Check if entry is within time range
            const entryTime = new Date(`${entry.date}T${entry.time}Z`);
            if (entryTime < cutoffTime)
                continue;
            result.totalRequests++;
            result.totalBandwidth += entry.bytes;
            // Track IPs
            result.topIPs.set(entry.client_ip, (result.topIPs.get(entry.client_ip) || 0) + 1);
            result.bandwidthByIP.set(entry.client_ip, (result.bandwidthByIP.get(entry.client_ip) || 0) + entry.bytes);
            // Track paths
            result.topPaths.set(entry.uri, (result.topPaths.get(entry.uri) || 0) + 1);
            // Track errors
            if (entry.status >= 400) {
                result.errorPaths.set(entry.uri, (result.errorPaths.get(entry.uri) || 0) + 1);
            }
            // Track cache hits
            if (entry.result_type.includes('Hit')) {
                cacheHits++;
            }
            // Detect suspicious patterns
            if (entry.uri.includes('..') || entry.uri.includes('//')) {
                result.suspiciousPatterns.push(`Directory traversal attempt: ${entry.client_ip} -> ${entry.uri}`);
            }
            if (entry.uri.match(/\.(php|asp|jsp|cgi|sh|bat|exe)$/i)) {
                result.suspiciousPatterns.push(`Suspicious file request: ${entry.client_ip} -> ${entry.uri}`);
            }
            if (entry.uri.includes('admin') || entry.uri.includes('wp-') || entry.uri.includes('phpmyadmin')) {
                result.suspiciousPatterns.push(`Admin probe attempt: ${entry.client_ip} -> ${entry.uri}`);
            }
        }
    }
    result.cacheHitRate = (cacheHits / result.totalRequests) * 100;
    return result;
}
exports.analyzeCloudFrontLogs = analyzeCloudFrontLogs;
function printAnalysisReport(result) {
    console.log('\n=== CloudFront Log Analysis Report ===\n');
    console.log(`Total Requests: ${result.totalRequests.toLocaleString()}`);
    console.log(`Total Bandwidth: ${(result.totalBandwidth / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`Cache Hit Rate: ${result.cacheHitRate.toFixed(2)}%\n`);
    // Top IPs by request count
    console.log('Top 10 IPs by Request Count:');
    const sortedIPs = Array.from(result.topIPs.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    sortedIPs.forEach(([ip, count]) => {
        const bandwidth = result.bandwidthByIP.get(ip) || 0;
        console.log(`  ${ip}: ${count.toLocaleString()} requests, ${(bandwidth / 1024 / 1024).toFixed(2)} MB`);
    });
    // Top bandwidth consumers
    console.log('\nTop 10 Bandwidth Consumers:');
    const sortedBandwidth = Array.from(result.bandwidthByIP.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    sortedBandwidth.forEach(([ip, bytes]) => {
        const requests = result.topIPs.get(ip) || 0;
        console.log(`  ${ip}: ${(bytes / 1024 / 1024).toFixed(2)} MB (${requests} requests)`);
    });
    // Most requested paths
    console.log('\nTop 10 Requested Paths:');
    const sortedPaths = Array.from(result.topPaths.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    sortedPaths.forEach(([path, count]) => {
        console.log(`  ${path}: ${count.toLocaleString()} requests`);
    });
    // Error paths
    if (result.errorPaths.size > 0) {
        console.log('\nTop Error Paths (4xx/5xx):');
        const sortedErrors = Array.from(result.errorPaths.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        sortedErrors.forEach(([path, count]) => {
            console.log(`  ${path}: ${count} errors`);
        });
    }
    // Suspicious patterns
    if (result.suspiciousPatterns.length > 0) {
        console.log('\n⚠️  SUSPICIOUS PATTERNS DETECTED:');
        result.suspiciousPatterns.slice(0, 20).forEach(pattern => {
            console.log(`  - ${pattern}`);
        });
        if (result.suspiciousPatterns.length > 20) {
            console.log(`  ... and ${result.suspiciousPatterns.length - 20} more`);
        }
    }
    console.log('\n=== End of Report ===\n');
}
exports.printAnalysisReport = printAnalysisReport;
// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const bucketIndex = args.indexOf('--bucket');
    const prefixIndex = args.indexOf('--prefix');
    const hoursIndex = args.indexOf('--hours');
    if (bucketIndex === -1 || bucketIndex + 1 >= args.length) {
        console.error('Usage: npx ts-node analyze-cloudfront-logs.ts --bucket <bucket-name> --prefix <log-prefix> [--hours <hours-back>]');
        process.exit(1);
    }
    const bucket = args[bucketIndex + 1];
    const prefix = prefixIndex !== -1 ? args[prefixIndex + 1] : '';
    const hours = hoursIndex !== -1 ? parseInt(args[hoursIndex + 1], 10) : 24;
    console.log(`Analyzing logs from s3://${bucket}/${prefix} for the last ${hours} hours...`);
    analyzeCloudFrontLogs(bucket, prefix, hours)
        .then(printAnalysisReport)
        .catch(error => {
        console.error('Error analyzing logs:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZS1jbG91ZGZyb250LWxvZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmFseXplLWNsb3VkZnJvbnQtbG9ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7Ozs7OztHQVFHOzs7QUFFSCwrQkFBK0I7QUFDL0IscUNBQXFDO0FBQ3JDLDZCQUE2QjtBQUc3QixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQStCeEIsS0FBSyxVQUFVLHFCQUFxQixDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsWUFBb0IsRUFBRTtJQUN6RixNQUFNLE1BQU0sR0FBbUI7UUFDN0IsTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFO1FBQ2pCLFFBQVEsRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUNuQixVQUFVLEVBQUUsSUFBSSxHQUFHLEVBQUU7UUFDckIsYUFBYSxFQUFFLElBQUksR0FBRyxFQUFFO1FBQ3hCLGtCQUFrQixFQUFFLEVBQUU7UUFDdEIsYUFBYSxFQUFFLENBQUM7UUFDaEIsY0FBYyxFQUFFLENBQUM7UUFDakIsWUFBWSxFQUFFLENBQUM7S0FDaEIsQ0FBQztJQUVGLE1BQU0sVUFBVSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNyRSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFFbEIsNkJBQTZCO0lBQzdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQztRQUNyQyxNQUFNLEVBQUUsTUFBTTtRQUNkLE1BQU0sRUFBRSxNQUFNO0tBQ2YsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRWIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDbEMsT0FB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R0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTNDLElBQUksV0FBVyxLQUFLLENBQUMsQ0FBQyxJQUFJLFdBQVcsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxLQUFLLENBQUMsbUhBQW1ILENBQUMsQ0FBQztRQUNuSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sTUFBTSxHQUFHLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQy9ELE1BQU0sS0FBSyxHQUFHLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUUxRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixNQUFNLElBQUksTUFBTSxpQkFBaUIsS0FBSyxXQUFXLENBQUMsQ0FBQztJQUUzRixxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztTQUN6QyxJQUFJLENBQUMsbUJBQW1CLENBQUM7U0FDekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IHRzLW5vZGVcblxuLyoqXG4gKiBDbG91ZEZyb250IExvZyBBbmFseXplclxuICogXG4gKiBUaGlzIHNjcmlwdCBhbmFseXplcyBDbG91ZEZyb250IGxvZ3Mgc3RvcmVkIGluIFMzIHRvIGlkZW50aWZ5IHBvdGVudGlhbCBhdHRhY2sgcGF0dGVybnMuXG4gKiBSdW4gdGhpcyB3aGVuIHlvdSByZWNlaXZlIGFsZXJ0cyB0byBpbnZlc3RpZ2F0ZSBmdXJ0aGVyLlxuICogXG4gKiBVc2FnZTogXG4gKiAgIG5weCB0cy1ub2RlIHNjcmlwdHMvYW5hbHl6ZS1jbG91ZGZyb250LWxvZ3MudHMgLS1idWNrZXQgeW91ci1sb2dzLWJ1Y2tldCAtLXByZWZpeCBjbG91ZGZyb250L1xuICovXG5cbmltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCAqIGFzIHJlYWRsaW5lIGZyb20gJ3JlYWRsaW5lJztcbmltcG9ydCAqIGFzIHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ2Nzdi1wYXJzZSc7XG5cbmNvbnN0IHMzID0gbmV3IEFXUy5TMygpO1xuXG5pbnRlcmZhY2UgQ2xvdWRGcm9udExvZ0VudHJ5IHtcbiAgZGF0ZTogc3RyaW5nO1xuICB0aW1lOiBzdHJpbmc7XG4gIGVkZ2VfbG9jYXRpb246IHN0cmluZztcbiAgYnl0ZXM6IG51bWJlcjtcbiAgY2xpZW50X2lwOiBzdHJpbmc7XG4gIG1ldGhvZDogc3RyaW5nO1xuICBob3N0OiBzdHJpbmc7XG4gIHVyaTogc3RyaW5nO1xuICBzdGF0dXM6IG51bWJlcjtcbiAgcmVmZXJlcjogc3RyaW5nO1xuICB1c2VyX2FnZW50OiBzdHJpbmc7XG4gIHF1ZXJ5X3N0cmluZzogc3RyaW5nO1xuICBjb29raWU6IHN0cmluZztcbiAgcmVzdWx0X3R5cGU6IHN0cmluZztcbiAgcmVxdWVzdF9pZDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQW5hbHlzaXNSZXN1bHQge1xuICB0b3BJUHM6IE1hcDxzdHJpbmcsIG51bWJlcj47XG4gIHRvcFBhdGhzOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICBlcnJvclBhdGhzOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICBiYW5kd2lkdGhCeUlQOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xuICBzdXNwaWNpb3VzUGF0dGVybnM6IHN0cmluZ1tdO1xuICB0b3RhbFJlcXVlc3RzOiBudW1iZXI7XG4gIHRvdGFsQmFuZHdpZHRoOiBudW1iZXI7XG4gIGNhY2hlSGl0UmF0ZTogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhbmFseXplQ2xvdWRGcm9udExvZ3MoYnVja2V0OiBzdHJpbmcsIHByZWZpeDogc3RyaW5nLCBob3Vyc0JhY2s6IG51bWJlciA9IDI0KTogUHJvbWlzZTxBbmFseXNpc1Jlc3VsdD4ge1xuICBjb25zdCByZXN1bHQ6IEFuYWx5c2lzUmVzdWx0ID0ge1xuICAgIHRvcElQczogbmV3IE1hcCgpLFxuICAgIHRvcFBhdGhzOiBuZXcgTWFwKCksXG4gICAgZXJyb3JQYXRoczogbmV3IE1hcCgpLFxuICAgIGJhbmR3aWR0aEJ5SVA6IG5ldyBNYXAoKSxcbiAgICBzdXNwaWNpb3VzUGF0dGVybnM6IFtdLFxuICAgIHRvdGFsUmVxdWVzdHM6IDAsXG4gICAgdG90YWxCYW5kd2lkdGg6IDAsXG4gICAgY2FjaGVIaXRSYXRlOiAwLFxuICB9O1xuXG4gIGNvbnN0IGN1dG9mZlRpbWUgPSBuZXcgRGF0ZShEYXRlLm5vdygpIC0gaG91cnNCYWNrICogNjAgKiA2MCAqIDEwMDApO1xuICBsZXQgY2FjaGVIaXRzID0gMDtcblxuICAvLyBMaXN0IG9iamVjdHMgaW4gdGhlIGJ1Y2tldFxuICBjb25zdCBvYmplY3RzID0gYXdhaXQgczMubGlzdE9iamVjdHNWMih7XG4gICAgQnVja2V0OiBidWNrZXQsXG4gICAgUHJlZml4OiBwcmVmaXgsXG4gIH0pLnByb21pc2UoKTtcblxuICBpZiAoIW9iamVjdHMuQ29udGVudHMpIHtcbiAgICBjb25zb2xlLmxvZygnTm8gbG9nIGZpbGVzIGZvdW5kJyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIFByb2Nlc3MgZWFjaCBsb2cgZmlsZVxuICBmb3IgKGNvbnN0IG9iamVjdCBvZiBvYmplY3RzLkNvbnRlbnRzKSB7XG4gICAgaWYgKCFvYmplY3QuS2V5IHx8ICFvYmplY3QuS2V5LmVuZHNXaXRoKCcuZ3onKSkgY29udGludWU7XG5cbiAgICBjb25zdCBsb2dTdHJlYW0gPSBzMy5nZXRPYmplY3Qoe1xuICAgICAgQnVja2V0OiBidWNrZXQsXG4gICAgICBLZXk6IG9iamVjdC5LZXksXG4gICAgfSkuY3JlYXRlUmVhZFN0cmVhbSgpO1xuXG4gICAgY29uc3QgZ3VuemlwID0gemxpYi5jcmVhdGVHdW56aXAoKTtcbiAgICBjb25zdCBsaW5lcyA9IHJlYWRsaW5lLmNyZWF0ZUludGVyZmFjZSh7XG4gICAgICBpbnB1dDogbG9nU3RyZWFtLnBpcGUoZ3VuemlwKSxcbiAgICAgIGNybGZEZWxheTogSW5maW5pdHksXG4gICAgfSk7XG5cbiAgICBmb3IgYXdhaXQgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJyMnKSkgY29udGludWU7IC8vIFNraXAgY29tbWVudCBsaW5lc1xuXG4gICAgICBjb25zdCBmaWVsZHMgPSBsaW5lLnNwbGl0KCdcXHQnKTtcbiAgICAgIGlmIChmaWVsZHMubGVuZ3RoIDwgMTUpIGNvbnRpbnVlO1xuXG4gICAgICBjb25zdCBlbnRyeTogQ2xvdWRGcm9udExvZ0VudHJ5ID0ge1xuICAgICAgICBkYXRlOiBmaWVsZHNbMF0sXG4gICAgICAgIHRpbWU6IGZpZWxkc1sxXSxcbiAgICAgICAgZWRnZV9sb2NhdGlvbjogZmllbGRzWzJdLFxuICAgICAgICBieXRlczogcGFyc2VJbnQoZmllbGRzWzNdLCAxMCksXG4gICAgICAgIGNsaWVudF9pcDogZmllbGRzWzRdLFxuICAgICAgICBtZXRob2Q6IGZpZWxkc1s1XSxcbiAgICAgICAgaG9zdDogZmllbGRzWzZdLFxuICAgICAgICB1cmk6IGZpZWxkc1s3XSxcbiAgICAgICAgc3RhdHVzOiBwYXJzZUludChmaWVsZHNbOF0sIDEwKSxcbiAgICAgICAgcmVmZXJlcjogZmllbGRzWzldLFxuICAgICAgICB1c2VyX2FnZW50OiBmaWVsZHNbMTBdLFxuICAgICAgICBxdWVyeV9zdHJpbmc6IGZpZWxkc1sxMV0sXG4gICAgICAgIGNvb2tpZTogZmllbGRzWzEyXSxcbiAgICAgICAgcmVzdWx0X3R5cGU6IGZpZWxkc1sxM10sXG4gICAgICAgIHJlcXVlc3RfaWQ6IGZpZWxkc1sxNF0sXG4gICAgICB9O1xuXG4gICAgICAvLyBDaGVjayBpZiBlbnRyeSBpcyB3aXRoaW4gdGltZSByYW5nZVxuICAgICAgY29uc3QgZW50cnlUaW1lID0gbmV3IERhdGUoYCR7ZW50cnkuZGF0ZX1UJHtlbnRyeS50aW1lfVpgKTtcbiAgICAgIGlmIChlbnRyeVRpbWUgPCBjdXRvZmZUaW1lKSBjb250aW51ZTtcblxuICAgICAgcmVzdWx0LnRvdGFsUmVxdWVzdHMrKztcbiAgICAgIHJlc3VsdC50b3RhbEJhbmR3aWR0aCArPSBlbnRyeS5ieXRlcztcblxuICAgICAgLy8gVHJhY2sgSVBzXG4gICAgICByZXN1bHQudG9wSVBzLnNldChlbnRyeS5jbGllbnRfaXAsIChyZXN1bHQudG9wSVBzLmdldChlbnRyeS5jbGllbnRfaXApIHx8IDApICsgMSk7XG4gICAgICByZXN1bHQuYmFuZHdpZHRoQnlJUC5zZXQoZW50cnkuY2xpZW50X2lwLCAocmVzdWx0LmJhbmR3aWR0aEJ5SVAuZ2V0KGVudHJ5LmNsaWVudF9pcCkgfHwgMCkgKyBlbnRyeS5ieXRlcyk7XG5cbiAgICAgIC8vIFRyYWNrIHBhdGhzXG4gICAgICByZXN1bHQudG9wUGF0aHMuc2V0KGVudHJ5LnVyaSwgKHJlc3VsdC50b3BQYXRocy5nZXQoZW50cnkudXJpKSB8fCAwKSArIDEpO1xuXG4gICAgICAvLyBUcmFjayBlcnJvcnNcbiAgICAgIGlmIChlbnRyeS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgIHJlc3VsdC5lcnJvclBhdGhzLnNldChlbnRyeS51cmksIChyZXN1bHQuZXJyb3JQYXRocy5nZXQoZW50cnkudXJpKSB8fCAwKSArIDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBUcmFjayBjYWNoZSBoaXRzXG4gICAgICBpZiAoZW50cnkucmVzdWx0X3R5cGUuaW5jbHVkZXMoJ0hpdCcpKSB7XG4gICAgICAgIGNhY2hlSGl0cysrO1xuICAgICAgfVxuXG4gICAgICAvLyBEZXRlY3Qgc3VzcGljaW91cyBwYXR0ZXJuc1xuICAgICAgaWYgKGVudHJ5LnVyaS5pbmNsdWRlcygnLi4nKSB8fCBlbnRyeS51cmkuaW5jbHVkZXMoJy8vJykpIHtcbiAgICAgICAgcmVzdWx0LnN1c3BpY2lvdXNQYXR0ZXJucy5wdXNoKGBEaXJlY3RvcnkgdHJhdmVyc2FsIGF0dGVtcHQ6ICR7ZW50cnkuY2xpZW50X2lwfSAtPiAke2VudHJ5LnVyaX1gKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeS51cmkubWF0Y2goL1xcLihwaHB8YXNwfGpzcHxjZ2l8c2h8YmF0fGV4ZSkkL2kpKSB7XG4gICAgICAgIHJlc3VsdC5zdXNwaWNpb3VzUGF0dGVybnMucHVzaChgU3VzcGljaW91cyBmaWxlIHJlcXVlc3Q6ICR7ZW50cnkuY2xpZW50X2lwfSAtPiAke2VudHJ5LnVyaX1gKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbnRyeS51cmkuaW5jbHVkZXMoJ2FkbWluJykgfHwgZW50cnkudXJpLmluY2x1ZGVzKCd3cC0nKSB8fCBlbnRyeS51cmkuaW5jbHVkZXMoJ3BocG15YWRtaW4nKSkge1xuICAgICAgICByZXN1bHQuc3VzcGljaW91c1BhdHRlcm5zLnB1c2goYEFkbWluIHByb2JlIGF0dGVtcHQ6ICR7ZW50cnkuY2xpZW50X2lwfSAtPiAke2VudHJ5LnVyaX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXN1bHQuY2FjaGVIaXRSYXRlID0gKGNhY2hlSGl0cyAvIHJlc3VsdC50b3RhbFJlcXVlc3RzKSAqIDEwMDtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBwcmludEFuYWx5c2lzUmVwb3J0KHJlc3VsdDogQW5hbHlzaXNSZXN1bHQpOiB2b2lkIHtcbiAgY29uc29sZS5sb2coJ1xcbj09PSBDbG91ZEZyb250IExvZyBBbmFseXNpcyBSZXBvcnQgPT09XFxuJyk7XG4gIFxuICBjb25zb2xlLmxvZyhgVG90YWwgUmVxdWVzdHM6ICR7cmVzdWx0LnRvdGFsUmVxdWVzdHMudG9Mb2NhbGVTdHJpbmcoKX1gKTtcbiAgY29uc29sZS5sb2coYFRvdGFsIEJhbmR3aWR0aDogJHsocmVzdWx0LnRvdGFsQmFuZHdpZHRoIC8gMTAyNCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpfSBHQmApO1xuICBjb25zb2xlLmxvZyhgQ2FjaGUgSGl0IFJhdGU6ICR7cmVzdWx0LmNhY2hlSGl0UmF0ZS50b0ZpeGVkKDIpfSVcXG5gKTtcblxuICAvLyBUb3AgSVBzIGJ5IHJlcXVlc3QgY291bnRcbiAgY29uc29sZS5sb2coJ1RvcCAxMCBJUHMgYnkgUmVxdWVzdCBDb3VudDonKTtcbiAgY29uc3Qgc29ydGVkSVBzID0gQXJyYXkuZnJvbShyZXN1bHQudG9wSVBzLmVudHJpZXMoKSlcbiAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG4gICAgLnNsaWNlKDAsIDEwKTtcbiAgXG4gIHNvcnRlZElQcy5mb3JFYWNoKChbaXAsIGNvdW50XSkgPT4ge1xuICAgIGNvbnN0IGJhbmR3aWR0aCA9IHJlc3VsdC5iYW5kd2lkdGhCeUlQLmdldChpcCkgfHwgMDtcbiAgICBjb25zb2xlLmxvZyhgICAke2lwfTogJHtjb3VudC50b0xvY2FsZVN0cmluZygpfSByZXF1ZXN0cywgJHsoYmFuZHdpZHRoIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMil9IE1CYCk7XG4gIH0pO1xuXG4gIC8vIFRvcCBiYW5kd2lkdGggY29uc3VtZXJzXG4gIGNvbnNvbGUubG9nKCdcXG5Ub3AgMTAgQmFuZHdpZHRoIENvbnN1bWVyczonKTtcbiAgY29uc3Qgc29ydGVkQmFuZHdpZHRoID0gQXJyYXkuZnJvbShyZXN1bHQuYmFuZHdpZHRoQnlJUC5lbnRyaWVzKCkpXG4gICAgLnNvcnQoKGEsIGIpID0+IGJbMV0gLSBhWzFdKVxuICAgIC5zbGljZSgwLCAxMCk7XG4gIFxuICBzb3J0ZWRCYW5kd2lkdGguZm9yRWFjaCgoW2lwLCBieXRlc10pID0+IHtcbiAgICBjb25zdCByZXF1ZXN0cyA9IHJlc3VsdC50b3BJUHMuZ2V0KGlwKSB8fCAwO1xuICAgIGNvbnNvbGUubG9nKGAgICR7aXB9OiAkeyhieXRlcyAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpfSBNQiAoJHtyZXF1ZXN0c30gcmVxdWVzdHMpYCk7XG4gIH0pO1xuXG4gIC8vIE1vc3QgcmVxdWVzdGVkIHBhdGhzXG4gIGNvbnNvbGUubG9nKCdcXG5Ub3AgMTAgUmVxdWVzdGVkIFBhdGhzOicpO1xuICBjb25zdCBzb3J0ZWRQYXRocyA9IEFycmF5LmZyb20ocmVzdWx0LnRvcFBhdGhzLmVudHJpZXMoKSlcbiAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG4gICAgLnNsaWNlKDAsIDEwKTtcbiAgXG4gIHNvcnRlZFBhdGhzLmZvckVhY2goKFtwYXRoLCBjb3VudF0pID0+IHtcbiAgICBjb25zb2xlLmxvZyhgICAke3BhdGh9OiAke2NvdW50LnRvTG9jYWxlU3RyaW5nKCl9IHJlcXVlc3RzYCk7XG4gIH0pO1xuXG4gIC8vIEVycm9yIHBhdGhzXG4gIGlmIChyZXN1bHQuZXJyb3JQYXRocy5zaXplID4gMCkge1xuICAgIGNvbnNvbGUubG9nKCdcXG5Ub3AgRXJyb3IgUGF0aHMgKDR4eC81eHgpOicpO1xuICAgIGNvbnN0IHNvcnRlZEVycm9ycyA9IEFycmF5LmZyb20ocmVzdWx0LmVycm9yUGF0aHMuZW50cmllcygpKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGJbMV0gLSBhWzFdKVxuICAgICAgLnNsaWNlKDAsIDEwKTtcbiAgICBcbiAgICBzb3J0ZWRFcnJvcnMuZm9yRWFjaCgoW3BhdGgsIGNvdW50XSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coYCAgJHtwYXRofTogJHtjb3VudH0gZXJyb3JzYCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBTdXNwaWNpb3VzIHBhdHRlcm5zXG4gIGlmIChyZXN1bHQuc3VzcGljaW91c1BhdHRlcm5zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZygnXFxu4pqg77iPICBTVVNQSUNJT1VTIFBBVFRFUk5TIERFVEVDVEVEOicpO1xuICAgIHJlc3VsdC5zdXNwaWNpb3VzUGF0dGVybnMuc2xpY2UoMCwgMjApLmZvckVhY2gocGF0dGVybiA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgICAtICR7cGF0dGVybn1gKTtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0LnN1c3BpY2lvdXNQYXR0ZXJucy5sZW5ndGggPiAyMCkge1xuICAgICAgY29uc29sZS5sb2coYCAgLi4uIGFuZCAke3Jlc3VsdC5zdXNwaWNpb3VzUGF0dGVybnMubGVuZ3RoIC0gMjB9IG1vcmVgKTtcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZygnXFxuPT09IEVuZCBvZiBSZXBvcnQgPT09XFxuJyk7XG59XG5cbi8vIE1haW4gZXhlY3V0aW9uXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSgyKTtcbiAgY29uc3QgYnVja2V0SW5kZXggPSBhcmdzLmluZGV4T2YoJy0tYnVja2V0Jyk7XG4gIGNvbnN0IHByZWZpeEluZGV4ID0gYXJncy5pbmRleE9mKCctLXByZWZpeCcpO1xuICBjb25zdCBob3Vyc0luZGV4ID0gYXJncy5pbmRleE9mKCctLWhvdXJzJyk7XG5cbiAgaWYgKGJ1Y2tldEluZGV4ID09PSAtMSB8fCBidWNrZXRJbmRleCArIDEgPj0gYXJncy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVc2FnZTogbnB4IHRzLW5vZGUgYW5hbHl6ZS1jbG91ZGZyb250LWxvZ3MudHMgLS1idWNrZXQgPGJ1Y2tldC1uYW1lPiAtLXByZWZpeCA8bG9nLXByZWZpeD4gWy0taG91cnMgPGhvdXJzLWJhY2s+XScpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IGJ1Y2tldCA9IGFyZ3NbYnVja2V0SW5kZXggKyAxXTtcbiAgY29uc3QgcHJlZml4ID0gcHJlZml4SW5kZXggIT09IC0xID8gYXJnc1twcmVmaXhJbmRleCArIDFdIDogJyc7XG4gIGNvbnN0IGhvdXJzID0gaG91cnNJbmRleCAhPT0gLTEgPyBwYXJzZUludChhcmdzW2hvdXJzSW5kZXggKyAxXSwgMTApIDogMjQ7XG5cbiAgY29uc29sZS5sb2coYEFuYWx5emluZyBsb2dzIGZyb20gczM6Ly8ke2J1Y2tldH0vJHtwcmVmaXh9IGZvciB0aGUgbGFzdCAke2hvdXJzfSBob3Vycy4uLmApO1xuXG4gIGFuYWx5emVDbG91ZEZyb250TG9ncyhidWNrZXQsIHByZWZpeCwgaG91cnMpXG4gICAgLnRoZW4ocHJpbnRBbmFseXNpc1JlcG9ydClcbiAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgYW5hbHl6aW5nIGxvZ3M6JywgZXJyb3IpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgeyBhbmFseXplQ2xvdWRGcm9udExvZ3MsIHByaW50QW5hbHlzaXNSZXBvcnQgfTsiXX0=
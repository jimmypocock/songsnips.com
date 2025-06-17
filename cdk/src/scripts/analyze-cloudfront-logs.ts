#!/usr/bin/env ts-node

/**
 * CloudFront Log Analyzer
 * 
 * This script analyzes CloudFront logs stored in S3 to identify potential attack patterns.
 * Run this when you receive alerts to investigate further.
 * 
 * Usage: 
 *   npx ts-node scripts/analyze-cloudfront-logs.ts --bucket your-logs-bucket --prefix cloudfront/
 */

import * as AWS from 'aws-sdk';
import * as readline from 'readline';
import * as zlib from 'zlib';

const s3 = new AWS.S3();

interface CloudFrontLogEntry {
  date: string;
  time: string;
  edge_location: string;
  bytes: number;
  client_ip: string;
  method: string;
  host: string;
  uri: string;
  status: number;
  referer: string;
  user_agent: string;
  query_string: string;
  cookie: string;
  result_type: string;
  request_id: string;
}

interface AnalysisResult {
  topIPs: Map<string, number>;
  topPaths: Map<string, number>;
  errorPaths: Map<string, number>;
  bandwidthByIP: Map<string, number>;
  suspiciousPatterns: string[];
  totalRequests: number;
  totalBandwidth: number;
  cacheHitRate: number;
}

async function analyzeCloudFrontLogs(bucket: string, prefix: string, hoursBack: number = 24): Promise<AnalysisResult> {
  const result: AnalysisResult = {
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
    if (!object.Key || !object.Key.endsWith('.gz')) continue;

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
      if (line.startsWith('#')) continue; // Skip comment lines

      const fields = line.split('\t');
      if (fields.length < 15) continue;

      const entry: CloudFrontLogEntry = {
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
      if (entryTime < cutoffTime) continue;

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

function printAnalysisReport(result: AnalysisResult): void {
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

export { analyzeCloudFrontLogs, printAnalysisReport };